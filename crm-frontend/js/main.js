(function () {


  let TIMEOUT = null;

  function createHeader() {
    const header = document.createElement('header');
    header.classList.add('header');

    const pic = document.createElement('picture')
    pic.classList.add('logo', 'header__logo');

    const mainLogo = document.createElement('source');
    mainLogo.setAttribute('srcset', './img/main-logo.svg');
    mainLogo.setAttribute('media', '(min-width: 567px)');

    const smallLogo = document.createElement('img');
    smallLogo.setAttribute('src', './img/logo-small.svg');
    smallLogo.setAttribute('alt', 'лого');
    pic.append(mainLogo);
    pic.append(smallLogo);

    header.append(pic);

    const form = document.createElement('form');
    form.classList.add('header__form');

    const input = document.createElement('input');

    input.placeholder = 'Введите запрос';
    input.setAttribute('type', 'text')
    input.maxLength = 68;

    input.classList.add('header__input');
    input.addEventListener('input', async ()=> {
      if (document.querySelector('.search-list')) {
        document.querySelector('.search-list').remove();
      }
      if (document.querySelector('.found-client')) {
        document.querySelector('.found-client').classList.remove('found-client');
      }


      const list = document.createElement('ul');
      list.classList.add('search-list');
      const form = document.querySelector('.header__form');
      form.append(list)


      const inputValue = document.querySelector('.header__input').value;

      const clients = await getClient(inputValue);
      createListClients(list, clients, form);

      if (!inputValue.trim()) {
        list.remove();
      }


    });

    function createListClients(ul, array, form) {
      ul.innerHTML = '';
      array.forEach(el => {
        const li = document.createElement('li');
        li.classList.add('search-list__item');
        const link = document.createElement('a');
        link.classList.add('search-client-link');
        link.setAttribute('href', el.id);
        link.textContent = el.name + ' ' + el.surname;
        link.addEventListener('click', function name(e) {
          e.preventDefault();
          const linkOnCLient = this.getAttribute('href');
          const tr = document.querySelector(`[data-id="${linkOnCLient}"]`).closest('.tr');
          tr.classList.add('found-client');
          tr.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        ul.remove();
        form.reset();
        });
        li.append(link);
        ul.append(li);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input.value.trim()) {
        return;
      }
      clearTimeout(TIMEOUT);
      TIMEOUT = setTimeout(showClients, 300);
      setTimeout(()=>{
        form.reset()
      }, 300);

    });

    form.append(input);
    header.append(form);

    return {
      header,
      form,
      input,
    }

  }


  async function getClient(info) {
    const responce = await fetch(`http://localhost:3000/api/clients?search=${info}`);
    const data = await responce.json();
    return data;
  }

  async function showClients() {
    const inputValue = document.querySelector('.header__input').value;
    const clients = await getClient(inputValue);
    const table = document.querySelector('.tbody');
    createRows(table, clients);
  }

  function createRows(table, array) {
    table.innerHTML = '';
    array.forEach(el => {
      const newRow = createRow();
      const filledRow = fillRow(newRow, el);
      table.append(filledRow);
    });
  }


  function createRow() {
    const tr = document.createElement('tr');
    tr.classList.add('tr');
    for (let index = 0; index < 6; index++) {
      const td = document.createElement('td');
      td.classList.add('td');
      if (index === 2 || index === 3) {
        const dateSpan = document.createElement('span');
        dateSpan.classList.add('date');
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('time');
        td.append(dateSpan);
        td.append(timeSpan);
      }
      tr.append(td);
    }
    return tr;
  }

  function fillRow(row, client) {
    row.children[0].textContent = client.id;
    row.children[1].textContent = client.surname + " " + client.name + " " + client.lastName;
    row.children[2].firstChild.textContent = new Date(client.createdAt).toLocaleDateString();
    row.children[3].firstChild.textContent = new Date(client.updatedAt).toLocaleDateString();
    row.children[2].lastChild.textContent = new Date(client.createdAt).toLocaleTimeString().substr(0, 5);
    row.children[3].lastChild.textContent = new Date(client.updatedAt).toLocaleTimeString().substr(0, 5);
    if (client.contacts.length !== 0) {
      row.children[4].append(createContacts(client.contacts));
    }
    row.children[5].append(createEditBtn(client.id));
    row.children[5].append(createDeleteBtn(client.id));
    return row;
  }


  window.addEventListener('hashchange', function () {
    const hash = window.location.hash.substring(1);
    let popUp;
     if (hash) {
       if (hash.includes('del')) {
        const btn = document.querySelector(`.delete-btn[data-hash="${hash}"]`)
        const tr = btn.closest('.tr')
       popUp = createDeletePopUp(btn.dataset.id, tr);
       } else {
        const btn = document.querySelector(`.edit-btn[data-id="${hash}"]`)
        const tr = btn.closest('.tr')
        popUp = createPopUp(tr, btn);
       }
      document.body.append(popUp)
      setTimeout(addVisabiltyToPopup, 100, popUp)
    }

  })



  function createMainBody() {
    const main = document.createElement('main');
    main.classList.add('main');
    return main;

  }



  function createSection(sectionName, title, titleClass) {
    const section = document.createElement('section');
    section.classList.add(sectionName);
    const container = document.createElement('div');
    container.classList.add('container', `${sectionName}__container`);
    section.append(container);
    const heading = document.createElement('h1');
    heading.textContent = title;
    heading.classList.add(titleClass);

    container.append(heading);


    return {
      section,
      container
    };
  }


  function sortByUpdate(array) {
    array.sort((a, b) => {
      if (!b) {
        return array;
      }
      const firstUpdate = Date.parse(a.updatedAt);
      const secondUpdate = Date.parse(b.updatedAt);
      return firstUpdate - secondUpdate;
    });
    return array;
  }

  function sortByName(array) {
    array.sort((a, b) => {
      if (!b) {
        return array;
      }
      const firstFullName = a.surname + a.name + a.lastName;
      const secondFullName = b.surname + b.name + b.lastName;
      if (firstFullName > secondFullName) {
        return 1;
      }

      if (firstFullName < secondFullName) {
        return -1;
      }

      if (firstFullName === secondFullName) {
        return 0;
      }
    });
    return array;
  }


  function sortByID(array) {
    array.sort((a, b) => {
      if (!b) {
        return array;
      }
      const firstID = a.id;
      const secondID = b.id;
      return firstID - secondID;
    });
    return array;
  }


  function sortByDate(array) {
    array.sort((a, b) => {
      if (!b) {
        return array;
      }
      const firstDate = Date.parse(a.createdAt);
      const secondDate = Date.parse(b.createdAt);
      return firstDate - secondDate;
    });
    return array;
  }

  async function getClients() {
    const responce = await fetch('http://localhost:3000/api/clients');
    const data = await responce.json();
    return data;
  }

  function createTable() {
    const arrayOfHeaders = [{
      name: 'ID',
      button: true
    }, {
      name: 'Фамилия Имя Отчество',
      button: true
    }, {
      name: 'Дата и время создания',
      button: true
    }, {
      name: 'Последние изменения',
      button: true
    }, {
      name: 'Контакты',
      button: false
    }, {
      name: 'Действия',
      button: false
    }]

    const heading = document.createElement('caption');
    heading.textContent = 'Клиенты';
    heading.classList.add('clients__table-heading');





    function sortRows(state, type) {
      if (state.sortType === type) {
        if (!state.reversed) {
          state.reversed = true
          createRows(tableBody, sortClients(state, type));
        } else {
          state.reversed = false;
          createRows(tableBody, sortClients(state).reverse());
        }
      } else {
        if (!state.sortType && type === 'byID') {
          createRows(tableBody, sortClients(state, type).reverse());
        } else {
          state.reversed = true
          createRows(tableBody, sortClients(state, type));
        }

      }
    }


    const table = document.createElement('table');
    table.classList.add('clients__table');
    const tHead = document.createElement('thead');
    tHead.classList.add('thead');
    const tableHeadRow = document.createElement('tr');
    tableHeadRow.classList.add('tr');
    tHead.append(tableHeadRow);
    table.append(tHead);
    const tableBody = document.createElement('tbody');
    tableBody.classList.add('tbody');


    function createTableHeaders(header) {
      const th = document.createElement('th');
      th.classList.add('th');
      if (header.button) {
        const headerButton = document.createElement('button');
        headerButton.classList.add('th__btn');
        headerButton.textContent = header.name;
        const arrow = document.createElement('span');
        arrow.classList.add('th__arrow');
        if (header.name === 'Фамилия Имя Отчество') {
          const arrowText = document.createElement('span')
          arrowText.textContent = 'А-Я';
          arrowText.classList.add('th__arrow_letters');
          headerButton.append(arrowText)
        }
        headerButton.append(arrow);
        th.append(headerButton);
      } else {
        th.textContent = header.name;
      }
      switch (header.name) {
        case 'ID':
          th.children[0].lastChild.classList.add('th__arrow_active');
          th.classList.add('th_id');
          th.firstChild.addEventListener('click', async function () {
            sortRows(state, 'byID');
            changeArrowsDirection(th.children[0].lastChild, 'byID');
          })
          break;
        case 'Фамилия Имя Отчество':
          th.classList.add('th_name');
          th.firstChild.addEventListener('click', async function () {
            sortRows(state, 'byName')
            changeArrowsDirection(th.children[0].lastChild, 'byName');
          })
          break;
        case 'Дата и время создания':
          th.classList.add('th_created');
          th.firstChild.addEventListener('click', async function () {
            sortRows(state, 'byDate')
            changeArrowsDirection(th.children[0].lastChild, 'byDate');
          })
          break;
        case 'Последние изменения':
          th.classList.add('th_updated');
          th.firstChild.addEventListener('click', async function () {
            sortRows(state, 'byUpdate')
            changeArrowsDirection(th.children[0].lastChild, 'byUpdate');
          })
          break;
        case 'Контакты':
          th.classList.add('th_contacts');
          break;

        default:
          th.classList.add('th_action');
          break;
      }
      return th;
    }

    arrayOfHeaders.forEach(el => {
      const th = createTableHeaders(el);
      tableHeadRow.append(th);
    })

    const tableWrapper = document.createElement('div')
    tableWrapper.classList.add('clients__table-wrapper')

    table.append(tableBody);
    table.prepend(heading);
    tableWrapper.append(table)


    return {
      tableWrapper,
      table,
      tableBody,
    };

  }

  function changeArrowsDirection(arrow, sortType) {
    const activeArrows = document.querySelectorAll('.th__arrow_active');
    switch (sortType) {
      case 'byID':
        if (!arrow.classList.contains('th__arrow_active')) {
          activeArrows.forEach(el => {
            el.classList.remove('th__arrow_active');
          })
          arrow.classList.add('th__arrow_active');
        } else {
          arrow.classList.remove('th__arrow_active');
        }
        break;
      case 'byName':
        if (!arrow.classList.contains('th__arrow_active')) {
          activeArrows.forEach(el => {
            el.classList.remove('th__arrow_active');
          })
          arrow.classList.add('th__arrow_active');
        } else {
          arrow.classList.remove('th__arrow_active');
        }

        break;
      case 'byDate':
        if (!arrow.classList.contains('th__arrow_active')) {
          activeArrows.forEach(el => {
            el.classList.remove('th__arrow_active');
          })
          arrow.classList.add('th__arrow_active');
        } else {
          arrow.classList.remove('th__arrow_active');
        }

        break;
      case 'byUpdate':
        if (!arrow.classList.contains('th__arrow_active')) {
          activeArrows.forEach(el => {
            el.classList.remove('th__arrow_active');
          })
          arrow.classList.add('th__arrow_active');
        } else {
          arrow.classList.remove('th__arrow_active');
        }
        break;
    }
  }

  const state = {
    clients: [],
    sortType: null,
    reversed: false,
  };


  function sortClients(array, type = array.sortType) {
    if (type !== array.sortType) {
      array.sortType = type;
    }
    switch (type) {
      case 'byID':
        return sortByID(array.clients);
      case 'byName':
        return sortByName(array.clients);
      case 'byDate':
        return sortByDate(array.clients)
      case 'byUpdate':
        return sortByUpdate(array.clients)
      default:
        return sortByID(array);

    }
  }

  async function deleteClient(id) {
    fetch(`http://localhost:3000/api/clients/${id}`, {
      method: 'DELETE',
    });

  }


  function listenerMouseOver(type, link) {
    link.addEventListener('mouseover', function (e) {
      const contactText = document.createElement('span');
      contactText.classList.add('contact-text');
      switch (type) {
        case 'phone':
          contactText.textContent = link.dataset.text + ": " + link.dataset.link;
          contactText.classList.add('contact-text_bold');
          break;
        case 'email':
          contactText.innerHTML = `${link.dataset.text}: <a href="mailto:${link.dataset.link}" class="text-link">${link.dataset.link}</a>`
          break;
        default:
          contactText.innerHTML = `${link.dataset.text}: <a href="${link.dataset.link}" class="text-link">${link.dataset.link.slice(link.dataset.link.lastIndexOf('/') + 1)}</a>`
          break;
      }

      e.currentTarget.append(contactText);
    })


  }

  function listenerMouseOut(link) {
    link.addEventListener('mouseout', function () {
      const text = document.querySelector('.contact-text');
      text.remove();

    })

  }

  function createLink(type, value, name) {
    const link = document.createElement('a');
    link.classList.add('link', `${name}-link`);
    switch (name) {
      case 'phone':
        link.href = `tel:${value}`;
        break;
      case 'email':
        link.href = `mailto:${value}`;
        break;

      default:
        link.href = value;
        break;
    }
    link.dataset.link = value;
    link.dataset.text = type;
    createEventListeners(name, link)
    return link;
  }


  function createEventListeners(type, link) {
    const contactLogo = document.createElement('span');
    contactLogo.classList.add('contact-logo', `contact-logo_${type}`);
    listenerMouseOver(type, link);
    listenerMouseOut(link);
    link.append(contactLogo);
  }

  function createContact(el) {
    let link;
    const li = document.createElement('li');
    li.classList.add('list-item');
    switch (el.type) {
      case 'Телефон':
        link = createLink(el.type, el.value, 'phone');
        break;
      case 'Email':
        link = createLink(el.type, el.value, 'email');
        break;
      case 'Facebook':
        link = createLink(el.type, el.value, 'facebook');
        break;
      case 'Vk':
        link = createLink(el.type, el.value, 'vk');
        break;
      default:
        link = createLink(el.type, el.value, 'common');
        break;
    }
    li.append(link);
    return li
  }



  function createContacts(array, fullRender = false) {
    const MAX_AMOUNT_OF_CONTACTS = 4;
    const list = document.createElement('ul');
    list.classList.add('contacts-list');

    if (array.length <= MAX_AMOUNT_OF_CONTACTS) {
      fullRender = true;
    } else {
      for (let index = 0; index < MAX_AMOUNT_OF_CONTACTS; index++) {
        const li = createContact(array[index]);
        list.append(li);
      }
      const addBtn = document.createElement('button');
      addBtn.classList.add('btn_full-render');
      addBtn.textContent = `+${array.length - MAX_AMOUNT_OF_CONTACTS}`;
      addBtn.addEventListener('click', function (e) {
        const td = e.target.closest('.td')
        td.innerHTML = ''
        const listToAdd = createContacts(array, true);
        td.append(listToAdd);
      })
      list.append(addBtn);

    }


    if (fullRender) {
      list.innerHTML = '';
      array.forEach(el => {
        const li = createContact(el);
        list.append(li);
      })
    }


    return list
  }


  function callDeletePopup(btn) {
    window.location.hash = btn.dataset.hash;
    document.body.style.overflow = 'hidden';
    btn.classList.remove('delete-btn_loading');
    btn.disabled = false;
  }

  function createDeleteBtn(id) {
    const btn = document.createElement('button');
    btn.textContent = 'Удалить';
    btn.classList.add('delete-btn');
    btn.dataset.id = id;
    btn.dataset.hash = `del-${id}`
    btn.addEventListener('click', function () {
      this.classList.add('delete-btn_loading');
      btn.disabled = true;
      setTimeout(callDeletePopup, 1000, this)
    })
    return btn;
  }

  function deleteClientsData(id, tr, popUp, btn) {
    deleteClient(id).then(()=>{
      setTimeout(()=>{
        popUp.classList.remove('popup_visible')
      setTimeout(()=>{
        state.clients = state.clients.filter(el => el.id !== id)
        tr.remove()
        document.body.style.overflow = 'visible';
        btn.classList.add('delete-btn_loading');
        btn.disabled = false;
        popUp.remove()
        window.location.hash = '';
      },500)
      }, 500)
    })
    }

  function createDeletePopUp(id, tr) {
    const popUp = document.createElement('div');
    popUp.classList.add('popup');
    const popUpBody = document.createElement('div');
    popUpBody.classList.add('popup__body');
    const popUpContent = document.createElement('div');
    const closePopUp = document.createElement('button');
    closePopUp.classList.add('popup__close');
    popUpContent.classList.add('popup__content', 'popup__content_delete');
    closePopUp.addEventListener('click', function () {
      popUp.classList.remove('popup_visible')
      window.location.hash = '';
      setTimeout(delayClosePopup, 500, popUp)

    })
    const popUpHeader = document.createElement('h3');
    popUpHeader.classList.add('popup__header');
    popUpHeader.textContent = 'Удалить клиента';
    const popUpDesc = document.createElement('p');
    popUpDesc.classList.add('popup__desc');
    popUpDesc.textContent = 'Вы действительно хотите удалить данного клиента?';
    const deleteBtn = document.createElement('button');
    const cancelBtn = document.createElement('button');
    deleteBtn.classList.add('popup__main-btn')
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', function () {
      const btn = document.querySelector(`.delete-btn[data-id="${id}"]`);
      deleteBtn.classList.add('popup__main-btn_loading')
      btn.classList.add('delete-btn_loading');
      document.body.style.overflow = 'hidden';
      btn.disabled = true;
      deleteClientsData(id, tr, popUp, btn)

    })
    cancelBtn.textContent = 'Отмена';
    cancelBtn.classList.add('popup__secondary-btn');
    cancelBtn.addEventListener('click', function () {
      popUp.classList.remove('popup_visible')
      setTimeout(delayClosePopup, 500, popUp)
      window.location.hash = '';
    })

    popUpContent.append(popUpHeader);
    popUpContent.append(closePopUp);
    popUpContent.append(popUpDesc);
    popUpContent.append(deleteBtn);
    popUpContent.append(cancelBtn);
    popUpBody.append(popUpContent);
    popUp.append(popUpBody);
    return popUp;
  }
  function delayClosePopup(popUp) {
    document.body.style.overflow = 'visible';
    popUp.remove();
  }

  function createPopUp(target, editBtn) {
    const popUp = document.createElement('div');
    popUp.classList.add('popup');

    const popUpBody = document.createElement('div');
    popUpBody.classList.add('popup__body');
    const popUpContent = document.createElement('div');
    const closePopUp = document.createElement('button');
    closePopUp.classList.add('popup__close');
    popUpContent.classList.add('popup__content', 'popup__contnet_add');
    closePopUp.addEventListener('click', function () {
      window.location.hash = ''
      popUp.classList.remove('popup_visible');
      setTimeout(delayClosePopup, 500, popUp)
         })
    const popUpHeader = document.createElement('h3');
    popUpHeader.classList.add('popup__header');
    if (target) {
      const headerWrapper = document.createElement('div');
      headerWrapper.classList.add('header-popup__wrapper')
      popUpHeader.textContent = 'Изменить данные';
      popUpHeader.classList.add('popup__header_edit')
      const id = document.createElement('span');
      id.classList.add('clients-id');
      id.textContent = `ID: ${editBtn.dataset.id}`;
      headerWrapper.append(popUpHeader);
      headerWrapper.append(id);
      popUpContent.append(headerWrapper);
    } else {
      popUpHeader.textContent = 'Новый клиент';
      popUpContent.append(popUpHeader);
    }
    const form = createPopUpForm(target, popUp, editBtn);
    popUpContent.append(form);
    popUpContent.append(closePopUp);
    popUpBody.append(popUpContent);
    popUp.append(popUpBody);
    return popUp;
  }

  function createOption(value, selected) {
    const option = document.createElement('option');
    option.classList.add('contact__option');
    option.textContent = value;
    option.value = value;
    if (selected) {
      option.setAttribute('selected', true);
    }
    return option;
  }

  function createSelect() {
    const select = document.createElement('select');
    select.classList.add('contact-select');
    const phoneOption = createOption('Телефон', true);
    const addPhoneOption = createOption('Доп.Контакт', false);
    const emailOption = createOption('Email', false);
    const vkOption = createOption('Vk', false);
    const fbOption = createOption('Facebook', false);
    select.addEventListener('change', function () {
      const input = this.nextElementSibling;
      switch (select.value) {
        case 'Телефон':
          input.setAttribute('type', 'tel')
          break;
        case 'Email':
          input.setAttribute('type', 'email')
          break;
        default:
          input.setAttribute('type', 'text');

      }

    })

    select.append(phoneOption);
    select.append(addPhoneOption);
    select.append(emailOption);
    select.append(vkOption);
    select.append(fbOption);

    return select;
  }

  function createContactInput(type) {
    const contactInput = document.createElement('input');
    contactInput.classList.add('contact-input');
    contactInput.placeholder = 'Введите данные контакта';
    contactInput.addEventListener('input', function () {
      if (this.classList.contains('empty-input')) {
        this.classList.remove('empty-input')
      }
    })
    switch (type) {
      case 'Телефон':
        contactInput.setAttribute('type', 'tel')
        break;
      case 'Email':
        contactInput.setAttribute('type', 'email')
        break;
      default:
        contactInput.setAttribute('type', 'text');

    }
    return contactInput;

  }

  function createContactDeleteBtn() {
    const contactDeleteBtn = document.createElement('button');
    contactDeleteBtn.classList.add('contact__delete-btn');
    contactDeleteBtn.addEventListener('mouseover', function () {
      const deleteText = document.createElement('span');
      deleteText.classList.add('delete-btn-text');
      deleteText.textContent = 'Удалить контакт';
      contactDeleteBtn.append(deleteText);
    })

    contactDeleteBtn.addEventListener('mouseout', function () {
      this.firstChild.remove()
    })
    contactDeleteBtn.addEventListener('click', function (e) {
      const addBtn = document.querySelector('.popup-add-btn');
      const listOfWrappers = document.querySelectorAll('.contact-inner-wrapper');
      e.currentTarget.closest('.contact-inner-wrapper').remove();
      if (listOfWrappers.length <= 10 && addBtn.classList.contains('visually-hidden')) {
        addBtn.classList.remove('visually-hidden');
      }
      const contactBlock = document.querySelector('.contact-wrapper')
      if (contactBlock.children && !contactBlock.classList.contains('contact-wrapper_active')) {
        contactBlock.classList.add('contact-wrapper_active');
      }
      if (contactBlock.children.length === 1) {
        contactBlock.classList.remove('contact-wrapper_active');
        addBtn.classList.remove('popup-add-btn_clicked')
      }
    })
    return contactDeleteBtn;
  }


  function createContactWrapper(type= 'Телефон') {
    const contactWrapper = document.createElement('div');
    contactWrapper.classList.add('contact-inner-wrapper');

    const contactSelect = createSelect();
    const contactInput = createContactInput(type);
    const contactDeleteBtn = createContactDeleteBtn()

    contactWrapper.append(contactSelect);
    contactWrapper.append(contactInput);
    contactWrapper.append(contactDeleteBtn);
    return contactWrapper;

  }

  function createInput(labelText, inputClass) {
    const input = document.createElement('input');
    const label = document.createElement('label');
    label.setAttribute('for', inputClass)
    input.classList.add('popup-input', `popup-input__${inputClass}`);
    input.addEventListener('input', function (e) {
      if (!e.currentTarget.classList.contains('popup-input_active')) {
        e.currentTarget.classList.add('popup-input_active')
      }
      if (!e.currentTarget.value.trim()) {
        e.currentTarget.classList.remove('popup-input_active')
      }
    })
    input.setAttribute('id', inputClass);
    input.setAttribute('type', 'text');
    label.classList.add('popup-label')
    label.textContent = labelText;
    if (labelText !== 'Отчество') {
      const starSpan = document.createElement('span');
      starSpan.classList.add('star');
      starSpan.textContent = '*';
      label.append(starSpan)
    }
    return {
      input,
      label
    };
  }

  function createEditWrapper(targetName, inputName, inputClass) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('contact-edit-wrapper');
    const wrapperElements = createInput(inputName, inputClass)
    if (targetName) {
      wrapperElements.input.value = targetName;
    }
    if (wrapperElements.input.value) {
      wrapperElements.input.classList.add('popup-input_active');
    }
    wrapper.append(wrapperElements.input);
    wrapper.append(wrapperElements.label);
    return wrapper;
  }


  function modifyFormToEdit(target, popUpForm, editBtn, cancelBtn, popUp, array) {
    const targetId = editBtn.dataset.id;
    const targetToEdit = state.clients.find(el => el.id === targetId);
    const targetName = targetToEdit.name;
    const targetPatronymic = targetToEdit.lastName;
    const targetLastName = targetToEdit.surname;
    const lastNameInput = createEditWrapper(targetLastName, 'Фамилия', 'lastname');
    const nameInput = createEditWrapper(targetName, 'Имя', 'name');
    const patronymicInput = createEditWrapper(targetPatronymic, 'Отчество', 'patronymic');

    if (targetToEdit.contacts) {
      const numberOfContacts = targetToEdit.contacts;
      for (const iterator of numberOfContacts) {
        const contactWrapper = createContactWrapper(iterator.type);
        contactWrapper.firstChild.value = iterator.type;
        contactWrapper.children[1].value = iterator.value;
        array.push(contactWrapper);
      }

    }

    cancelBtn.textContent = 'Удалить клиента';
    cancelBtn.addEventListener('click', function (e) {
      e.preventDefault()
      deleteClient(targetId).then(()=>{
        state.clients = state.clients.filter(el => el.id !== targetId);
        setTimeout(()=>{
          popUp.classList.remove('popup_visible')
          setTimeout(()=>{
            target.remove();
            popUp.remove();
            document.body.style.overflow = 'visible';
            window.location.hash = ''
          }, 500)
        },500)
      });

    })

    popUpForm.append(lastNameInput);
    popUpForm.append(nameInput);
    popUpForm.append(patronymicInput);
  }

  function inputValidation(inputName, inputLastName, contactBlock) {
    let emptyInputs = [];
    removeErrorClasses()
    const body = document.querySelector('.error-body')
    if (body) {
      body.innerHTML = ''
    }
    if (!inputName.value.trim() || !inputLastName.value.trim()) {
      const inputsArray = [inputName, inputLastName]
      const errorBody = document.createElement('div')
      errorBody.classList.add('error-body');
      errorBody.textContent = 'Ошибка:'
      emptyInputs = inputsArray.filter(el => !el.value.trim())
      console.log(emptyInputs)
      emptyInputs.forEach(el => {
        const error = document.createElement('span')
        error.classList.add('error')
        switch (el.id) {
          case 'name':
            const nameInput = document.querySelector('.popup-input__name');
            nameInput.classList.add('popup-input_error')
            error.textContent = 'Введите имя полностью';
            break;
          case 'lastname':
            const lastNameInput = document.querySelector('.popup-input__lastname');
            lastNameInput.classList.add('popup-input_error')
            error.textContent = 'Введите фамилию полностью';
            break;

        }
        errorBody.append(error);
      })
      contactBlock.after(errorBody)
      }


    const arrayOfContactsData = document.querySelectorAll('.contact-input');

    arrayOfContactsData.forEach(el => {
      if (el.classList.contains('empty-input')) {
        el.classList.remove('empty-input')
      }
    })
    const descProblem = document.querySelectorAll('.input-problem');
    descProblem.forEach(el => el.remove());
    const emptyContactInputs = Array.from(arrayOfContactsData).filter(el => !el.value.trim())
    if (emptyContactInputs.length) {
        emptyContactInputs.forEach(el => {
        el.classList.add('empty-input')
        const descProblem = document.createElement('span');
        descProblem.classList.add('input-problem')
        const type = el.getAttribute('type');
        switch (type) {
          case 'email':
            descProblem.textContent = 'Введите email полностью';
            break;
          case 'tel':
            descProblem.textContent = 'Введите телефонный номер полностью';
            break;
          default:
            descProblem.textContent = 'Введите контактные данные полностью';
            break;
        }
         el.parentElement.append(descProblem);
      })
    }

    emptyContactInputs.forEach(el => emptyInputs.push(el))

    return emptyInputs.length;
  }



  function modifyFormToAdd(popUpForm, popUp, cancelBtn) {
    const lastNameInput = createInput('Фамилия', 'lastname');
    const nameInput = createInput('Имя', 'name');
    const patronymicInput = createInput('Отчество', 'patronymic');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', function (e) {
      e.preventDefault()
     popUp.classList.remove('popup_visible')
      setTimeout(delayClosePopup, 500, popUp)
    })
    popUpForm.append(lastNameInput.input);
    popUpForm.append(lastNameInput.label);
    popUpForm.append(nameInput.input);
    popUpForm.append(nameInput.label);
    popUpForm.append(patronymicInput.input);
    popUpForm.append(patronymicInput.label);
  }

  function createPopUpForm(target, popUp, editBtn) {
    const popUpForm = document.createElement('form');

    const arrayOfContacts = [];

    popUpForm.classList.add('popup-form');
    const contactBlock = document.createElement('div');
    contactBlock.classList.add('contact-wrapper');
    const addBtn = document.createElement('button')
    addBtn.classList.add('popup-add-btn');
    addBtn.textContent = 'Добавить контакт';
    addBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!addBtn.classList.contains('popup-add-btn_clicked')) {
        addBtn.classList.add('popup-add-btn_clicked')
      }
      const listOfWrappers = document.querySelectorAll('.contact-inner-wrapper');
      const contactWrapper = createContactWrapper();
      if (!contactBlock.classList.contains('contact-wrapper_active')) {
        contactBlock.classList.add('contact-wrapper_active');
      }
      if (listOfWrappers.length === 9) {
        addBtn.before(contactWrapper);
        this.classList.add('visually-hidden');
      } else {
        addBtn.before(contactWrapper);
      }
    })

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('popup__secondary-btn', 'popup__secondary-btn_add');
    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.classList.add('popup__main-btn', 'popup__main-btn_add');
    saveBtn.textContent = 'Сохранить';

    if (target) {
      modifyFormToEdit(target, popUpForm, editBtn, cancelBtn, popUp, arrayOfContacts);

    } else {
      modifyFormToAdd(popUpForm, popUp, cancelBtn);
    }

    popUpForm.addEventListener('submit', async function (e) {
      e.preventDefault()
      const inputName = document.querySelector('.popup-input__name');
      const inputLastName = document.querySelector('.popup-input__lastname');
      const inputPatronymic = document.querySelector('.popup-input__patronymic');

      const client = {
        name: inputName.value.trim(),
        surname: inputLastName.value.trim(),
        lastName: inputPatronymic.value.trim(),
        contacts: [],
      }


    const isAnyoneEmpty =  inputValidation(inputName, inputLastName, contactBlock);

    if (isAnyoneEmpty) {
      return
    }

      const arrayOfDataWrappers = document.querySelectorAll('.contact-inner-wrapper');


      arrayOfDataWrappers.forEach(el => {
        const clientsContacts = {
          type: el.firstChild.value,
          value: el.children[1].value.trim(),
        }

        client.contacts.push(clientsContacts);
      })

      if (!target) {
        removeErrorClasses()
        createClient(client).then((clientsResponse)=> {
          if (clientsResponse.response.status === 200 || clientsResponse.response.status === 201) {
            saveBtn.classList.add('popup__main-btn_loading');
            saveBtn.disabled = true;
            state.clients.push(clientsResponse.data);
            setTimeout(()=>{
              popUp.classList.remove('popup_visible')
              setTimeout(()=>{
                saveBtn.classList.remove('popup__main-btn_loading');
                popUp.remove();
                document.body.style.overflow = 'visible';
                const table = document.querySelector('.tbody');
                sortClients( state.clients, state.sortType)
                createRows(table, state.clients)
              },500)
            },500)
           }
          else if (clientsResponse.response.status === 422) {
            addErrorWarning422(contactBlock, clientsResponse)
            return;

          }
          else {
            addErrorSomethingWrong(contactBlock);
            return
          }


        })


      } else {
        removeErrorClasses()
        const clientsId = editBtn.dataset.id;
        editClient(clientsId, client).then((editedClient)=>{
           if (editedClient.response.status === 200 || editedClient.response.status === 201) {
            saveBtn.classList.add('popup__main-btn_loading');
            saveBtn.disabled = true;
            state.clients = state.clients.map(el => {
              if (el.id === clientsId) {
                el = editedClient.data;
              }
              return el;
            })
            setTimeout(()=>{
              popUp.classList.remove('popup_visible')
              editBtn.classList.add('edit-btn_loading');
              editBtn.disabled = true;
              setTimeout(()=>{
                saveBtn.classList.remove('popup__main-btn_loading');
                popUp.remove();
                window.location.hash = ''
                document.body.style.overflow = 'visible';
                const table = document.querySelector('.tbody');
                sortClients( state.clients, state.sortType)
                createRows(table, state.clients)
              },500)
            },500)

          } else if (editedClient.response.status === 404) {
            const body = document.querySelector('.error-body')
            if (body) {
              body.innerHTML = ''
            }
            const errorBody = document.createElement('div')
            errorBody.classList.add('error-body');
            errorBody.textContent = 'Ошибка: переданный в запросе метод не существует или запрашиваемый элемент не найден в базе данных'
            return
          } else if (editedClient.response.status === 422) {
            addErrorWarning422(contactBlock, editedClient)
            return
          }
          else {
            addErrorSomethingWrong(contactBlock);
            return
          }

        })


      }

    })



    contactBlock.append(addBtn);

    popUpForm.append(contactBlock);
    popUpForm.append(saveBtn);
    popUpForm.append(cancelBtn);

    if (arrayOfContacts.length) {
      addBtn.classList.add('popup-add-btn_clicked')
      contactBlock.classList.add('contact-wrapper_active')
      arrayOfContacts.forEach(el => {
        addBtn.before(el);
      })
    }


    return popUpForm;
  }



  function removeErrorClasses() {
    const inputClasses = document.querySelectorAll('.popup-input_error');
    if (inputClasses) {
      inputClasses.forEach(el => el.classList.remove('popup-input_error'))
    }
  }

  function addErrorWarning422(contactBlock, client) {
    const body = document.querySelector('.error-body')
    if (body) {
      body.innerHTML = ''
    }
    const errorBody = document.createElement('div')
    errorBody.classList.add('error-body');
    errorBody.textContent = 'Ошибка:'
    client.data.errors.forEach(el => {
      const error = document.createElement('span')
      error.classList.add('error')
      error.textContent = el.message;
      switch (el.field) {
        case 'name':
          const nameInput = document.querySelector('.popup-input__name');
          nameInput.classList.add('popup-input_error')
          break;
        case 'surname':
          const lastNameInput = document.querySelector('.popup-input__lastname');
          lastNameInput.classList.add('popup-input_error')
          break;

      }
      errorBody.append(error);
    })
    contactBlock.after(errorBody)

  }

  function addErrorSomethingWrong(contactBlock) {
    const body = document.querySelector('.error-body')
    if (body) {
      body.innerHTML = ''
    }
    const errorBody = document.createElement('div')
    errorBody.classList.add('error-body');
    errorBody.textContent = 'Ошибка. Что-то пошло не так..'
    contactBlock.after(errorBody);

  }

  function addVisabiltyToPopup(popUp) {
    popUp.classList.add('popup_visible')

  }

  function createAddButton() {
    const btn = document.createElement('button');
    btn.classList.add('add-button');
    btn.textContent = 'Добавить клиента';
    btn.addEventListener('click', function (e) {
      const popUp = createPopUp(e.currentTarget.closest('.tr'));
      document.body.style.overflow = 'hidden';
      document.body.append(popUp);
      setTimeout(addVisabiltyToPopup, 100, popUp)
    })
    return btn;
  }

  function showPopUp(id, btn, popUp) {
    const address = id;
    window.location.hash = address;
    document.body.style.overflow = 'hidden';
    btn.disabled = false;
    btn.classList.remove('edit-btn_loading')
    setTimeout(addVisabiltyToPopup, 100, popUp)

  }


  function createEditBtn(id) {
    const btn = document.createElement('button');
    btn.textContent = 'Изменить';
    btn.dataset.id = id;
    btn.classList.add('edit-btn');
    btn.addEventListener('click', function (e) {
    const popUp = createPopUp(e.currentTarget.closest('.tr'), this);
      this.classList.add('edit-btn_loading');
      this.disabled = true;
      setTimeout(showPopUp, 1000, id, this, popUp)

    })
    return btn;
  }

  async function editClient(id, client) {
    const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(client),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json();

    return {
      response,
      data
    };
  }


  async function createClient(client) {
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify(client),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json();

    return {
      response,
      data
    };


  }

  async function addTableClass(table, wrapper) {
     if (table.lastChild.children.length) {
      wrapper.classList.add('clients__table_loading');
    } else {
      wrapper.classList.add('clients__table_no-childs');
    }

  }

  async function removeTableClass(wrapper) {
     if (wrapper.classList.contains('clients__table_no-childs')) {
      wrapper.classList.remove('clients__table_no-childs');
    } else {
      wrapper.classList.remove('clients__table_loading');
    }
  }

  function disableElements() {
    const buttons = document.querySelectorAll('button'),
      inputs = document.querySelectorAll('inputs');
    buttons.forEach(el => {
      el.disabled = true;
      if (el.classList.contains('add-button')) {
        el.classList.add('add-button_disabled')
      }
    })
    inputs.forEach(el => {
      el.disabled = true;
    })
  }

  function activeElements() {
    const buttons = document.querySelectorAll('button'),
      inputs = document.querySelectorAll('inputs');
    buttons.forEach(el => {
      el.disabled = false;
      if (el.classList.contains('add-button_disabled')) {
        el.classList.remove('add-button_disabled')
      }
    })
    inputs.forEach(el => {
      el.disabled = false;
    })
  }

  const createApp = async () => {


    const header = createHeader();
    const main = createMainBody();
    const mainSection = createSection('clients', 'Skillbus', 'visually-hidden');
    const addLink = createAddButton();
    const table = createTable();

    addTableClass(table.table,  table.tableWrapper);


    getClients().then((data) => {
      setTimeout(()=>{
        state.clients = sortClients(data, state.sortType);
        createRows(table.tableBody, state.clients);
        removeTableClass(table.tableWrapper)
      }, 1000)

    })


    mainSection.container.append(table.tableWrapper);
    mainSection.container.append(addLink);
    main.append(mainSection.section);
    document.body.append(header.header);
    document.body.append(main);

    disableElements()
    setTimeout(activeElements, 1000)

    if (window.location.hash) {
      let btn;
      let popUp;
      const hash = window.location.hash.substring(1)
      if (hash.includes('del')) {
        btn = document.querySelector(`.delete-btn[data-hash="${hash}"]`)
        const tr = btn.closest('.tr')
        popUp = createDeletePopUp(btn.dataset.id, tr);
      } else {
        btn = document.querySelector(`.edit-btn[data-id="${hash}"]`)
        const tr = clientsBtn.closest('.tr')
         popUp = createPopUp(tr, clientsBtn);
      }
      popUp.classList.add('popup_visible');
      document.body.append(popUp);
    }

    };


    document.addEventListener('DOMContentLoaded', async function () {

     createApp();



    })
    })();