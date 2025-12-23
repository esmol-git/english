import { s as slideUp, a as slideToggle, b as bodyLock, c as bodyUnlock, d as bodyLockStatus, e as bodyLockToggle, g as gotoBlock, u as uniqArray, f as getHash } from "./common.min.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let formValidate = {
  getErrors(form) {
    let error = 0;
    let formRequiredItems = form.querySelectorAll("[required]");
    if (formRequiredItems.length) {
      formRequiredItems.forEach((formRequiredItem) => {
        if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
          error += this.validateInput(formRequiredItem);
        }
      });
    }
    return error;
  },
  validateInput(formRequiredItem) {
    let error = 0;
    if (formRequiredItem.type === "email") {
      formRequiredItem.value = formRequiredItem.value.replace(" ", "");
      if (this.emailTest(formRequiredItem)) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
      this.addError(formRequiredItem);
      this.removeSuccess(formRequiredItem);
      error++;
    } else {
      if (!formRequiredItem.value.trim()) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    }
    return error;
  },
  addError(formRequiredItem) {
    formRequiredItem.classList.add("--form-error");
    formRequiredItem.parentElement.classList.add("--form-error");
    let inputError = formRequiredItem.parentElement.querySelector("[data-fls-form-error]");
    if (inputError) formRequiredItem.parentElement.removeChild(inputError);
    if (formRequiredItem.dataset.flsFormErrtext) {
      formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div data-fls-form-error>${formRequiredItem.dataset.flsFormErrtext}</div>`);
    }
  },
  removeError(formRequiredItem) {
    formRequiredItem.classList.remove("--form-error");
    formRequiredItem.parentElement.classList.remove("--form-error");
    if (formRequiredItem.parentElement.querySelector("[data-fls-form-error]")) {
      formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector("[data-fls-form-error]"));
    }
  },
  addSuccess(formRequiredItem) {
    formRequiredItem.classList.add("--form-success");
    formRequiredItem.parentElement.classList.add("--form-success");
  },
  removeSuccess(formRequiredItem) {
    formRequiredItem.classList.remove("--form-success");
    formRequiredItem.parentElement.classList.remove("--form-success");
  },
  formClean(form) {
    form.reset();
    setTimeout(() => {
      let inputs = form.querySelectorAll("input,textarea");
      for (let index = 0; index < inputs.length; index++) {
        const el = inputs[index];
        el.parentElement.classList.remove("--form-focus");
        el.classList.remove("--form-focus");
        formValidate.removeSuccess(el);
        formValidate.removeError(el);
      }
      let checkboxes = form.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });
      }
      if (window["flsSelect"]) {
        let selects = form.querySelectorAll("select[data-fls-select]");
        if (selects.length) {
          selects.forEach((select) => {
            formValidate.removeError(select);
            formValidate.removeSuccess(select);
            const selectWrapper = select.closest(".select");
            if (selectWrapper) {
              selectWrapper.classList.remove("--form-error");
              selectWrapper.classList.remove("--form-success");
              const formItem = select.closest(".popup__form-item");
              if (formItem) {
                formItem.classList.remove("--form-error");
                formItem.classList.remove("--form-success");
                const errorMsg = formItem.querySelector("[data-fls-form-error]");
                if (errorMsg) {
                  errorMsg.remove();
                }
              }
            }
            window["flsSelect"].selectBuild(select);
          });
        }
      }
    }, 0);
  },
  emailTest(formRequiredItem) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
  }
};
class SelectConstructor {
  constructor(props, data = null) {
    let defaultConfig = {
      init: true,
      speed: 150
    };
    this.config = Object.assign(defaultConfig, props);
    this.selectClasses = {
      classSelect: "select",
      // Главный блок
      classSelectBody: "select__body",
      // Тело селекта
      classSelectTitle: "select__title",
      // Заголовок
      classSelectValue: "select__value",
      // Значение в заголовке
      classSelectLabel: "select__label",
      // Лейбл
      classSelectInput: "select__input",
      // Поле ввода
      classSelectText: "select__text",
      // Оболочка текстовых данных
      classSelectLink: "select__link",
      // Ссылка в элементе
      classSelectOptions: "select__options",
      // Выпадающий список
      classSelectOptionsScroll: "select__scroll",
      // Оболочка при скролле
      classSelectOption: "select__option",
      // Пункт
      classSelectContent: "select__content",
      // Оболочка контента в заголовке
      classSelectRow: "select__row",
      // Ряд
      classSelectData: "select__asset",
      // Дополнительные данные
      classSelectDisabled: "--select-disabled",
      // Запрещено
      classSelectTag: "--select-tag",
      // Класс тега
      classSelectOpen: "--select-open",
      // Список открыт
      classSelectActive: "--select-active",
      // Список выбран
      classSelectFocus: "--select-focus",
      // Список в фокусе
      classSelectMultiple: "--select-multiple",
      // Множественный выбор
      classSelectCheckBox: "--select-checkbox",
      // Стиль чекбокса
      classSelectOptionSelected: "--select-selected",
      // Выбранный пункт
      classSelectPseudoLabel: "--select-pseudo-label"
      // Псевдолейбл
    };
    this._this = this;
    if (this.config.init) {
      const selectItems = data ? document.querySelectorAll(data) : document.querySelectorAll("select[data-fls-select]");
      if (selectItems.length) {
        this.selectsInit(selectItems);
      }
    }
  }
  // Конструктор CSS класса
  getSelectClass(className) {
    return `.${className}`;
  }
  // Геттер элементов псевдоселекта
  getSelectElement(selectItem, className) {
    return {
      originalSelect: selectItem.querySelector("select"),
      selectElement: selectItem.querySelector(this.getSelectClass(className))
    };
  }
  // Функция инициализации всех селектов
  selectsInit(selectItems) {
    selectItems.forEach((originalSelect, index) => {
      this.selectInit(originalSelect, index + 1);
    });
    document.addEventListener("click", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("keydown", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("focusin", (function(e) {
      this.selectsActions(e);
    }).bind(this));
    document.addEventListener("focusout", (function(e) {
      this.selectsActions(e);
    }).bind(this));
  }
  // Функция инициализации конкретного селекта
  selectInit(originalSelect, index) {
    index ? originalSelect.dataset.flsSelectId = index : null;
    if (originalSelect.options.length) {
      const _this = this;
      let selectItem = document.createElement("div");
      selectItem.classList.add(this.selectClasses.classSelect);
      originalSelect.parentNode.insertBefore(selectItem, originalSelect);
      selectItem.appendChild(originalSelect);
      originalSelect.hidden = true;
      if (this.getSelectPlaceholder(originalSelect)) {
        originalSelect.dataset.placeholder = this.getSelectPlaceholder(originalSelect).value;
        if (this.getSelectPlaceholder(originalSelect).label.show) {
          const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
          selectItemTitle.insertAdjacentHTML("afterbegin", `<span class="${this.selectClasses.classSelectLabel}">${this.getSelectPlaceholder(originalSelect).label.text ? this.getSelectPlaceholder(originalSelect).label.text : this.getSelectPlaceholder(originalSelect).value}</span>`);
        }
      }
      selectItem.insertAdjacentHTML("beforeend", `<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`);
      this.selectBuild(originalSelect);
      originalSelect.dataset.flsSelectSpeed = originalSelect.dataset.flsSelectSpeed ? originalSelect.dataset.flsSelectSpeed : this.config.speed;
      this.config.speed = +originalSelect.dataset.flsSelectSpeed;
      originalSelect.addEventListener("change", function(e) {
        _this.selectChange(e);
      });
    }
  }
  // Конструктор псевдоселекта
  selectBuild(originalSelect) {
    const selectItem = originalSelect.parentElement;
    if (originalSelect.id) {
      selectItem.id = originalSelect.id;
      originalSelect.removeAttribute("id");
    }
    selectItem.dataset.flsSelectId = originalSelect.dataset.flsSelectId;
    originalSelect.dataset.flsSelectModif ? selectItem.classList.add(`select--${originalSelect.dataset.flsSelectModif}`) : null;
    originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectMultiple) : selectItem.classList.remove(this.selectClasses.classSelectMultiple);
    originalSelect.hasAttribute("data-fls-select-checkbox") && originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectCheckBox) : selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
    this.setSelectTitleValue(selectItem, originalSelect);
    this.setOptions(selectItem, originalSelect);
    originalSelect.hasAttribute("data-fls-select-search") ? this.searchActions(selectItem) : null;
    originalSelect.hasAttribute("data-fls-select-open") ? this.selectAction(selectItem) : null;
    this.selectDisabled(selectItem, originalSelect);
  }
  // Функция реакций на события
  selectsActions(e) {
    const t = e.target, type = e.type;
    const isSelect = t.closest(this.getSelectClass(this.selectClasses.classSelect));
    const isTag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
    if (!isSelect && !isTag) return this.selectsСlose();
    const selectItem = isSelect || document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${isTag.dataset.flsSelectId}"]`);
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    if (originalSelect.disabled) return;
    if (type === "click") {
      const tag = t.closest(this.getSelectClass(this.selectClasses.classSelectTag));
      const title = t.closest(this.getSelectClass(this.selectClasses.classSelectTitle));
      const option = t.closest(this.getSelectClass(this.selectClasses.classSelectOption));
      if (tag) {
        const optionItem = document.querySelector(`.${this.selectClasses.classSelect}[data-fls-select-id="${tag.dataset.flsSelectId}"] .select__option[data-fls-select-value="${tag.dataset.flsSelectValue}"]`);
        this.optionAction(selectItem, originalSelect, optionItem);
      } else if (title) {
        this.selectAction(selectItem);
      } else if (option) {
        this.optionAction(selectItem, originalSelect, option);
      }
    } else if (type === "focusin" || type === "focusout") {
      if (isSelect) selectItem.classList.toggle(this.selectClasses.classSelectFocus, type === "focusin");
    } else if (type === "keydown" && e.code === "Escape") {
      this.selectsСlose();
    }
  }
  // Функция закрытия всех селектов
  selectsСlose(selectOneGroup) {
    const selectsGroup = selectOneGroup ? selectOneGroup : document;
    const selectActiveItems = selectsGroup.querySelectorAll(`${this.getSelectClass(this.selectClasses.classSelect)}${this.getSelectClass(this.selectClasses.classSelectOpen)}`);
    if (selectActiveItems.length) {
      selectActiveItems.forEach((selectActiveItem) => {
        this.selectСlose(selectActiveItem);
      });
    }
  }
  // Функция закрытия конкретного селекта
  selectСlose(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    if (!selectOptions.classList.contains("_slide")) {
      selectItem.classList.remove(this.selectClasses.classSelectOpen);
      slideUp(selectOptions, originalSelect.dataset.flsSelectSpeed);
      setTimeout(() => {
        selectItem.style.zIndex = "";
      }, originalSelect.dataset.flsSelectSpeed);
    }
  }
  // Функция открытия/закрытия конкретного селекта
  selectAction(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
    const selectOpenzIndex = originalSelect.dataset.flsSelectZIndex ? originalSelect.dataset.flsSelectZIndex : 3;
    this.setOptionsPosition(selectItem);
    if (originalSelect.closest("[data-fls-select-one]")) {
      const selectOneGroup = originalSelect.closest("[data-fls-select-one]");
      this.selectsСlose(selectOneGroup);
    }
    setTimeout(() => {
      if (!selectOptions.classList.contains("--slide")) {
        selectItem.classList.toggle(this.selectClasses.classSelectOpen);
        slideToggle(selectOptions, originalSelect.dataset.flsSelectSpeed);
        if (selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
          selectItem.style.zIndex = selectOpenzIndex;
        } else {
          setTimeout(() => {
            selectItem.style.zIndex = "";
          }, originalSelect.dataset.flsSelectSpeed);
        }
      }
    }, 0);
  }
  // Сеттер значения заголовка селекта
  setSelectTitleValue(selectItem, originalSelect) {
    const selectItemBody = this.getSelectElement(selectItem, this.selectClasses.classSelectBody).selectElement;
    const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
    if (selectItemTitle) selectItemTitle.remove();
    selectItemBody.insertAdjacentHTML("afterbegin", this.getSelectTitleValue(selectItem, originalSelect));
    originalSelect.hasAttribute("data-fls-select-search") ? this.searchActions(selectItem) : null;
  }
  // Конструктор значения заголовка
  getSelectTitleValue(selectItem, originalSelect) {
    let selectTitleValue = this.getSelectedOptionsData(originalSelect, 2).html;
    if (originalSelect.multiple && originalSelect.hasAttribute("data-fls-select-tags")) {
      selectTitleValue = this.getSelectedOptionsData(originalSelect).elements.map((option) => `<span role="button" data-fls-select-id="${selectItem.dataset.flsSelectId}" data-fls-select-value="${option.value}" class="--select-tag">${this.getSelectElementContent(option)}</span>`).join("");
      if (originalSelect.dataset.flsSelectTags && document.querySelector(originalSelect.dataset.flsSelectTags)) {
        document.querySelector(originalSelect.dataset.flsSelectTags).innerHTML = selectTitleValue;
        if (originalSelect.hasAttribute("data-fls-select-search")) selectTitleValue = false;
      }
    }
    selectTitleValue = selectTitleValue.length ? selectTitleValue : originalSelect.dataset.flsSelectPlaceholder || "";
    if (!originalSelect.hasAttribute("data-fls-select-tags")) {
      selectTitleValue = selectTitleValue ? selectTitleValue.map((item) => item.replace(/"/g, "&quot;")) : "";
    }
    let pseudoAttribute = "";
    let pseudoAttributeClass = "";
    if (originalSelect.hasAttribute("data-fls-select-pseudo-label")) {
      pseudoAttribute = originalSelect.dataset.flsSelectPseudoLabel ? ` data-fls-select-pseudo-label="${originalSelect.dataset.flsSelectPseudoLabel}"` : ` data-fls-select-pseudo-label="Заполните атрибут"`;
      pseudoAttributeClass = ` ${this.selectClasses.classSelectPseudoLabel}`;
    }
    this.getSelectedOptionsData(originalSelect).values.length ? selectItem.classList.add(this.selectClasses.classSelectActive) : selectItem.classList.remove(this.selectClasses.classSelectActive);
    if (originalSelect.hasAttribute("data-fls-select-search")) {
      return `<div class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectTitleValue}" data-fls-select-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`;
    } else {
      const customClass = this.getSelectedOptionsData(originalSelect).elements.length && this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass ? ` ${this.getSelectedOptionsData(originalSelect).elements[0].dataset.flsSelectClass}` : "";
      return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}${pseudoAttributeClass}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
    }
  }
  // Конструктор данных для значения заголовка
  getSelectElementContent(selectOption) {
    const selectOptionData = selectOption.dataset.flsSelectAsset ? `${selectOption.dataset.flsSelectAsset}` : "";
    const selectOptionDataHTML = selectOptionData.indexOf("img") >= 0 ? `<img src="${selectOptionData}" alt="">` : selectOptionData;
    let selectOptionContentHTML = ``;
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectRow}">` : "";
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectData}">` : "";
    selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : "";
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectText}">` : "";
    selectOptionContentHTML += selectOption.textContent;
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    selectOptionContentHTML += selectOptionData ? `</span>` : "";
    return selectOptionContentHTML;
  }
  // Получение данных плейсхолдера
  getSelectPlaceholder(originalSelect) {
    const selectPlaceholder = Array.from(originalSelect.options).find((option) => !option.value);
    if (selectPlaceholder) {
      return {
        value: selectPlaceholder.textContent,
        show: selectPlaceholder.hasAttribute("data-fls-select-show"),
        label: {
          show: selectPlaceholder.hasAttribute("data-fls-select-label"),
          text: selectPlaceholder.dataset.flsSelectLabel
        }
      };
    }
  }
  // Получение данных из выбранных элементов
  getSelectedOptionsData(originalSelect, type) {
    let selectedOptions = [];
    if (originalSelect.multiple) {
      selectedOptions = Array.from(originalSelect.options).filter((option) => option.value).filter((option) => option.selected);
    } else {
      selectedOptions.push(originalSelect.options[originalSelect.selectedIndex]);
    }
    return {
      elements: selectedOptions.map((option) => option),
      values: selectedOptions.filter((option) => option.value).map((option) => option.value),
      html: selectedOptions.map((option) => this.getSelectElementContent(option))
    };
  }
  // Конструктор элементов списка
  getOptions(originalSelect) {
    const selectOptionsScroll = originalSelect.hasAttribute("data-fls-select-scroll") ? `` : "";
    +originalSelect.dataset.flsSelectScroll ? +originalSelect.dataset.flsSelectScroll : null;
    let selectOptions = Array.from(originalSelect.options);
    if (selectOptions.length > 0) {
      let selectOptionsHTML = ``;
      if (this.getSelectPlaceholder(originalSelect) && !this.getSelectPlaceholder(originalSelect).show || originalSelect.multiple) {
        selectOptions = selectOptions.filter((option) => option.value);
      }
      selectOptionsHTML += `<div ${selectOptionsScroll} ${""} class="${this.selectClasses.classSelectOptionsScroll}">`;
      selectOptions.forEach((selectOption) => {
        selectOptionsHTML += this.getOption(selectOption, originalSelect);
      });
      selectOptionsHTML += `</div>`;
      return selectOptionsHTML;
    }
  }
  // Конструктор конкретного элемента списка
  getOption(selectOption, originalSelect) {
    const selectOptionSelected = selectOption.selected && originalSelect.multiple ? ` ${this.selectClasses.classSelectOptionSelected}` : "";
    const selectOptionHide = selectOption.selected && !originalSelect.hasAttribute("data-fls-select-show-selected") && !originalSelect.multiple ? `hidden` : ``;
    const selectOptionClass = selectOption.dataset.flsSelectClass ? ` ${selectOption.dataset.flsSelectClass}` : "";
    const selectOptionLink = selectOption.dataset.flsSelectHref ? selectOption.dataset.flsSelectHref : false;
    const selectOptionLinkTarget = selectOption.hasAttribute("data-fls-select-href-blank") ? `target="_blank"` : "";
    let selectOptionHTML = ``;
    selectOptionHTML += selectOptionLink ? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-fls-select-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">` : `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-fls-select-value="${selectOption.value}" type="button">`;
    selectOptionHTML += this.getSelectElementContent(selectOption);
    selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
    return selectOptionHTML;
  }
  // Сеттер элементов списка (options)
  setOptions(selectItem, originalSelect) {
    const selectItemOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectItemOptions.innerHTML = this.getOptions(originalSelect);
  }
  // Определяем, где отобразить выпадающий список
  setOptionsPosition(selectItem) {
    const originalSelect = this.getSelectElement(selectItem).originalSelect;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    const selectItemScroll = this.getSelectElement(selectItem, this.selectClasses.classSelectOptionsScroll).selectElement;
    const customMaxHeightValue = +originalSelect.dataset.flsSelectScroll ? `${+originalSelect.dataset.flsSelectScroll}px` : ``;
    const selectOptionsPosMargin = +originalSelect.dataset.flsSelectOptionsMargin ? +originalSelect.dataset.flsSelectOptionsMargin : 10;
    if (!selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
      selectOptions.hidden = false;
      const selectItemScrollHeight = selectItemScroll.offsetHeight ? selectItemScroll.offsetHeight : parseInt(window.getComputedStyle(selectItemScroll).getPropertyValue("max-height"));
      const selectOptionsHeight = selectOptions.offsetHeight > selectItemScrollHeight ? selectOptions.offsetHeight : selectItemScrollHeight + selectOptions.offsetHeight;
      const selectOptionsScrollHeight = selectOptionsHeight - selectItemScrollHeight;
      selectOptions.hidden = true;
      const selectItemHeight = selectItem.offsetHeight;
      const selectItemPos = selectItem.getBoundingClientRect().top;
      const selectItemTotal = selectItemPos + selectOptionsHeight + selectItemHeight + selectOptionsScrollHeight;
      const selectItemResult = window.innerHeight - (selectItemTotal + selectOptionsPosMargin);
      if (selectItemResult < 0) {
        const newMaxHeightValue = selectOptionsHeight + selectItemResult;
        if (newMaxHeightValue < 100) {
          selectItem.classList.add("select--show-top");
          selectItemScroll.style.maxHeight = selectItemPos < selectOptionsHeight ? `${selectItemPos - (selectOptionsHeight - selectItemPos)}px` : customMaxHeightValue;
        } else {
          selectItem.classList.remove("select--show-top");
          selectItemScroll.style.maxHeight = `${newMaxHeightValue}px`;
        }
      }
    } else {
      setTimeout(() => {
        selectItem.classList.remove("select--show-top");
        selectItemScroll.style.maxHeight = customMaxHeightValue;
      }, +originalSelect.dataset.flsSelectSpeed);
    }
  }
  // Обработчик клика на пункт списка
  optionAction(selectItem, originalSelect, optionItem) {
    const optionsBox = selectItem.querySelector(this.getSelectClass(this.selectClasses.classSelectOptions));
    if (optionsBox.classList.contains("--slide")) return;
    if (originalSelect.multiple) {
      optionItem.classList.toggle(this.selectClasses.classSelectOptionSelected);
      const selectedEls = this.getSelectedOptionsData(originalSelect).elements;
      for (const el of selectedEls) {
        el.removeAttribute("selected");
      }
      const selectedUI = selectItem.querySelectorAll(this.getSelectClass(this.selectClasses.classSelectOptionSelected));
      for (const el of selectedUI) {
        const val = el.dataset.flsSelectValue;
        const opt = originalSelect.querySelector(`option[value="${val}"]`);
        if (opt) opt.setAttribute("selected", "selected");
      }
    } else {
      if (!originalSelect.hasAttribute("data-fls-select-show-selected")) {
        setTimeout(() => {
          const hiddenOpt = selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`);
          if (hiddenOpt) hiddenOpt.hidden = false;
          optionItem.hidden = true;
        }, this.config.speed);
      }
      originalSelect.value = optionItem.dataset.flsSelectValue || optionItem.textContent;
      this.selectAction(selectItem);
    }
    this.setSelectTitleValue(selectItem, originalSelect);
    this.setSelectChange(originalSelect);
  }
  // Реакция на изменение оригинального select
  selectChange(e) {
    const originalSelect = e.target;
    this.selectBuild(originalSelect);
    this.setSelectChange(originalSelect);
  }
  // Обработчик изменения в селекте
  setSelectChange(originalSelect) {
    if (originalSelect.hasAttribute("data-fls-select-validate")) {
      formValidate.validateInput(originalSelect);
    }
    if (originalSelect.hasAttribute("data-fls-select-submit") && originalSelect.value) {
      let tempButton = document.createElement("button");
      tempButton.type = "submit";
      originalSelect.closest("form").append(tempButton);
      tempButton.click();
      tempButton.remove();
    }
    const selectItem = originalSelect.parentElement;
    this.selectCallback(selectItem, originalSelect);
  }
  // Обработчик disabled
  selectDisabled(selectItem, originalSelect) {
    if (originalSelect.disabled) {
      selectItem.classList.add(this.selectClasses.classSelectDisabled);
      this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = true;
    } else {
      selectItem.classList.remove(this.selectClasses.classSelectDisabled);
      this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = false;
    }
  }
  // Обработчик поиска по элементам списка
  searchActions(selectItem) {
    const selectInput = this.getSelectElement(selectItem, this.selectClasses.classSelectInput).selectElement;
    const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
    selectInput.addEventListener("input", () => {
      const inputValue = selectInput.value.toLowerCase();
      const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
      selectOptionsItems.forEach((item) => {
        const itemText = item.textContent.toLowerCase();
        item.hidden = !itemText.includes(inputValue);
      });
      if (selectOptions.hidden) {
        this.selectAction(selectItem);
      }
    });
  }
  // Коллбэк-функция
  selectCallback(selectItem, originalSelect) {
    document.dispatchEvent(new CustomEvent("selectCallback", {
      detail: {
        select: originalSelect
      }
    }));
  }
}
document.querySelector("select[data-fls-select]") ? window.addEventListener("load", () => window.flsSelect = new SelectConstructor({})) : null;
class Popup {
  constructor(options) {
    let config3 = {
      logging: true,
      init: true,
      // Для кнопок
      attributeOpenButton: "data-fls-popup-link",
      // Атрибут для кнопки, которая вызывает попап
      attributeCloseButton: "data-fls-popup-close",
      // Атрибут для кнопки, которая закрывает попап
      // Для сторонних объектов
      fixElementSelector: "[data-fls-lp]",
      // Атрибут для элементов с левым паддингом (которые fixed)
      // Для объекта попапа
      attributeMain: "data-fls-popup",
      youtubeAttribute: "data-fls-popup-youtube",
      // Атрибут для кода youtube
      youtubePlaceAttribute: "data-fls-popup-youtube-place",
      // Атрибут для вставки ролика youtube
      setAutoplayYoutube: true,
      // Изменение классов
      classes: {
        popup: "popup",
        // popupWrapper: 'popup__wrapper',
        popupContent: "data-fls-popup-body",
        popupActive: "data-fls-popup-active",
        // Добавляется для попапа, когда он открывается
        bodyActive: "data-fls-popup-open"
        // Добавляется для body, когда попап открыт
      },
      focusCatch: true,
      // Фокус внутри попапа зациклен
      closeEsc: true,
      // Закрытие ESC
      bodyLock: true,
      // Блокировка скролла
      hashSettings: {
        location: true,
        // Хеш в адресной строке
        goHash: true
        // Переход при наличии в адресной строке
      },
      on: {
        // События
        beforeOpen: function() {
        },
        afterOpen: function() {
        },
        beforeClose: function() {
        },
        afterClose: function() {
        }
      }
    };
    this.youTubeCode;
    this.isOpen = false;
    this.targetOpen = {
      selector: false,
      element: false
    };
    this.previousOpen = {
      selector: false,
      element: false
    };
    this.lastClosed = {
      selector: false,
      element: false
    };
    this._dataValue = false;
    this.hash = false;
    this._reopen = false;
    this._selectorOpen = false;
    this.lastFocusEl = false;
    this._focusEl = [
      "a[href]",
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      "button:not([disabled]):not([aria-hidden])",
      "select:not([disabled]):not([aria-hidden])",
      "textarea:not([disabled]):not([aria-hidden])",
      "area[href]",
      "iframe",
      "object",
      "embed",
      "[contenteditable]",
      '[tabindex]:not([tabindex^="-"])'
    ];
    this.options = {
      ...config3,
      ...options,
      classes: {
        ...config3.classes,
        ...options?.classes
      },
      hashSettings: {
        ...config3.hashSettings,
        ...options?.hashSettings
      },
      on: {
        ...config3.on,
        ...options?.on
      }
    };
    this.bodyLock = false;
    this.options.init ? this.initPopups() : null;
  }
  initPopups() {
    this.buildPopup();
    this.eventsPopup();
  }
  buildPopup() {
  }
  eventsPopup() {
    document.addEventListener("click", (function(e) {
      const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
      if (buttonOpen) {
        e.preventDefault();
        this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
        this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
        if (this._dataValue !== "error") {
          if (!this.isOpen) this.lastFocusEl = buttonOpen;
          this.targetOpen.selector = `${this._dataValue}`;
          this._selectorOpen = true;
          this.open();
          return;
        }
        return;
      }
      const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
      if (buttonClose || !e.target.closest(`[${this.options.classes.popupContent}]`) && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
    }).bind(this));
    document.addEventListener("keydown", (function(e) {
      if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
      if (this.options.focusCatch && e.which == 9 && this.isOpen) {
        this._focusCatch(e);
        return;
      }
    }).bind(this));
    if (this.options.hashSettings.goHash) {
      window.addEventListener("hashchange", (function() {
        if (window.location.hash) {
          this._openToHash();
        } else {
          this.close(this.targetOpen.selector);
        }
      }).bind(this));
      if (window.location.hash) {
        this._openToHash();
      }
    }
  }
  open(selectorValue) {
    if (bodyLockStatus) {
      this.bodyLock = document.documentElement.hasAttribute("data-fls-scrolllock") && !this.isOpen ? true : false;
      if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
        this.targetOpen.selector = selectorValue;
        this._selectorOpen = true;
      }
      if (this.isOpen) {
        this._reopen = true;
        this.close();
      }
      if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
      if (!this._reopen) this.previousActiveElement = document.activeElement;
      this.targetOpen.element = document.querySelector(`[${this.options.attributeMain}=${this.targetOpen.selector}]`);
      if (this.targetOpen.element) {
        const codeVideo = this.youTubeCode || this.targetOpen.element.getAttribute(`${this.options.youtubeAttribute}`);
        if (codeVideo) {
          const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
          const iframe = document.createElement("iframe");
          const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
          iframe.setAttribute("src", urlVideo);
          if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
            this.targetOpen.element.querySelector("[data-fls-popup-content]").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
          }
          this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
        }
        if (this.options.hashSettings.location) {
          this._getHash();
          this._setHash();
        }
        this.options.on.beforeOpen(this);
        document.dispatchEvent(new CustomEvent("beforePopupOpen", {
          detail: {
            popup: this
          }
        }));
        this.targetOpen.element.setAttribute(this.options.classes.popupActive, "");
        document.documentElement.setAttribute(this.options.classes.bodyActive, "");
        if (!this._reopen) {
          !this.bodyLock ? bodyLock() : null;
        } else this._reopen = false;
        this.targetOpen.element.setAttribute("aria-hidden", "false");
        this.previousOpen.selector = this.targetOpen.selector;
        this.previousOpen.element = this.targetOpen.element;
        this._selectorOpen = false;
        this.isOpen = true;
        setTimeout(() => {
          this._focusTrap();
        }, 50);
        this.options.on.afterOpen(this);
        document.dispatchEvent(new CustomEvent("afterPopupOpen", {
          detail: {
            popup: this
          }
        }));
      }
    }
  }
  close(selectorValue) {
    if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
      this.previousOpen.selector = selectorValue;
    }
    if (!this.isOpen || !bodyLockStatus) {
      return;
    }
    this.options.on.beforeClose(this);
    document.dispatchEvent(new CustomEvent("beforePopupClose", {
      detail: {
        popup: this
      }
    }));
    if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
      setTimeout(() => {
        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
      }, 500);
    }
    this.previousOpen.element.removeAttribute(this.options.classes.popupActive);
    this.previousOpen.element.setAttribute("aria-hidden", "true");
    if (!this._reopen) {
      document.documentElement.removeAttribute(this.options.classes.bodyActive);
      !this.bodyLock ? bodyUnlock() : null;
      this.isOpen = false;
    }
    this._removeHash();
    if (this._selectorOpen) {
      this.lastClosed.selector = this.previousOpen.selector;
      this.lastClosed.element = this.previousOpen.element;
    }
    this.options.on.afterClose(this);
    document.dispatchEvent(new CustomEvent("afterPopupClose", {
      detail: {
        popup: this
      }
    }));
    setTimeout(() => {
      this._focusTrap();
    }, 50);
  }
  // Получение хеша 
  _getHash() {
    if (this.options.hashSettings.location) {
      this.hash = `#${this.targetOpen.selector}`;
    }
  }
  _openToHash() {
    let classInHash = window.location.hash.replace("#", "");
    const openButton = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`);
    if (openButton) {
      this.youTubeCode = openButton.getAttribute(this.options.youtubeAttribute) ? openButton.getAttribute(this.options.youtubeAttribute) : null;
    }
    if (classInHash) this.open(classInHash);
  }
  // Установка хеша
  _setHash() {
    history.pushState("", "", this.hash);
  }
  _removeHash() {
    history.pushState("", "", window.location.href.split("#")[0]);
  }
  _focusCatch(e) {
    const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
    const focusArray = Array.prototype.slice.call(focusable);
    const focusedIndex = focusArray.indexOf(document.activeElement);
    if (e.shiftKey && focusedIndex === 0) {
      focusArray[focusArray.length - 1].focus();
      e.preventDefault();
    }
    if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
      focusArray[0].focus();
      e.preventDefault();
    }
  }
  _focusTrap() {
    const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
    if (!this.isOpen && this.lastFocusEl) {
      this.lastFocusEl.focus();
    } else {
      focusable[0].focus();
    }
  }
}
document.querySelector("[data-fls-popup]") ? window.addEventListener("load", () => window.flsPopup = new Popup({})) : null;
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
  const closeButtons = document.querySelectorAll(".menu__close");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", function() {
      if (document.documentElement.hasAttribute("data-fls-menu-open")) {
        bodyLockToggle();
        document.documentElement.removeAttribute("data-fls-menu-open");
      }
    });
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
document.addEventListener("DOMContentLoaded", () => {
  const yearElement = document.querySelector("[data-footer-year]");
  if (yearElement) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    yearElement.textContent = currentYear;
  }
});
var inputmask_min$1 = { exports: {} };
var inputmask_min = inputmask_min$1.exports;
var hasRequiredInputmask_min;
function requireInputmask_min() {
  if (hasRequiredInputmask_min) return inputmask_min$1.exports;
  hasRequiredInputmask_min = 1;
  (function(module, exports$1) {
    !(function(e, t) {
      module.exports = t();
    })("undefined" != typeof self ? self : inputmask_min, (function() {
      return (function() {
        var e = { 3976: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          t2.default = { _maxTestPos: 500, placeholder: "_", optionalmarker: ["[", "]"], quantifiermarker: ["{", "}"], groupmarker: ["(", ")"], alternatormarker: "|", escapeChar: "\\", mask: null, regex: null, oncomplete: function() {
          }, onincomplete: function() {
          }, oncleared: function() {
          }, repeat: 0, greedy: false, autoUnmask: false, removeMaskOnSubmit: false, clearMaskOnLostFocus: true, insertMode: true, insertModeVisual: true, clearIncomplete: false, alias: null, onKeyDown: function() {
          }, onBeforeMask: null, onBeforePaste: function(e3, t3) {
            return "function" == typeof t3.onBeforeMask ? t3.onBeforeMask.call(this, e3, t3) : e3;
          }, onBeforeWrite: null, onUnMask: null, showMaskOnFocus: true, showMaskOnHover: true, onKeyValidation: function() {
          }, skipOptionalPartCharacter: " ", numericInput: false, rightAlign: false, undoOnEscape: true, radixPoint: "", _radixDance: false, groupSeparator: "", keepStatic: null, positionCaretOnTab: true, tabThrough: false, supportsInputType: ["text", "tel", "url", "password", "search"], isComplete: null, preValidation: null, postValidation: null, staticDefinitionSymbol: void 0, jitMasking: false, nullable: true, inputEventOnly: false, noValuePatching: false, positionCaretOnClick: "lvp", casing: null, inputmode: "text", importDataAttributes: true, shiftPositions: true, usePrototypeDefinitions: true, validationEventTimeOut: 3e3, substitutes: {} };
        }, 7392: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          t2.default = { 9: { validator: "[0-9０-９]", definitionSymbol: "*" }, a: { validator: "[A-Za-zА-яЁёÀ-ÿµ]", definitionSymbol: "*" }, "*": { validator: "[0-9０-９A-Za-zА-яЁёÀ-ÿµ]" } };
        }, 253: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e3, t3, n2) {
            if (void 0 === n2) return e3.__data ? e3.__data[t3] : null;
            e3.__data = e3.__data || {}, e3.__data[t3] = n2;
          };
        }, 3776: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.Event = void 0, t2.off = function(e3, t3) {
            var n3, i3;
            u(this[0]) && e3 && (n3 = this[0].eventRegistry, i3 = this[0], e3.split(" ").forEach((function(e4) {
              var a2 = o(e4.split("."), 2);
              (function(e5, i4) {
                var a3, r2, o2 = [];
                if (e5.length > 0) if (void 0 === t3) for (a3 = 0, r2 = n3[e5][i4].length; a3 < r2; a3++) o2.push({ ev: e5, namespace: i4 && i4.length > 0 ? i4 : "global", handler: n3[e5][i4][a3] });
                else o2.push({ ev: e5, namespace: i4 && i4.length > 0 ? i4 : "global", handler: t3 });
                else if (i4.length > 0) {
                  for (var l2 in n3) for (var s2 in n3[l2]) if (s2 === i4) if (void 0 === t3) for (a3 = 0, r2 = n3[l2][s2].length; a3 < r2; a3++) o2.push({ ev: l2, namespace: s2, handler: n3[l2][s2][a3] });
                  else o2.push({ ev: l2, namespace: s2, handler: t3 });
                }
                return o2;
              })(a2[0], a2[1]).forEach((function(e5) {
                var t4 = e5.ev, a3 = e5.handler;
                !(function(e6, t5, a4) {
                  if (e6 in n3 == 1) if (i3.removeEventListener ? i3.removeEventListener(e6, a4, false) : i3.detachEvent && i3.detachEvent("on".concat(e6), a4), "global" === t5) for (var r2 in n3[e6]) n3[e6][r2].splice(n3[e6][r2].indexOf(a4), 1);
                  else n3[e6][t5].splice(n3[e6][t5].indexOf(a4), 1);
                })(t4, e5.namespace, a3);
              }));
            })));
            return this;
          }, t2.on = function(e3, t3) {
            if (u(this[0])) {
              var n3 = this[0].eventRegistry, i3 = this[0];
              e3.split(" ").forEach((function(e4) {
                var a2 = o(e4.split("."), 2), r2 = a2[0], l2 = a2[1];
                !(function(e5, a3) {
                  i3.addEventListener ? i3.addEventListener(e5, t3, false) : i3.attachEvent && i3.attachEvent("on".concat(e5), t3), n3[e5] = n3[e5] || {}, n3[e5][a3] = n3[e5][a3] || [], n3[e5][a3].push(t3);
                })(r2, void 0 === l2 ? "global" : l2);
              }));
            }
            return this;
          }, t2.trigger = function(e3) {
            var t3 = arguments;
            if (u(this[0])) for (var n3 = this[0].eventRegistry, i3 = this[0], o2 = "string" == typeof e3 ? e3.split(" ") : [e3.type], l2 = 0; l2 < o2.length; l2++) {
              var s2 = o2[l2].split("."), f2 = s2[0], p = s2[1] || "global";
              if (void 0 !== c && "global" === p) {
                var d, h = { bubbles: true, cancelable: true, composed: true, detail: arguments[1] };
                if (c.createEvent) {
                  try {
                    if ("input" === f2) h.inputType = "insertText", d = new InputEvent(f2, h);
                    else d = new CustomEvent(f2, h);
                  } catch (e4) {
                    (d = c.createEvent("CustomEvent")).initCustomEvent(f2, h.bubbles, h.cancelable, h.detail);
                  }
                  e3.type && (0, a.default)(d, e3), i3.dispatchEvent(d);
                } else (d = c.createEventObject()).eventType = f2, d.detail = arguments[1], e3.type && (0, a.default)(d, e3), i3.fireEvent("on" + d.eventType, d);
              } else if (void 0 !== n3[f2]) {
                arguments[0] = arguments[0].type ? arguments[0] : r.default.Event(arguments[0]), arguments[0].detail = arguments.slice(1);
                var v = n3[f2];
                ("global" === p ? Object.values(v).flat() : v[p]).forEach((function(e4) {
                  return e4.apply(i3, t3);
                }));
              }
            }
            return this;
          };
          var i2 = s(n2(9380)), a = s(n2(600)), r = s(n2(4963));
          function o(e3, t3) {
            return (function(e4) {
              if (Array.isArray(e4)) return e4;
            })(e3) || (function(e4, t4) {
              var n3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
              if (null != n3) {
                var i3, a2, r2, o2, l2 = [], s2 = true, c2 = false;
                try {
                  if (r2 = (n3 = n3.call(e4)).next, 0 === t4) ;
                  else for (; !(s2 = (i3 = r2.call(n3)).done) && (l2.push(i3.value), l2.length !== t4); s2 = true) ;
                } catch (e5) {
                  c2 = true, a2 = e5;
                } finally {
                  try {
                    if (!s2 && null != n3.return && (o2 = n3.return(), Object(o2) !== o2)) return;
                  } finally {
                    if (c2) throw a2;
                  }
                }
                return l2;
              }
            })(e3, t3) || (function(e4, t4) {
              if (!e4) return;
              if ("string" == typeof e4) return l(e4, t4);
              var n3 = Object.prototype.toString.call(e4).slice(8, -1);
              "Object" === n3 && e4.constructor && (n3 = e4.constructor.name);
              if ("Map" === n3 || "Set" === n3) return Array.from(e4);
              if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return l(e4, t4);
            })(e3, t3) || (function() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            })();
          }
          function l(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function s(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var c = i2.default.document;
          function u(e3) {
            return e3 instanceof Element;
          }
          var f = t2.Event = void 0;
          "function" == typeof i2.default.CustomEvent ? t2.Event = f = i2.default.CustomEvent : i2.default.Event && c && c.createEvent ? (t2.Event = f = function(e3, t3) {
            t3 = t3 || { bubbles: false, cancelable: false, composed: true, detail: void 0 };
            var n3 = c.createEvent("CustomEvent");
            return n3.initCustomEvent(e3, t3.bubbles, t3.cancelable, t3.detail), n3;
          }, f.prototype = i2.default.Event.prototype) : "undefined" != typeof Event && (t2.Event = f = Event);
        }, 600: function(e2, t2) {
          function n2(e3) {
            return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, n2(e3);
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function e3() {
            var t3, i2, a, r, o, l, s = arguments[0] || {}, c = 1, u = arguments.length, f = false;
            "boolean" == typeof s && (f = s, s = arguments[c] || {}, c++);
            "object" !== n2(s) && "function" != typeof s && (s = {});
            for (; c < u; c++) if (null != (t3 = arguments[c])) for (i2 in t3) a = s[i2], s !== (r = t3[i2]) && (f && r && ("[object Object]" === Object.prototype.toString.call(r) || (o = Array.isArray(r))) ? (o ? (o = false, l = a && Array.isArray(a) ? a : []) : l = a && "[object Object]" === Object.prototype.toString.call(a) ? a : {}, s[i2] = e3(f, l, r)) : void 0 !== r && (s[i2] = r));
            return s;
          };
        }, 4963: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          var i2 = l(n2(9380)), a = l(n2(253)), r = n2(3776), o = l(n2(600));
          function l(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var s = i2.default.document;
          function c(e3) {
            return e3 instanceof c ? e3 : this instanceof c ? void (null != e3 && e3 !== i2.default && (this[0] = e3.nodeName ? e3 : void 0 !== e3[0] && e3[0].nodeName ? e3[0] : s.querySelector(e3), void 0 !== this[0] && null !== this[0] && (this[0].eventRegistry = this[0].eventRegistry || {}))) : new c(e3);
          }
          c.prototype = { on: r.on, off: r.off, trigger: r.trigger }, c.extend = o.default, c.data = a.default, c.Event = r.Event;
          t2.default = c;
        }, 9845: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.mobile = t2.iphone = t2.ie = void 0;
          var i2, a = (i2 = n2(9380)) && i2.__esModule ? i2 : { default: i2 };
          var r = a.default.navigator && a.default.navigator.userAgent || "";
          t2.ie = r.indexOf("MSIE ") > 0 || r.indexOf("Trident/") > 0, t2.mobile = a.default.navigator && a.default.navigator.userAgentData && a.default.navigator.userAgentData.mobile || a.default.navigator && a.default.navigator.maxTouchPoints || "ontouchstart" in a.default, t2.iphone = /iphone/i.test(r);
        }, 7184: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e3) {
            return e3.replace(n2, "\\$1");
          };
          var n2 = new RegExp("(\\" + ["/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^"].join("|\\") + ")", "gim");
        }, 6030: function(e2, t2, n2) {
          function i2(e3) {
            return i2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, i2(e3);
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.EventHandlers = void 0;
          var a, r = n2(9845), o = (a = n2(9380)) && a.__esModule ? a : { default: a }, l = n2(7760), s = n2(2839), c = n2(8711), u = n2(7215), f = n2(4713);
          function p() {
            p = function() {
              return t3;
            };
            var e3, t3 = {}, n3 = Object.prototype, a2 = n3.hasOwnProperty, r2 = Object.defineProperty || function(e4, t4, n4) {
              e4[t4] = n4.value;
            }, o2 = "function" == typeof Symbol ? Symbol : {}, l2 = o2.iterator || "@@iterator", s2 = o2.asyncIterator || "@@asyncIterator", c2 = o2.toStringTag || "@@toStringTag";
            function u2(e4, t4, n4) {
              return Object.defineProperty(e4, t4, { value: n4, enumerable: true, configurable: true, writable: true }), e4[t4];
            }
            try {
              u2({}, "");
            } catch (e4) {
              u2 = function(e5, t4, n4) {
                return e5[t4] = n4;
              };
            }
            function f2(e4, t4, n4, i3) {
              var a3 = t4 && t4.prototype instanceof k ? t4 : k, o3 = Object.create(a3.prototype), l3 = new D(i3 || []);
              return r2(o3, "_invoke", { value: E(e4, n4, l3) }), o3;
            }
            function d2(e4, t4, n4) {
              try {
                return { type: "normal", arg: e4.call(t4, n4) };
              } catch (e5) {
                return { type: "throw", arg: e5 };
              }
            }
            t3.wrap = f2;
            var h2 = "suspendedStart", v2 = "suspendedYield", m2 = "executing", g2 = "completed", y2 = {};
            function k() {
            }
            function b() {
            }
            function x() {
            }
            var w = {};
            u2(w, l2, (function() {
              return this;
            }));
            var P = Object.getPrototypeOf, S = P && P(P(L([])));
            S && S !== n3 && a2.call(S, l2) && (w = S);
            var O = x.prototype = k.prototype = Object.create(w);
            function _(e4) {
              ["next", "throw", "return"].forEach((function(t4) {
                u2(e4, t4, (function(e5) {
                  return this._invoke(t4, e5);
                }));
              }));
            }
            function M(e4, t4) {
              function n4(r3, o4, l3, s3) {
                var c3 = d2(e4[r3], e4, o4);
                if ("throw" !== c3.type) {
                  var u3 = c3.arg, f3 = u3.value;
                  return f3 && "object" == i2(f3) && a2.call(f3, "__await") ? t4.resolve(f3.__await).then((function(e5) {
                    n4("next", e5, l3, s3);
                  }), (function(e5) {
                    n4("throw", e5, l3, s3);
                  })) : t4.resolve(f3).then((function(e5) {
                    u3.value = e5, l3(u3);
                  }), (function(e5) {
                    return n4("throw", e5, l3, s3);
                  }));
                }
                s3(c3.arg);
              }
              var o3;
              r2(this, "_invoke", { value: function(e5, i3) {
                function a3() {
                  return new t4((function(t5, a4) {
                    n4(e5, i3, t5, a4);
                  }));
                }
                return o3 = o3 ? o3.then(a3, a3) : a3();
              } });
            }
            function E(t4, n4, i3) {
              var a3 = h2;
              return function(r3, o3) {
                if (a3 === m2) throw new Error("Generator is already running");
                if (a3 === g2) {
                  if ("throw" === r3) throw o3;
                  return { value: e3, done: true };
                }
                for (i3.method = r3, i3.arg = o3; ; ) {
                  var l3 = i3.delegate;
                  if (l3) {
                    var s3 = j(l3, i3);
                    if (s3) {
                      if (s3 === y2) continue;
                      return s3;
                    }
                  }
                  if ("next" === i3.method) i3.sent = i3._sent = i3.arg;
                  else if ("throw" === i3.method) {
                    if (a3 === h2) throw a3 = g2, i3.arg;
                    i3.dispatchException(i3.arg);
                  } else "return" === i3.method && i3.abrupt("return", i3.arg);
                  a3 = m2;
                  var c3 = d2(t4, n4, i3);
                  if ("normal" === c3.type) {
                    if (a3 = i3.done ? g2 : v2, c3.arg === y2) continue;
                    return { value: c3.arg, done: i3.done };
                  }
                  "throw" === c3.type && (a3 = g2, i3.method = "throw", i3.arg = c3.arg);
                }
              };
            }
            function j(t4, n4) {
              var i3 = n4.method, a3 = t4.iterator[i3];
              if (a3 === e3) return n4.delegate = null, "throw" === i3 && t4.iterator.return && (n4.method = "return", n4.arg = e3, j(t4, n4), "throw" === n4.method) || "return" !== i3 && (n4.method = "throw", n4.arg = new TypeError("The iterator does not provide a '" + i3 + "' method")), y2;
              var r3 = d2(a3, t4.iterator, n4.arg);
              if ("throw" === r3.type) return n4.method = "throw", n4.arg = r3.arg, n4.delegate = null, y2;
              var o3 = r3.arg;
              return o3 ? o3.done ? (n4[t4.resultName] = o3.value, n4.next = t4.nextLoc, "return" !== n4.method && (n4.method = "next", n4.arg = e3), n4.delegate = null, y2) : o3 : (n4.method = "throw", n4.arg = new TypeError("iterator result is not an object"), n4.delegate = null, y2);
            }
            function T(e4) {
              var t4 = { tryLoc: e4[0] };
              1 in e4 && (t4.catchLoc = e4[1]), 2 in e4 && (t4.finallyLoc = e4[2], t4.afterLoc = e4[3]), this.tryEntries.push(t4);
            }
            function A(e4) {
              var t4 = e4.completion || {};
              t4.type = "normal", delete t4.arg, e4.completion = t4;
            }
            function D(e4) {
              this.tryEntries = [{ tryLoc: "root" }], e4.forEach(T, this), this.reset(true);
            }
            function L(t4) {
              if (t4 || "" === t4) {
                var n4 = t4[l2];
                if (n4) return n4.call(t4);
                if ("function" == typeof t4.next) return t4;
                if (!isNaN(t4.length)) {
                  var r3 = -1, o3 = function n5() {
                    for (; ++r3 < t4.length; ) if (a2.call(t4, r3)) return n5.value = t4[r3], n5.done = false, n5;
                    return n5.value = e3, n5.done = true, n5;
                  };
                  return o3.next = o3;
                }
              }
              throw new TypeError(i2(t4) + " is not iterable");
            }
            return b.prototype = x, r2(O, "constructor", { value: x, configurable: true }), r2(x, "constructor", { value: b, configurable: true }), b.displayName = u2(x, c2, "GeneratorFunction"), t3.isGeneratorFunction = function(e4) {
              var t4 = "function" == typeof e4 && e4.constructor;
              return !!t4 && (t4 === b || "GeneratorFunction" === (t4.displayName || t4.name));
            }, t3.mark = function(e4) {
              return Object.setPrototypeOf ? Object.setPrototypeOf(e4, x) : (e4.__proto__ = x, u2(e4, c2, "GeneratorFunction")), e4.prototype = Object.create(O), e4;
            }, t3.awrap = function(e4) {
              return { __await: e4 };
            }, _(M.prototype), u2(M.prototype, s2, (function() {
              return this;
            })), t3.AsyncIterator = M, t3.async = function(e4, n4, i3, a3, r3) {
              void 0 === r3 && (r3 = Promise);
              var o3 = new M(f2(e4, n4, i3, a3), r3);
              return t3.isGeneratorFunction(n4) ? o3 : o3.next().then((function(e5) {
                return e5.done ? e5.value : o3.next();
              }));
            }, _(O), u2(O, c2, "Generator"), u2(O, l2, (function() {
              return this;
            })), u2(O, "toString", (function() {
              return "[object Generator]";
            })), t3.keys = function(e4) {
              var t4 = Object(e4), n4 = [];
              for (var i3 in t4) n4.push(i3);
              return n4.reverse(), function e5() {
                for (; n4.length; ) {
                  var i4 = n4.pop();
                  if (i4 in t4) return e5.value = i4, e5.done = false, e5;
                }
                return e5.done = true, e5;
              };
            }, t3.values = L, D.prototype = { constructor: D, reset: function(t4) {
              if (this.prev = 0, this.next = 0, this.sent = this._sent = e3, this.done = false, this.delegate = null, this.method = "next", this.arg = e3, this.tryEntries.forEach(A), !t4) for (var n4 in this) "t" === n4.charAt(0) && a2.call(this, n4) && !isNaN(+n4.slice(1)) && (this[n4] = e3);
            }, stop: function() {
              this.done = true;
              var e4 = this.tryEntries[0].completion;
              if ("throw" === e4.type) throw e4.arg;
              return this.rval;
            }, dispatchException: function(t4) {
              if (this.done) throw t4;
              var n4 = this;
              function i3(i4, a3) {
                return l3.type = "throw", l3.arg = t4, n4.next = i4, a3 && (n4.method = "next", n4.arg = e3), !!a3;
              }
              for (var r3 = this.tryEntries.length - 1; r3 >= 0; --r3) {
                var o3 = this.tryEntries[r3], l3 = o3.completion;
                if ("root" === o3.tryLoc) return i3("end");
                if (o3.tryLoc <= this.prev) {
                  var s3 = a2.call(o3, "catchLoc"), c3 = a2.call(o3, "finallyLoc");
                  if (s3 && c3) {
                    if (this.prev < o3.catchLoc) return i3(o3.catchLoc, true);
                    if (this.prev < o3.finallyLoc) return i3(o3.finallyLoc);
                  } else if (s3) {
                    if (this.prev < o3.catchLoc) return i3(o3.catchLoc, true);
                  } else {
                    if (!c3) throw new Error("try statement without catch or finally");
                    if (this.prev < o3.finallyLoc) return i3(o3.finallyLoc);
                  }
                }
              }
            }, abrupt: function(e4, t4) {
              for (var n4 = this.tryEntries.length - 1; n4 >= 0; --n4) {
                var i3 = this.tryEntries[n4];
                if (i3.tryLoc <= this.prev && a2.call(i3, "finallyLoc") && this.prev < i3.finallyLoc) {
                  var r3 = i3;
                  break;
                }
              }
              r3 && ("break" === e4 || "continue" === e4) && r3.tryLoc <= t4 && t4 <= r3.finallyLoc && (r3 = null);
              var o3 = r3 ? r3.completion : {};
              return o3.type = e4, o3.arg = t4, r3 ? (this.method = "next", this.next = r3.finallyLoc, y2) : this.complete(o3);
            }, complete: function(e4, t4) {
              if ("throw" === e4.type) throw e4.arg;
              return "break" === e4.type || "continue" === e4.type ? this.next = e4.arg : "return" === e4.type ? (this.rval = this.arg = e4.arg, this.method = "return", this.next = "end") : "normal" === e4.type && t4 && (this.next = t4), y2;
            }, finish: function(e4) {
              for (var t4 = this.tryEntries.length - 1; t4 >= 0; --t4) {
                var n4 = this.tryEntries[t4];
                if (n4.finallyLoc === e4) return this.complete(n4.completion, n4.afterLoc), A(n4), y2;
              }
            }, catch: function(e4) {
              for (var t4 = this.tryEntries.length - 1; t4 >= 0; --t4) {
                var n4 = this.tryEntries[t4];
                if (n4.tryLoc === e4) {
                  var i3 = n4.completion;
                  if ("throw" === i3.type) {
                    var a3 = i3.arg;
                    A(n4);
                  }
                  return a3;
                }
              }
              throw new Error("illegal catch attempt");
            }, delegateYield: function(t4, n4, i3) {
              return this.delegate = { iterator: L(t4), resultName: n4, nextLoc: i3 }, "next" === this.method && (this.arg = e3), y2;
            } }, t3;
          }
          function d(e3, t3) {
            var n3 = "undefined" != typeof Symbol && e3[Symbol.iterator] || e3["@@iterator"];
            if (!n3) {
              if (Array.isArray(e3) || (n3 = (function(e4, t4) {
                if (!e4) return;
                if ("string" == typeof e4) return h(e4, t4);
                var n4 = Object.prototype.toString.call(e4).slice(8, -1);
                "Object" === n4 && e4.constructor && (n4 = e4.constructor.name);
                if ("Map" === n4 || "Set" === n4) return Array.from(e4);
                if ("Arguments" === n4 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n4)) return h(e4, t4);
              })(e3)) || t3) {
                n3 && (e3 = n3);
                var i3 = 0, a2 = function() {
                };
                return { s: a2, n: function() {
                  return i3 >= e3.length ? { done: true } : { done: false, value: e3[i3++] };
                }, e: function(e4) {
                  throw e4;
                }, f: a2 };
              }
              throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            var r2, o2 = true, l2 = false;
            return { s: function() {
              n3 = n3.call(e3);
            }, n: function() {
              var e4 = n3.next();
              return o2 = e4.done, e4;
            }, e: function(e4) {
              l2 = true, r2 = e4;
            }, f: function() {
              try {
                o2 || null == n3.return || n3.return();
              } finally {
                if (l2) throw r2;
              }
            } };
          }
          function h(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function v(e3, t3, n3, i3, a2, r2, o2) {
            try {
              var l2 = e3[r2](o2), s2 = l2.value;
            } catch (e4) {
              return void n3(e4);
            }
            l2.done ? t3(s2) : Promise.resolve(s2).then(i3, a2);
          }
          var m, g, y = t2.EventHandlers = { keyEvent: function(e3, t3, n3, i3, a2) {
            var o2 = this.inputmask, p2 = o2.opts, d2 = o2.dependencyLib, h2 = o2.maskset, v2 = this, m2 = d2(v2), g2 = e3.key, k = c.caret.call(o2, v2), b = p2.onKeyDown.call(this, e3, c.getBuffer.call(o2), k, p2);
            if (void 0 !== b) return b;
            if (g2 === s.keys.Backspace || g2 === s.keys.Delete || r.iphone && g2 === s.keys.BACKSPACE_SAFARI || e3.ctrlKey && g2 === s.keys.x && !("oncut" in v2)) e3.preventDefault(), u.handleRemove.call(o2, v2, g2, k), (0, l.writeBuffer)(v2, c.getBuffer.call(o2, true), h2.p, e3, v2.inputmask._valueGet() !== c.getBuffer.call(o2).join(""));
            else if (g2 === s.keys.End || g2 === s.keys.PageDown) {
              e3.preventDefault();
              var x = c.seekNext.call(o2, c.getLastValidPosition.call(o2));
              c.caret.call(o2, v2, e3.shiftKey ? k.begin : x, x, true);
            } else g2 === s.keys.Home && !e3.shiftKey || g2 === s.keys.PageUp ? (e3.preventDefault(), c.caret.call(o2, v2, 0, e3.shiftKey ? k.begin : 0, true)) : p2.undoOnEscape && g2 === s.keys.Escape && true !== e3.altKey ? ((0, l.checkVal)(v2, true, false, o2.undoValue.split("")), m2.trigger("click")) : g2 !== s.keys.Insert || e3.shiftKey || e3.ctrlKey || void 0 !== o2.userOptions.insertMode ? true === p2.tabThrough && g2 === s.keys.Tab ? true === e3.shiftKey ? (k.end = c.seekPrevious.call(o2, k.end, true), true === f.getTest.call(o2, k.end - 1).match.static && k.end--, k.begin = c.seekPrevious.call(o2, k.end, true), k.begin >= 0 && k.end > 0 && (e3.preventDefault(), c.caret.call(o2, v2, k.begin, k.end))) : (k.begin = c.seekNext.call(o2, k.begin, true), k.end = c.seekNext.call(o2, k.begin, true), k.end < h2.maskLength && k.end--, k.begin <= h2.maskLength && (e3.preventDefault(), c.caret.call(o2, v2, k.begin, k.end))) : e3.shiftKey || (p2.insertModeVisual && false === p2.insertMode ? g2 === s.keys.ArrowRight ? setTimeout((function() {
              var e4 = c.caret.call(o2, v2);
              c.caret.call(o2, v2, e4.begin);
            }), 0) : g2 === s.keys.ArrowLeft && setTimeout((function() {
              var e4 = c.translatePosition.call(o2, v2.inputmask.caretPos.begin);
              c.translatePosition.call(o2, v2.inputmask.caretPos.end);
              o2.isRTL ? c.caret.call(o2, v2, e4 + (e4 === h2.maskLength ? 0 : 1)) : c.caret.call(o2, v2, e4 - (0 === e4 ? 0 : 1));
            }), 0) : void 0 === o2.keyEventHook || o2.keyEventHook(e3)) : u.isSelection.call(o2, k) ? p2.insertMode = !p2.insertMode : (p2.insertMode = !p2.insertMode, c.caret.call(o2, v2, k.begin, k.begin));
            return o2.isComposing = g2 == s.keys.Process || g2 == s.keys.Unidentified, o2.ignorable = g2.length > 1 && !("textarea" === v2.tagName.toLowerCase() && g2 == s.keys.Enter), y.keypressEvent.call(this, e3, t3, n3, i3, a2);
          }, keypressEvent: function(e3, t3, n3, i3, a2) {
            var r2 = this.inputmask || this, o2 = r2.opts, f2 = r2.dependencyLib, p2 = r2.maskset, d2 = r2.el, h2 = f2(d2), v2 = e3.key;
            if (true === t3 || e3.ctrlKey && e3.altKey && !r2.ignorable || !(e3.ctrlKey || e3.metaKey || r2.ignorable)) {
              if (v2) {
                var m2, g2 = t3 ? { begin: a2, end: a2 } : c.caret.call(r2, d2);
                t3 || (v2 = o2.substitutes[v2] || v2), p2.writeOutBuffer = true;
                var y2 = u.isValid.call(r2, g2, v2, i3, void 0, void 0, void 0, t3);
                if (false !== y2 && (c.resetMaskSet.call(r2, true), m2 = void 0 !== y2.caret ? y2.caret : c.seekNext.call(r2, y2.pos.begin ? y2.pos.begin : y2.pos), p2.p = m2), m2 = o2.numericInput && void 0 === y2.caret ? c.seekPrevious.call(r2, m2) : m2, false !== n3 && (setTimeout((function() {
                  o2.onKeyValidation.call(d2, v2, y2);
                }), 0), p2.writeOutBuffer && false !== y2)) {
                  var k = c.getBuffer.call(r2);
                  (0, l.writeBuffer)(d2, k, m2, e3, true !== t3);
                }
                if (e3.preventDefault(), t3) return false !== y2 && (y2.forwardPosition = m2), y2;
              }
            } else v2 === s.keys.Enter && r2.undoValue !== r2._valueGet(true) && (r2.undoValue = r2._valueGet(true), setTimeout((function() {
              h2.trigger("change");
            }), 0));
          }, pasteEvent: (m = p().mark((function e3(t3) {
            var n3, i3, a2, r2, s2, u2;
            return p().wrap((function(e4) {
              for (; ; ) switch (e4.prev = e4.next) {
                case 0:
                  n3 = function(e5, n4, i4, a3, o2) {
                    var s3 = c.caret.call(e5, n4, void 0, void 0, true), u3 = i4.substr(0, s3.begin), f2 = i4.substr(s3.end, i4.length);
                    if (u3 == (e5.isRTL ? c.getBufferTemplate.call(e5).slice().reverse() : c.getBufferTemplate.call(e5)).slice(0, s3.begin).join("") && (u3 = ""), f2 == (e5.isRTL ? c.getBufferTemplate.call(e5).slice().reverse() : c.getBufferTemplate.call(e5)).slice(s3.end).join("") && (f2 = ""), a3 = u3 + a3 + f2, e5.isRTL && true !== r2.numericInput) {
                      a3 = a3.split("");
                      var p2, h2 = d(c.getBufferTemplate.call(e5));
                      try {
                        for (h2.s(); !(p2 = h2.n()).done; ) {
                          var v2 = p2.value;
                          a3[0] === v2 && a3.shift();
                        }
                      } catch (e6) {
                        h2.e(e6);
                      } finally {
                        h2.f();
                      }
                      a3 = a3.reverse().join("");
                    }
                    var m2 = a3;
                    if ("function" == typeof o2) {
                      if (false === (m2 = o2.call(e5, m2, r2))) return false;
                      m2 || (m2 = i4);
                    }
                    (0, l.checkVal)(n4, true, false, m2.toString().split(""), t3);
                  }, i3 = this, a2 = this.inputmask, r2 = a2.opts, s2 = a2._valueGet(true), a2.skipInputEvent = true, t3.clipboardData && t3.clipboardData.getData ? u2 = t3.clipboardData.getData("text/plain") : o.default.clipboardData && o.default.clipboardData.getData && (u2 = o.default.clipboardData.getData("Text")), n3(a2, i3, s2, u2, r2.onBeforePaste), t3.preventDefault();
                case 7:
                case "end":
                  return e4.stop();
              }
            }), e3, this);
          })), g = function() {
            var e3 = this, t3 = arguments;
            return new Promise((function(n3, i3) {
              var a2 = m.apply(e3, t3);
              function r2(e4) {
                v(a2, n3, i3, r2, o2, "next", e4);
              }
              function o2(e4) {
                v(a2, n3, i3, r2, o2, "throw", e4);
              }
              r2(void 0);
            }));
          }, function(e3) {
            return g.apply(this, arguments);
          }), inputFallBackEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.opts, i3 = t3.dependencyLib;
            var a2, o2 = this, u2 = o2.inputmask._valueGet(true), p2 = (t3.isRTL ? c.getBuffer.call(t3).slice().reverse() : c.getBuffer.call(t3)).join(""), d2 = c.caret.call(t3, o2, void 0, void 0, true);
            if (p2 !== u2) {
              if (a2 = (function(e4, i4, a3) {
                for (var r2, o3, l2, s2 = e4.substr(0, a3.begin).split(""), u3 = e4.substr(a3.begin).split(""), p3 = i4.substr(0, a3.begin).split(""), d3 = i4.substr(a3.begin).split(""), h3 = s2.length >= p3.length ? s2.length : p3.length, v2 = u3.length >= d3.length ? u3.length : d3.length, m2 = "", g2 = [], y2 = "~"; s2.length < h3; ) s2.push(y2);
                for (; p3.length < h3; ) p3.push(y2);
                for (; u3.length < v2; ) u3.unshift(y2);
                for (; d3.length < v2; ) d3.unshift(y2);
                var k = s2.concat(u3), b = p3.concat(d3);
                for (o3 = 0, r2 = k.length; o3 < r2; o3++) switch (l2 = f.getPlaceholder.call(t3, c.translatePosition.call(t3, o3)), m2) {
                  case "insertText":
                    b[o3 - 1] === k[o3] && a3.begin == k.length - 1 && g2.push(k[o3]), o3 = r2;
                    break;
                  case "insertReplacementText":
                  case "deleteContentBackward":
                    k[o3] === y2 ? a3.end++ : o3 = r2;
                    break;
                  default:
                    k[o3] !== b[o3] && (k[o3 + 1] !== y2 && k[o3 + 1] !== l2 && void 0 !== k[o3 + 1] || (b[o3] !== l2 || b[o3 + 1] !== y2) && b[o3] !== y2 ? b[o3 + 1] === y2 && b[o3] === k[o3 + 1] ? (m2 = "insertText", g2.push(k[o3]), a3.begin--, a3.end--) : k[o3] !== l2 && k[o3] !== y2 && (k[o3 + 1] === y2 || b[o3] !== k[o3] && b[o3 + 1] === k[o3 + 1]) ? (m2 = "insertReplacementText", g2.push(k[o3]), a3.begin--) : k[o3] === y2 ? (m2 = "deleteContentBackward", (c.isMask.call(t3, c.translatePosition.call(t3, o3), true) || b[o3] === n3.radixPoint) && a3.end++) : o3 = r2 : (m2 = "insertText", g2.push(k[o3]), a3.begin--, a3.end--));
                }
                return { action: m2, data: g2, caret: a3 };
              })(u2, p2, d2), (o2.inputmask.shadowRoot || o2.ownerDocument).activeElement !== o2 && o2.focus(), (0, l.writeBuffer)(o2, c.getBuffer.call(t3)), c.caret.call(t3, o2, d2.begin, d2.end, true), !r.mobile && t3.skipNextInsert && "insertText" === e3.inputType && "insertText" === a2.action && t3.isComposing) return false;
              switch ("insertCompositionText" === e3.inputType && "insertText" === a2.action && t3.isComposing ? t3.skipNextInsert = true : t3.skipNextInsert = false, a2.action) {
                case "insertText":
                case "insertReplacementText":
                  a2.data.forEach((function(e4, n4) {
                    var a3 = new i3.Event("keypress");
                    a3.key = e4, t3.ignorable = false, y.keypressEvent.call(o2, a3);
                  })), setTimeout((function() {
                    t3.$el.trigger("keyup");
                  }), 0);
                  break;
                case "deleteContentBackward":
                  var h2 = new i3.Event("keydown");
                  h2.key = s.keys.Backspace, y.keyEvent.call(o2, h2);
                  break;
                default:
                  (0, l.applyInputValue)(o2, u2), c.caret.call(t3, o2, d2.begin, d2.end, true);
              }
              e3.preventDefault();
            }
          }, setValueEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.dependencyLib, i3 = this, a2 = e3 && e3.detail ? e3.detail[0] : arguments[1];
            void 0 === a2 && (a2 = i3.inputmask._valueGet(true)), (0, l.applyInputValue)(i3, a2, new n3.Event("input")), (e3.detail && void 0 !== e3.detail[1] || void 0 !== arguments[2]) && c.caret.call(t3, i3, e3.detail ? e3.detail[1] : arguments[2]);
          }, focusEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.opts, i3 = t3 && t3._valueGet();
            n3.showMaskOnFocus && i3 !== c.getBuffer.call(t3).join("") && (0, l.writeBuffer)(this, c.getBuffer.call(t3), c.seekNext.call(t3, c.getLastValidPosition.call(t3))), true !== n3.positionCaretOnTab || false !== t3.mouseEnter || u.isComplete.call(t3, c.getBuffer.call(t3)) && -1 !== c.getLastValidPosition.call(t3) || y.clickEvent.apply(this, [e3, true]), t3.undoValue = t3 && t3._valueGet(true);
          }, invalidEvent: function(e3) {
            this.inputmask.validationEvent = true;
          }, mouseleaveEvent: function() {
            var e3 = this.inputmask, t3 = e3.opts, n3 = this;
            e3.mouseEnter = false, t3.clearMaskOnLostFocus && (n3.inputmask.shadowRoot || n3.ownerDocument).activeElement !== n3 && (0, l.HandleNativePlaceholder)(n3, e3.originalPlaceholder);
          }, clickEvent: function(e3, t3) {
            var n3 = this.inputmask;
            n3.clicked++;
            var i3 = this;
            if ((i3.inputmask.shadowRoot || i3.ownerDocument).activeElement === i3) {
              var a2 = c.determineNewCaretPosition.call(n3, c.caret.call(n3, i3), t3);
              void 0 !== a2 && c.caret.call(n3, i3, a2);
            }
          }, cutEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.maskset, i3 = this, a2 = c.caret.call(t3, i3), r2 = t3.isRTL ? c.getBuffer.call(t3).slice(a2.end, a2.begin) : c.getBuffer.call(t3).slice(a2.begin, a2.end), f2 = t3.isRTL ? r2.reverse().join("") : r2.join("");
            o.default.navigator && o.default.navigator.clipboard ? o.default.navigator.clipboard.writeText(f2) : o.default.clipboardData && o.default.clipboardData.getData && o.default.clipboardData.setData("Text", f2), u.handleRemove.call(t3, i3, s.keys.Delete, a2), (0, l.writeBuffer)(i3, c.getBuffer.call(t3), n3.p, e3, t3.undoValue !== t3._valueGet(true));
          }, blurEvent: function(e3) {
            var t3 = this.inputmask, n3 = t3.opts, i3 = t3.dependencyLib;
            t3.clicked = 0;
            var a2 = i3(this), r2 = this;
            if (r2.inputmask) {
              (0, l.HandleNativePlaceholder)(r2, t3.originalPlaceholder);
              var o2 = r2.inputmask._valueGet(), s2 = c.getBuffer.call(t3).slice();
              "" !== o2 && (n3.clearMaskOnLostFocus && (-1 === c.getLastValidPosition.call(t3) && o2 === c.getBufferTemplate.call(t3).join("") ? s2 = [] : l.clearOptionalTail.call(t3, s2)), false === u.isComplete.call(t3, s2) && (setTimeout((function() {
                a2.trigger("incomplete");
              }), 0), n3.clearIncomplete && (c.resetMaskSet.call(t3, false), s2 = n3.clearMaskOnLostFocus ? [] : c.getBufferTemplate.call(t3).slice())), (0, l.writeBuffer)(r2, s2, void 0, e3)), o2 = t3._valueGet(true), t3.undoValue !== o2 && ("" != o2 || t3.undoValue != c.getBufferTemplate.call(t3).join("") || t3.undoValue == c.getBufferTemplate.call(t3).join("") && t3.maskset.validPositions.length > 0) && (t3.undoValue = o2, a2.trigger("change"));
            }
          }, mouseenterEvent: function() {
            var e3 = this.inputmask, t3 = e3.opts.showMaskOnHover, n3 = this;
            if (e3.mouseEnter = true, (n3.inputmask.shadowRoot || n3.ownerDocument).activeElement !== n3) {
              var i3 = (e3.isRTL ? c.getBufferTemplate.call(e3).slice().reverse() : c.getBufferTemplate.call(e3)).join("");
              t3 && (0, l.HandleNativePlaceholder)(n3, i3);
            }
          }, submitEvent: function() {
            var e3 = this.inputmask, t3 = e3.opts;
            e3.undoValue !== e3._valueGet(true) && e3.$el.trigger("change"), -1 === c.getLastValidPosition.call(e3) && e3._valueGet && e3._valueGet() === c.getBufferTemplate.call(e3).join("") && e3._valueSet(""), t3.clearIncomplete && false === u.isComplete.call(e3, c.getBuffer.call(e3)) && e3._valueSet(""), t3.removeMaskOnSubmit && (e3._valueSet(e3.unmaskedvalue(), true), setTimeout((function() {
              (0, l.writeBuffer)(e3.el, c.getBuffer.call(e3));
            }), 0));
          }, resetEvent: function() {
            var e3 = this.inputmask;
            e3.refreshValue = true, setTimeout((function() {
              (0, l.applyInputValue)(e3.el, e3._valueGet(true));
            }), 0);
          } };
        }, 9716: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.EventRuler = void 0;
          var i2, a = n2(7760), r = (i2 = n2(2394)) && i2.__esModule ? i2 : { default: i2 }, o = n2(2839), l = n2(8711);
          t2.EventRuler = { on: function(e3, t3, n3) {
            var i3 = e3.inputmask.dependencyLib, s = function(t4) {
              t4.originalEvent && (t4 = t4.originalEvent || t4, arguments[0] = t4);
              var s2, c = this, u = c.inputmask, f = u ? u.opts : void 0;
              if (void 0 === u && "FORM" !== this.nodeName) {
                var p = i3.data(c, "_inputmask_opts");
                i3(c).off(), p && new r.default(p).mask(c);
              } else {
                if (["submit", "reset", "setvalue"].includes(t4.type) || "FORM" === this.nodeName || !(c.disabled || c.readOnly && !("keydown" === t4.type && t4.ctrlKey && t4.key === o.keys.c || false === f.tabThrough && t4.key === o.keys.Tab))) {
                  switch (t4.type) {
                    case "input":
                      if (true === u.skipInputEvent) return u.skipInputEvent = false, t4.preventDefault();
                      break;
                    case "click":
                    case "focus":
                      return u.validationEvent ? (u.validationEvent = false, e3.blur(), (0, a.HandleNativePlaceholder)(e3, (u.isRTL ? l.getBufferTemplate.call(u).slice().reverse() : l.getBufferTemplate.call(u)).join("")), setTimeout((function() {
                        e3.focus();
                      }), f.validationEventTimeOut), false) : (s2 = arguments, void setTimeout((function() {
                        e3.inputmask && n3.apply(c, s2);
                      }), 0));
                  }
                  var d = n3.apply(c, arguments);
                  return false === d && (t4.preventDefault(), t4.stopPropagation()), d;
                }
                t4.preventDefault();
              }
            };
            ["submit", "reset"].includes(t3) ? (s = s.bind(e3), null !== e3.form && i3(e3.form).on(t3, s)) : i3(e3).on(t3, s), e3.inputmask.events[t3] = e3.inputmask.events[t3] || [], e3.inputmask.events[t3].push(s);
          }, off: function(e3, t3) {
            if (e3.inputmask && e3.inputmask.events) {
              var n3 = e3.inputmask.dependencyLib, i3 = e3.inputmask.events;
              for (var a2 in t3 && ((i3 = [])[t3] = e3.inputmask.events[t3]), i3) {
                for (var r2 = i3[a2]; r2.length > 0; ) {
                  var o2 = r2.pop();
                  ["submit", "reset"].includes(a2) ? null !== e3.form && n3(e3.form).off(a2, o2) : n3(e3).off(a2, o2);
                }
                delete e3.inputmask.events[a2];
              }
            }
          } };
        }, 219: function(e2, t2, n2) {
          var i2 = p(n2(7184)), a = p(n2(2394)), r = n2(2839), o = n2(8711), l = n2(4713);
          function s(e3, t3) {
            return (function(e4) {
              if (Array.isArray(e4)) return e4;
            })(e3) || (function(e4, t4) {
              var n3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
              if (null != n3) {
                var i3, a2, r2, o2, l2 = [], s2 = true, c2 = false;
                try {
                  if (r2 = (n3 = n3.call(e4)).next, 0 === t4) ;
                  else for (; !(s2 = (i3 = r2.call(n3)).done) && (l2.push(i3.value), l2.length !== t4); s2 = true) ;
                } catch (e5) {
                  c2 = true, a2 = e5;
                } finally {
                  try {
                    if (!s2 && null != n3.return && (o2 = n3.return(), Object(o2) !== o2)) return;
                  } finally {
                    if (c2) throw a2;
                  }
                }
                return l2;
              }
            })(e3, t3) || (function(e4, t4) {
              if (!e4) return;
              if ("string" == typeof e4) return c(e4, t4);
              var n3 = Object.prototype.toString.call(e4).slice(8, -1);
              "Object" === n3 && e4.constructor && (n3 = e4.constructor.name);
              if ("Map" === n3 || "Set" === n3) return Array.from(e4);
              if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return c(e4, t4);
            })(e3, t3) || (function() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            })();
          }
          function c(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function u(e3) {
            return u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, u(e3);
          }
          function f(e3, t3) {
            for (var n3 = 0; n3 < t3.length; n3++) {
              var i3 = t3[n3];
              i3.enumerable = i3.enumerable || false, i3.configurable = true, "value" in i3 && (i3.writable = true), Object.defineProperty(e3, (a2 = i3.key, r2 = void 0, r2 = (function(e4, t4) {
                if ("object" !== u(e4) || null === e4) return e4;
                var n4 = e4[Symbol.toPrimitive];
                if (void 0 !== n4) {
                  var i4 = n4.call(e4, t4);
                  if ("object" !== u(i4)) return i4;
                  throw new TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t4 ? String : Number)(e4);
              })(a2, "string"), "symbol" === u(r2) ? r2 : String(r2)), i3);
            }
            var a2, r2;
          }
          function p(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          n2(1313);
          var d = a.default.dependencyLib, h = (function() {
            function e3(t4, n4, i4, a2) {
              !(function(e4, t5) {
                if (!(e4 instanceof t5)) throw new TypeError("Cannot call a class as a function");
              })(this, e3), this.mask = t4, this.format = n4, this.opts = i4, this.inputmask = a2, this._date = new Date(1, 0, 1), this.initDateObject(t4, this.opts, this.inputmask);
            }
            var t3, n3;
            return t3 = e3, (n3 = [{ key: "date", get: function() {
              return void 0 === this._date && (this._date = new Date(1, 0, 1), this.initDateObject(void 0, this.opts, this.inputmask)), this._date;
            } }, { key: "initDateObject", value: function(e4, t4, n4) {
              var i4;
              for (P(t4).lastIndex = 0; i4 = P(t4).exec(this.format); ) {
                var a2 = /\d+$/.exec(i4[0]), r2 = a2 ? i4[0][0] + "x" : i4[0], o2 = void 0;
                if (void 0 !== e4) {
                  if (a2) {
                    var s2 = P(t4).lastIndex, c2 = j.call(n4, i4.index, t4, n4 && n4.maskset);
                    P(t4).lastIndex = s2, o2 = e4.slice(0, e4.indexOf(c2.nextMatch[0]));
                  } else {
                    for (var u2 = i4[0][0], f2 = i4.index; n4 && (t4.placeholder[l.getTest.call(n4, f2).match.placeholder] || l.getTest.call(n4, f2).match.placeholder) === u2; ) f2++;
                    var p2 = f2 - i4.index;
                    o2 = e4.slice(0, p2 || y[r2] && y[r2][4] || r2.length);
                  }
                  e4 = e4.slice(o2.length);
                }
                Object.prototype.hasOwnProperty.call(y, r2) && this.setValue(this, o2, r2, y[r2][2], y[r2][1]);
              }
            } }, { key: "setValue", value: function(e4, t4, n4, i4, a2) {
              if (void 0 !== t4) switch (i4) {
                case "ampm":
                  e4[i4] = t4, e4["raw" + i4] = t4.replace(/\s/g, "_");
                  break;
                case "month":
                  if ("mmm" === n4 || "mmmm" === n4) {
                    e4[i4] = _("mmm" === n4 ? m.monthNames.slice(0, 12).findIndex((function(e5) {
                      return t4.toLowerCase() === e5.toLowerCase();
                    })) + 1 : m.monthNames.slice(12, 24).findIndex((function(e5) {
                      return t4.toLowerCase() === e5.toLowerCase();
                    })) + 1, 2), e4[i4] = "00" === e4[i4] ? "" : e4[i4].toString(), e4["raw" + i4] = e4[i4];
                    break;
                  }
                default:
                  e4[i4] = t4.replace(/[^0-9]/g, "0"), e4["raw" + i4] = t4.replace(/\s/g, "_");
              }
              if (void 0 !== a2) {
                var r2 = e4[i4];
                ("day" === i4 && 29 === parseInt(r2) || "month" === i4 && 2 === parseInt(r2)) && (29 !== parseInt(e4.day) || 2 !== parseInt(e4.month) || "" !== e4.year && void 0 !== e4.year || e4._date.setFullYear(2012, 1, 29)), "day" === i4 && (g = true, 0 === parseInt(r2) && (r2 = 1)), "month" === i4 && (g = true), "year" === i4 && (g = true, r2.length < y[n4][4] && (r2 = _(r2, y[n4][4], true))), ("" !== r2 && !isNaN(r2) || "ampm" === i4) && a2.call(e4._date, r2);
              }
            } }, { key: "reset", value: function() {
              this._date = new Date(1, 0, 1);
            } }, { key: "reInit", value: function() {
              this._date = void 0, this.date;
            } }]) && f(t3.prototype, n3), Object.defineProperty(t3, "prototype", { writable: false }), e3;
          })(), v = (/* @__PURE__ */ new Date()).getFullYear(), m = a.default.prototype.i18n, g = false, y = { d: ["[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", Date.prototype.getDate], dd: ["0[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", function() {
            return _(Date.prototype.getDate.call(this), 2);
          }], ddd: [""], dddd: [""], m: ["[1-9]|1[012]", function(e3) {
            var t3 = e3 ? parseInt(e3) : 0;
            return t3 > 0 && t3--, Date.prototype.setMonth.call(this, t3);
          }, "month", function() {
            return Date.prototype.getMonth.call(this) + 1;
          }], mm: ["0[1-9]|1[012]", function(e3) {
            var t3 = e3 ? parseInt(e3) : 0;
            return t3 > 0 && t3--, Date.prototype.setMonth.call(this, t3);
          }, "month", function() {
            return _(Date.prototype.getMonth.call(this) + 1, 2);
          }], mmm: [m.monthNames.slice(0, 12).join("|"), function(e3) {
            var t3 = m.monthNames.slice(0, 12).findIndex((function(t4) {
              return e3.toLowerCase() === t4.toLowerCase();
            }));
            return -1 !== t3 && Date.prototype.setMonth.call(this, t3);
          }, "month", function() {
            return m.monthNames.slice(0, 12)[Date.prototype.getMonth.call(this)];
          }], mmmm: [m.monthNames.slice(12, 24).join("|"), function(e3) {
            var t3 = m.monthNames.slice(12, 24).findIndex((function(t4) {
              return e3.toLowerCase() === t4.toLowerCase();
            }));
            return -1 !== t3 && Date.prototype.setMonth.call(this, t3);
          }, "month", function() {
            return m.monthNames.slice(12, 24)[Date.prototype.getMonth.call(this)];
          }], yy: ["[0-9]{2}", function(e3) {
            var t3 = (/* @__PURE__ */ new Date()).getFullYear().toString().slice(0, 2);
            Date.prototype.setFullYear.call(this, "".concat(t3).concat(e3));
          }, "year", function() {
            return _(Date.prototype.getFullYear.call(this), 2);
          }, 2], yyyy: ["[0-9]{4}", Date.prototype.setFullYear, "year", function() {
            return _(Date.prototype.getFullYear.call(this), 4);
          }, 4], h: ["[1-9]|1[0-2]", Date.prototype.setHours, "hours", Date.prototype.getHours], hh: ["0[1-9]|1[0-2]", Date.prototype.setHours, "hours", function() {
            return _(Date.prototype.getHours.call(this), 2);
          }], hx: [function(e3) {
            return "[0-9]{".concat(e3, "}");
          }, Date.prototype.setHours, "hours", function(e3) {
            return Date.prototype.getHours;
          }], H: ["1?[0-9]|2[0-3]", Date.prototype.setHours, "hours", Date.prototype.getHours], HH: ["0[0-9]|1[0-9]|2[0-3]", Date.prototype.setHours, "hours", function() {
            return _(Date.prototype.getHours.call(this), 2);
          }], Hx: [function(e3) {
            return "[0-9]{".concat(e3, "}");
          }, Date.prototype.setHours, "hours", function(e3) {
            return function() {
              return _(Date.prototype.getHours.call(this), e3);
            };
          }], M: ["[1-5]?[0-9]", Date.prototype.setMinutes, "minutes", Date.prototype.getMinutes], MM: ["0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]", Date.prototype.setMinutes, "minutes", function() {
            return _(Date.prototype.getMinutes.call(this), 2);
          }], s: ["[1-5]?[0-9]", Date.prototype.setSeconds, "seconds", Date.prototype.getSeconds], ss: ["0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]", Date.prototype.setSeconds, "seconds", function() {
            return _(Date.prototype.getSeconds.call(this), 2);
          }], l: ["[0-9]{3}", Date.prototype.setMilliseconds, "milliseconds", function() {
            return _(Date.prototype.getMilliseconds.call(this), 3);
          }, 3], L: ["[0-9]{2}", Date.prototype.setMilliseconds, "milliseconds", function() {
            return _(Date.prototype.getMilliseconds.call(this), 2);
          }, 2], t: ["[ap]", b, "ampm", x, 1], tt: ["[ap]m", b, "ampm", x, 2], T: ["[AP]", b, "ampm", x, 1], TT: ["[AP]M", b, "ampm", x, 2], Z: [".*", void 0, "Z", function() {
            var e3 = this.toString().match(/\((.+)\)/)[1];
            e3.includes(" ") && (e3 = (e3 = e3.replace("-", " ").toUpperCase()).split(" ").map((function(e4) {
              return s(e4, 1)[0];
            })).join(""));
            return e3;
          }], o: [""], S: [""] }, k = { isoDate: "yyyy-mm-dd", isoTime: "HH:MM:ss", isoDateTime: "yyyy-mm-dd'T'HH:MM:ss", isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'" };
          function b(e3) {
            var t3 = this.getHours();
            e3.toLowerCase().includes("p") ? this.setHours(t3 + 12) : e3.toLowerCase().includes("a") && t3 >= 12 && this.setHours(t3 - 12);
          }
          function x() {
            var e3 = this.getHours();
            return (e3 = e3 || 12) >= 12 ? "PM" : "AM";
          }
          function w(e3) {
            var t3 = /\d+$/.exec(e3[0]);
            if (t3 && void 0 !== t3[0]) {
              var n3 = y[e3[0][0] + "x"].slice("");
              return n3[0] = n3[0](t3[0]), n3[3] = n3[3](t3[0]), n3;
            }
            if (y[e3[0]]) return y[e3[0]];
          }
          function P(e3) {
            if (!e3.tokenizer) {
              var t3 = [], n3 = [];
              for (var i3 in y) if (/\.*x$/.test(i3)) {
                var a2 = i3[0] + "\\d+";
                -1 === n3.indexOf(a2) && n3.push(a2);
              } else -1 === t3.indexOf(i3[0]) && t3.push(i3[0]);
              e3.tokenizer = "(" + (n3.length > 0 ? n3.join("|") + "|" : "") + t3.join("+|") + ")+?|.", e3.tokenizer = new RegExp(e3.tokenizer, "g");
            }
            return e3.tokenizer;
          }
          function S(e3, t3, n3) {
            if (!g) return true;
            if (void 0 === e3.rawday || !isFinite(e3.rawday) && new Date(e3.date.getFullYear(), isFinite(e3.rawmonth) ? e3.month : e3.date.getMonth() + 1, 0).getDate() >= e3.day || "29" == e3.day && (!isFinite(e3.rawyear) || void 0 === e3.rawyear || "" === e3.rawyear) || new Date(e3.date.getFullYear(), isFinite(e3.rawmonth) ? e3.month : e3.date.getMonth() + 1, 0).getDate() >= e3.day) return t3;
            if ("29" == e3.day) {
              var i3 = j.call(this, t3.pos, n3, this.maskset);
              if (i3.targetMatch && "yyyy" === i3.targetMatch[0] && t3.pos - i3.targetMatchIndex == 2) return t3.remove = t3.pos + 1, t3;
            } else if (2 == e3.date.getMonth() && "30" == e3.day && void 0 !== t3.c) return e3.day = "03", e3.date.setDate(3), e3.date.setMonth(1), t3.insert = [{ pos: t3.pos, c: "0" }, { pos: t3.pos + 1, c: t3.c }], t3.caret = o.seekNext.call(this, t3.pos + 1), t3;
            return false;
          }
          function O(e3, t3, n3, a2) {
            var r2, o2, l2 = "", s2 = 0, c2 = {};
            for (P(n3).lastIndex = 0; r2 = P(n3).exec(e3); ) {
              if (void 0 === t3) if (o2 = w(r2)) l2 += "(" + o2[0] + ")", n3.placeholder && "" !== n3.placeholder ? (c2[s2] = n3.placeholder[r2.index % n3.placeholder.length], c2[n3.placeholder[r2.index % n3.placeholder.length]] = r2[0].charAt(0)) : c2[s2] = r2[0].charAt(0);
              else switch (r2[0]) {
                case "[":
                  l2 += "(";
                  break;
                case "]":
                  l2 += ")?";
                  break;
                default:
                  l2 += (0, i2.default)(r2[0]), c2[s2] = r2[0].charAt(0);
              }
              else if (o2 = w(r2)) if (true !== a2 && o2[3]) l2 += o2[3].call(t3.date);
              else o2[2] ? l2 += t3["raw" + o2[2]] : l2 += r2[0];
              else l2 += r2[0];
              s2++;
            }
            return void 0 === t3 && (n3.placeholder = c2), l2;
          }
          function _(e3, t3, n3) {
            for (e3 = String(e3), t3 = t3 || 2; e3.length < t3; ) e3 = n3 ? e3 + "0" : "0" + e3;
            return e3;
          }
          function M(e3, t3, n3) {
            return "string" == typeof e3 ? new h(e3, t3, n3, this) : e3 && "object" === u(e3) && Object.prototype.hasOwnProperty.call(e3, "date") ? e3 : void 0;
          }
          function E(e3, t3) {
            return O(t3.inputFormat, { date: e3 }, t3);
          }
          function j(e3, t3, n3) {
            var i3, a2, r2 = this, o2 = n3 && n3.tests[e3] ? t3.placeholder[n3.tests[e3][0].match.placeholder] || n3.tests[e3][0].match.placeholder : "", s2 = 0, c2 = 0;
            for (P(t3).lastIndex = 0; a2 = P(t3).exec(t3.inputFormat); ) {
              var u2 = /\d+$/.exec(a2[0]);
              if (u2) c2 = parseInt(u2[0]);
              else {
                for (var f2 = a2[0][0], p2 = s2; r2 && (t3.placeholder[l.getTest.call(r2, p2).match.placeholder] || l.getTest.call(r2, p2).match.placeholder) === f2; ) p2++;
                0 === (c2 = p2 - s2) && (c2 = a2[0].length);
              }
              if (s2 += c2, -1 != a2[0].indexOf(o2) || s2 >= e3 + 1) {
                i3 = a2, a2 = P(t3).exec(t3.inputFormat);
                break;
              }
            }
            return { targetMatchIndex: s2 - c2, nextMatch: a2, targetMatch: i3 };
          }
          a.default.extendAliases({ datetime: { mask: function(e3) {
            return e3.numericInput = false, y.S = m.ordinalSuffix.join("|"), e3.inputFormat = k[e3.inputFormat] || e3.inputFormat, e3.displayFormat = k[e3.displayFormat] || e3.displayFormat || e3.inputFormat, e3.outputFormat = k[e3.outputFormat] || e3.outputFormat || e3.inputFormat, e3.regex = O(e3.inputFormat, void 0, e3), e3.min = M(e3.min, e3.inputFormat, e3), e3.max = M(e3.max, e3.inputFormat, e3), null;
          }, placeholder: "", inputFormat: "isoDateTime", displayFormat: null, outputFormat: null, min: null, max: null, skipOptionalPartCharacter: "", preValidation: function(e3, t3, n3, i3, a2, r2, o2, l2) {
            if (l2) return true;
            if (isNaN(n3) && e3[t3] !== n3) {
              var s2 = j.call(this, t3, a2, r2);
              if (s2.nextMatch && s2.nextMatch[0] === n3 && s2.targetMatch[0].length > 1) {
                var c2 = w(s2.targetMatch)[0];
                if (new RegExp(c2).test("0" + e3[t3 - 1])) return e3[t3] = e3[t3 - 1], e3[t3 - 1] = "0", { fuzzy: true, buffer: e3, refreshFromBuffer: { start: t3 - 1, end: t3 + 1 }, pos: t3 + 1 };
              }
            }
            return true;
          }, postValidation: function(e3, t3, n3, i3, a2, r2, o2, s2) {
            var c2, u2, f2 = this;
            if (o2) return true;
            if (false === i3 && (((c2 = j.call(f2, t3 + 1, a2, r2)).targetMatch && c2.targetMatchIndex === t3 && c2.targetMatch[0].length > 1 && void 0 !== y[c2.targetMatch[0]] || (c2 = j.call(f2, t3 + 2, a2, r2)).targetMatch && c2.targetMatchIndex === t3 + 1 && c2.targetMatch[0].length > 1 && void 0 !== y[c2.targetMatch[0]]) && (u2 = w(c2.targetMatch)[0]), void 0 !== u2 && (void 0 !== r2.validPositions[t3 + 1] && new RegExp(u2).test(n3 + "0") ? (e3[t3] = n3, e3[t3 + 1] = "0", i3 = { pos: t3 + 2, caret: t3 }) : new RegExp(u2).test("0" + n3) && (e3[t3] = "0", e3[t3 + 1] = n3, i3 = { pos: t3 + 2 })), false === i3)) return i3;
            if (i3.fuzzy && (e3 = i3.buffer, t3 = i3.pos), (c2 = j.call(f2, t3, a2, r2)).targetMatch && c2.targetMatch[0] && void 0 !== y[c2.targetMatch[0]]) {
              var p2 = w(c2.targetMatch);
              u2 = p2[0];
              var d2 = e3.slice(c2.targetMatchIndex, c2.targetMatchIndex + c2.targetMatch[0].length);
              if (false === new RegExp(u2).test(d2.join("")) && 2 === c2.targetMatch[0].length && r2.validPositions[c2.targetMatchIndex] && r2.validPositions[c2.targetMatchIndex + 1] && (r2.validPositions[c2.targetMatchIndex + 1].input = "0"), "year" == p2[2]) for (var h2 = l.getMaskTemplate.call(f2, false, 1, void 0, true), m2 = t3 + 1; m2 < e3.length; m2++) e3[m2] = h2[m2], r2.validPositions.splice(t3 + 1, 1);
            }
            var g2 = i3, k2 = M.call(f2, e3.join(""), a2.inputFormat, a2);
            return g2 && !isNaN(k2.date.getTime()) && (a2.prefillYear && (g2 = (function(e4, t4, n4) {
              if (e4.year !== e4.rawyear) {
                var i4 = v.toString(), a3 = e4.rawyear.replace(/[^0-9]/g, ""), r3 = i4.slice(0, a3.length), o3 = i4.slice(a3.length);
                if (2 === a3.length && a3 === r3) {
                  var l2 = new Date(v, e4.month - 1, e4.day);
                  e4.day == l2.getDate() && (!n4.max || n4.max.date.getTime() >= l2.getTime()) && (e4.date.setFullYear(v), e4.year = i4, t4.insert = [{ pos: t4.pos + 1, c: o3[0] }, { pos: t4.pos + 2, c: o3[1] }]);
                }
              }
              return t4;
            })(k2, g2, a2)), g2 = (function(e4, t4, n4, i4, a3) {
              if (!t4) return t4;
              if (t4 && n4.min && !isNaN(n4.min.date.getTime())) {
                var r3;
                for (e4.reset(), P(n4).lastIndex = 0; r3 = P(n4).exec(n4.inputFormat); ) {
                  var o3;
                  if ((o3 = w(r3)) && o3[3]) {
                    for (var l2 = o3[1], s3 = e4[o3[2]], c3 = n4.min[o3[2]], u3 = n4.max ? n4.max[o3[2]] : c3 + 1, f3 = [], p3 = false, d3 = 0; d3 < c3.length; d3++) void 0 !== i4.validPositions[d3 + r3.index] || p3 ? (f3[d3] = s3[d3], p3 = p3 || s3[d3] > c3[d3]) : (d3 + r3.index == 0 && s3[d3] < c3[d3] ? (f3[d3] = s3[d3], p3 = true) : f3[d3] = c3[d3], "year" === o3[2] && s3.length - 1 == d3 && c3 != u3 && (f3 = (parseInt(f3.join("")) + 1).toString().split("")), "ampm" === o3[2] && c3 != u3 && n4.min.date.getTime() > e4.date.getTime() && (f3[d3] = u3[d3]));
                    l2.call(e4._date, f3.join(""));
                  }
                }
                t4 = n4.min.date.getTime() <= e4.date.getTime(), e4.reInit();
              }
              return t4 && n4.max && (isNaN(n4.max.date.getTime()) || (t4 = n4.max.date.getTime() >= e4.date.getTime())), t4;
            })(k2, g2 = S.call(f2, k2, g2, a2), a2, r2)), void 0 !== t3 && g2 && i3.pos !== t3 ? { buffer: O(a2.inputFormat, k2, a2).split(""), refreshFromBuffer: { start: t3, end: i3.pos }, pos: i3.caret || i3.pos } : g2;
          }, onKeyDown: function(e3, t3, n3, i3) {
            e3.ctrlKey && e3.key === r.keys.ArrowRight && (this.inputmask._valueSet(E(/* @__PURE__ */ new Date(), i3)), d(this).trigger("setvalue"));
          }, onUnMask: function(e3, t3, n3) {
            return t3 ? O(n3.outputFormat, M.call(this, e3, n3.inputFormat, n3), n3, true) : t3;
          }, casing: function(e3, t3, n3, i3) {
            if (0 == t3.nativeDef.indexOf("[ap]")) return e3.toLowerCase();
            if (0 == t3.nativeDef.indexOf("[AP]")) return e3.toUpperCase();
            var a2 = l.getTest.call(this, [n3 - 1]);
            return 0 == a2.match.def.indexOf("[AP]") || 0 === n3 || a2 && a2.input === String.fromCharCode(r.keyCode.Space) || a2 && a2.match.def === String.fromCharCode(r.keyCode.Space) ? e3.toUpperCase() : e3.toLowerCase();
          }, onBeforeMask: function(e3, t3) {
            return "[object Date]" === Object.prototype.toString.call(e3) && (e3 = E(e3, t3)), e3;
          }, insertMode: false, insertModeVisual: false, shiftPositions: false, keepStatic: false, inputmode: "numeric", prefillYear: true } });
        }, 1313: function(e2, t2, n2) {
          var i2, a = (i2 = n2(2394)) && i2.__esModule ? i2 : { default: i2 };
          a.default.dependencyLib.extend(true, a.default.prototype.i18n, { dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], ordinalSuffix: ["st", "nd", "rd", "th"] });
        }, 3851: function(e2, t2, n2) {
          var i2, a = (i2 = n2(2394)) && i2.__esModule ? i2 : { default: i2 }, r = n2(8711), o = n2(4713);
          function l(e3) {
            return (function(e4) {
              if (Array.isArray(e4)) return s(e4);
            })(e3) || (function(e4) {
              if ("undefined" != typeof Symbol && null != e4[Symbol.iterator] || null != e4["@@iterator"]) return Array.from(e4);
            })(e3) || (function(e4, t3) {
              if (!e4) return;
              if ("string" == typeof e4) return s(e4, t3);
              var n3 = Object.prototype.toString.call(e4).slice(8, -1);
              "Object" === n3 && e4.constructor && (n3 = e4.constructor.name);
              if ("Map" === n3 || "Set" === n3) return Array.from(e4);
              if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return s(e4, t3);
            })(e3) || (function() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            })();
          }
          function s(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          a.default.extendDefinitions({ A: { validator: "[A-Za-zА-яЁёÀ-ÿµ]", casing: "upper" }, "&": { validator: "[0-9A-Za-zА-яЁёÀ-ÿµ]", casing: "upper" }, "#": { validator: "[0-9A-Fa-f]", casing: "upper" } });
          var c = /25[0-5]|2[0-4][0-9]|[01][0-9][0-9]/;
          function u(e3, t3, n3, i3, a2) {
            if (n3 - 1 > -1 && "." !== t3.buffer[n3 - 1] ? (e3 = t3.buffer[n3 - 1] + e3, e3 = n3 - 2 > -1 && "." !== t3.buffer[n3 - 2] ? t3.buffer[n3 - 2] + e3 : "0" + e3) : e3 = "00" + e3, a2.greedy && parseInt(e3) > 255 && c.test("00" + e3.charAt(2))) {
              var r2 = [].concat(l(t3.buffer.slice(0, n3)), [".", e3.charAt(2)]);
              if (r2.join("").match(/\./g).length < 4) return { refreshFromBuffer: true, buffer: r2, caret: n3 + 2 };
            }
            return c.test(e3);
          }
          a.default.extendAliases({ cssunit: { regex: "[+-]?[0-9]+\\.?([0-9]+)?(px|em|rem|ex|%|in|cm|mm|pt|pc)" }, url: { regex: "(https?|ftp)://.*", autoUnmask: false, keepStatic: false, tabThrough: true }, ip: { mask: "i{1,3}.j{1,3}.k{1,3}.l{1,3}", definitions: { i: { validator: u }, j: { validator: u }, k: { validator: u }, l: { validator: u } }, onUnMask: function(e3, t3, n3) {
            return e3;
          }, inputmode: "decimal", substitutes: { ",": "." } }, email: { mask: function(e3) {
            var t3 = e3.separator, n3 = e3.quantifier, i3 = "*{1,64}[.*{1,64}][.*{1,64}][.*{1,63}]@-{1,63}.-{1,63}[.-{1,63}][.-{1,63}]", a2 = i3;
            if (t3) for (var r2 = 0; r2 < n3; r2++) a2 += "[".concat(t3).concat(i3, "]");
            return a2;
          }, greedy: false, casing: "lower", separator: null, quantifier: 5, skipOptionalPartCharacter: "", onBeforePaste: function(e3, t3) {
            return (e3 = e3.toLowerCase()).replace("mailto:", "");
          }, definitions: { "*": { validator: "[0-9１-９A-Za-zА-яЁёÀ-ÿµ!#$%&'*+/=?^_`{|}~-]" }, "-": { validator: "[0-9A-Za-z-]" } }, onUnMask: function(e3, t3, n3) {
            return e3;
          }, inputmode: "email" }, mac: { mask: "##:##:##:##:##:##" }, vin: { mask: "V{13}9{4}", definitions: { V: { validator: "[A-HJ-NPR-Za-hj-npr-z\\d]", casing: "upper" } }, clearIncomplete: true, autoUnmask: true }, ssn: { mask: "999-99-9999", postValidation: function(e3, t3, n3, i3, a2, l2, s2) {
            var c2 = o.getMaskTemplate.call(this, true, r.getLastValidPosition.call(this), true, true);
            return /^(?!219-09-9999|078-05-1120)(?!666|000|9.{2}).{3}-(?!00).{2}-(?!0{4}).{4}$/.test(c2.join(""));
          } } });
        }, 207: function(e2, t2, n2) {
          var i2 = l(n2(7184)), a = l(n2(2394)), r = n2(2839), o = n2(8711);
          function l(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var s = a.default.dependencyLib;
          function c(e3, t3) {
            for (var n3 = "", i3 = 0; i3 < e3.length; i3++) a.default.prototype.definitions[e3.charAt(i3)] || t3.definitions[e3.charAt(i3)] || t3.optionalmarker[0] === e3.charAt(i3) || t3.optionalmarker[1] === e3.charAt(i3) || t3.quantifiermarker[0] === e3.charAt(i3) || t3.quantifiermarker[1] === e3.charAt(i3) || t3.groupmarker[0] === e3.charAt(i3) || t3.groupmarker[1] === e3.charAt(i3) || t3.alternatormarker === e3.charAt(i3) ? n3 += "\\" + e3.charAt(i3) : n3 += e3.charAt(i3);
            return n3;
          }
          function u(e3, t3, n3, i3) {
            if (e3.length > 0 && t3 > 0 && (!n3.digitsOptional || i3)) {
              var a2 = e3.indexOf(n3.radixPoint), r2 = false;
              n3.negationSymbol.back === e3[e3.length - 1] && (r2 = true, e3.length--), -1 === a2 && (e3.push(n3.radixPoint), a2 = e3.length - 1);
              for (var o2 = 1; o2 <= t3; o2++) isFinite(e3[a2 + o2]) || (e3[a2 + o2] = "0");
            }
            return r2 && e3.push(n3.negationSymbol.back), e3;
          }
          function f(e3, t3) {
            var n3 = 0;
            for (var i3 in "+" === e3 && (n3 = o.seekNext.call(this, t3.validPositions.length - 1)), t3.tests) if ((i3 = parseInt(i3)) >= n3) {
              for (var a2 = 0, r2 = t3.tests[i3].length; a2 < r2; a2++) if ((void 0 === t3.validPositions[i3] || "-" === e3) && t3.tests[i3][a2].match.def === e3) return i3 + (void 0 !== t3.validPositions[i3] && "-" !== e3 ? 1 : 0);
            }
            return n3;
          }
          function p(e3, t3) {
            for (var n3 = -1, i3 = 0, a2 = t3.validPositions.length; i3 < a2; i3++) {
              var r2 = t3.validPositions[i3];
              if (r2 && r2.match.def === e3) {
                n3 = i3;
                break;
              }
            }
            return n3;
          }
          function d(e3, t3, n3, i3, a2) {
            var r2 = t3.buffer ? t3.buffer.indexOf(a2.radixPoint) : -1, o2 = (-1 !== r2 || i3 && a2.jitMasking) && new RegExp(a2.definitions[9].validator).test(e3);
            return !i3 && a2._radixDance && -1 !== r2 && o2 && null == t3.validPositions[r2] ? { insert: { pos: r2 === n3 ? r2 + 1 : r2, c: a2.radixPoint }, pos: n3 } : o2;
          }
          a.default.extendAliases({ numeric: { mask: function(e3) {
            e3.repeat = 0, e3.groupSeparator === e3.radixPoint && e3.digits && "0" !== e3.digits && ("." === e3.radixPoint ? e3.groupSeparator = "," : "," === e3.radixPoint ? e3.groupSeparator = "." : e3.groupSeparator = ""), " " === e3.groupSeparator && (e3.skipOptionalPartCharacter = void 0), e3.placeholder.length > 1 && (e3.placeholder = e3.placeholder.charAt(0)), "radixFocus" === e3.positionCaretOnClick && "" === e3.placeholder && (e3.positionCaretOnClick = "lvp");
            var t3 = "0", n3 = e3.radixPoint;
            true === e3.numericInput && void 0 === e3.__financeInput ? (t3 = "1", e3.positionCaretOnClick = "radixFocus" === e3.positionCaretOnClick ? "lvp" : e3.positionCaretOnClick, e3.digitsOptional = false, isNaN(e3.digits) && (e3.digits = 2), e3._radixDance = false, n3 = "," === e3.radixPoint ? "?" : "!", "" !== e3.radixPoint && void 0 === e3.definitions[n3] && (e3.definitions[n3] = {}, e3.definitions[n3].validator = "[" + e3.radixPoint + "]", e3.definitions[n3].placeholder = e3.radixPoint, e3.definitions[n3].static = true, e3.definitions[n3].generated = true)) : (e3.__financeInput = false, e3.numericInput = true);
            var a2, r2 = "[+]";
            if (r2 += c(e3.prefix, e3), "" !== e3.groupSeparator ? (void 0 === e3.definitions[e3.groupSeparator] && (e3.definitions[e3.groupSeparator] = {}, e3.definitions[e3.groupSeparator].validator = "[" + e3.groupSeparator + "]", e3.definitions[e3.groupSeparator].placeholder = e3.groupSeparator, e3.definitions[e3.groupSeparator].static = true, e3.definitions[e3.groupSeparator].generated = true), r2 += e3._mask(e3)) : r2 += "9{+}", void 0 !== e3.digits && 0 !== e3.digits) {
              var o2 = e3.digits.toString().split(",");
              isFinite(o2[0]) && o2[1] && isFinite(o2[1]) ? r2 += n3 + t3 + "{" + e3.digits + "}" : (isNaN(e3.digits) || parseInt(e3.digits) > 0) && (e3.digitsOptional || e3.jitMasking ? (a2 = r2 + n3 + t3 + "{0," + e3.digits + "}", e3.keepStatic = true) : r2 += n3 + t3 + "{" + e3.digits + "}");
            } else e3.inputmode = "numeric";
            return r2 += c(e3.suffix, e3), r2 += "[-]", a2 && (r2 = [a2 + c(e3.suffix, e3) + "[-]", r2]), e3.greedy = false, (function(e4) {
              void 0 === e4.parseMinMaxOptions && (null !== e4.min && (e4.min = e4.min.toString().replace(new RegExp((0, i2.default)(e4.groupSeparator), "g"), ""), "," === e4.radixPoint && (e4.min = e4.min.replace(e4.radixPoint, ".")), e4.min = isFinite(e4.min) ? parseFloat(e4.min) : NaN, isNaN(e4.min) && (e4.min = Number.MIN_VALUE)), null !== e4.max && (e4.max = e4.max.toString().replace(new RegExp((0, i2.default)(e4.groupSeparator), "g"), ""), "," === e4.radixPoint && (e4.max = e4.max.replace(e4.radixPoint, ".")), e4.max = isFinite(e4.max) ? parseFloat(e4.max) : NaN, isNaN(e4.max) && (e4.max = Number.MAX_VALUE)), e4.parseMinMaxOptions = "done");
            })(e3), "" !== e3.radixPoint && e3.substituteRadixPoint && (e3.substitutes["." == e3.radixPoint ? "," : "."] = e3.radixPoint), r2;
          }, _mask: function(e3) {
            return "(" + e3.groupSeparator + "999){+|1}";
          }, digits: "*", digitsOptional: true, enforceDigitsOnBlur: false, radixPoint: ".", positionCaretOnClick: "radixFocus", _radixDance: true, groupSeparator: "", allowMinus: true, negationSymbol: { front: "-", back: "" }, prefix: "", suffix: "", min: null, max: null, SetMaxOnOverflow: false, step: 1, inputType: "text", unmaskAsNumber: false, roundingFN: Math.round, inputmode: "decimal", shortcuts: { k: "1000", m: "1000000" }, placeholder: "0", greedy: false, rightAlign: true, insertMode: true, autoUnmask: false, skipOptionalPartCharacter: "", usePrototypeDefinitions: false, stripLeadingZeroes: true, substituteRadixPoint: true, definitions: { 0: { validator: d }, 1: { validator: d, definitionSymbol: "9" }, 9: { validator: "[0-9０-９٠-٩۰-۹]", definitionSymbol: "*" }, "+": { validator: function(e3, t3, n3, i3, a2) {
            return a2.allowMinus && ("-" === e3 || e3 === a2.negationSymbol.front);
          } }, "-": { validator: function(e3, t3, n3, i3, a2) {
            return a2.allowMinus && e3 === a2.negationSymbol.back;
          } } }, preValidation: function(e3, t3, n3, i3, a2, r2, o2, l2) {
            var s2 = this;
            if (false !== a2.__financeInput && n3 === a2.radixPoint) return false;
            var c2 = e3.indexOf(a2.radixPoint), u2 = t3;
            if (t3 = (function(e4, t4, n4, i4, a3) {
              return a3._radixDance && a3.numericInput && t4 !== a3.negationSymbol.back && e4 <= n4 && (n4 > 0 || t4 == a3.radixPoint) && (void 0 === i4.validPositions[e4 - 1] || i4.validPositions[e4 - 1].input !== a3.negationSymbol.back) && (e4 -= 1), e4;
            })(t3, n3, c2, r2, a2), "-" === n3 || n3 === a2.negationSymbol.front) {
              if (true !== a2.allowMinus) return false;
              var d2 = false, h = p("+", r2), v = p("-", r2);
              return -1 !== h && (d2 = [h], -1 !== v && d2.push(v)), false !== d2 ? { remove: d2, caret: u2 - a2.negationSymbol.back.length } : { insert: [{ pos: f.call(s2, "+", r2), c: a2.negationSymbol.front, fromIsValid: true }, { pos: f.call(s2, "-", r2), c: a2.negationSymbol.back, fromIsValid: void 0 }], caret: u2 + a2.negationSymbol.back.length };
            }
            if (n3 === a2.groupSeparator) return { caret: u2 };
            if (l2) return true;
            if (-1 !== c2 && true === a2._radixDance && false === i3 && n3 === a2.radixPoint && void 0 !== a2.digits && (isNaN(a2.digits) || parseInt(a2.digits) > 0) && c2 !== t3) {
              var m = f.call(s2, a2.radixPoint, r2);
              return r2.validPositions[m] && (r2.validPositions[m].generatedInput = r2.validPositions[m].generated || false), { caret: a2._radixDance && t3 === c2 - 1 ? c2 + 1 : c2 };
            }
            if (false === a2.__financeInput) {
              if (i3) {
                if (a2.digitsOptional) return { rewritePosition: o2.end };
                if (!a2.digitsOptional) {
                  if (o2.begin > c2 && o2.end <= c2) return n3 === a2.radixPoint ? { insert: { pos: c2 + 1, c: "0", fromIsValid: true }, rewritePosition: c2 } : { rewritePosition: c2 + 1 };
                  if (o2.begin < c2) return { rewritePosition: o2.begin - 1 };
                }
              } else if (!a2.showMaskOnHover && !a2.showMaskOnFocus && !a2.digitsOptional && a2.digits > 0 && "" === this.__valueGet.call(this.el)) return { rewritePosition: c2 };
            }
            return { rewritePosition: t3 };
          }, postValidation: function(e3, t3, n3, i3, a2, r2, o2) {
            if (false === i3) return i3;
            if (o2) return true;
            if (null !== a2.min || null !== a2.max) {
              var l2 = a2.onUnMask(e3.slice().reverse().join(""), void 0, s.extend({}, a2, { unmaskAsNumber: true }));
              if (null !== a2.min && l2 < a2.min && (l2.toString().length > a2.min.toString().length || l2 < 0)) return false;
              if (null !== a2.max && l2 > a2.max) return !!a2.SetMaxOnOverflow && { refreshFromBuffer: true, buffer: u(a2.max.toString().replace(".", a2.radixPoint).split(""), a2.digits, a2).reverse() };
            }
            return i3;
          }, onUnMask: function(e3, t3, n3) {
            if ("" === t3 && true === n3.nullable) return t3;
            var a2 = e3.replace(n3.prefix, "");
            return a2 = (a2 = a2.replace(n3.suffix, "")).replace(new RegExp((0, i2.default)(n3.groupSeparator), "g"), ""), "" !== n3.placeholder.charAt(0) && (a2 = a2.replace(new RegExp(n3.placeholder.charAt(0), "g"), "0")), n3.unmaskAsNumber ? ("" !== n3.radixPoint && -1 !== a2.indexOf(n3.radixPoint) && (a2 = a2.replace(i2.default.call(this, n3.radixPoint), ".")), a2 = (a2 = a2.replace(new RegExp("^" + (0, i2.default)(n3.negationSymbol.front)), "-")).replace(new RegExp((0, i2.default)(n3.negationSymbol.back) + "$"), ""), Number(a2)) : a2;
          }, isComplete: function(e3, t3) {
            var n3 = (t3.numericInput ? e3.slice().reverse() : e3).join("");
            return n3 = (n3 = (n3 = (n3 = (n3 = n3.replace(new RegExp("^" + (0, i2.default)(t3.negationSymbol.front)), "-")).replace(new RegExp((0, i2.default)(t3.negationSymbol.back) + "$"), "")).replace(t3.prefix, "")).replace(t3.suffix, "")).replace(new RegExp((0, i2.default)(t3.groupSeparator) + "([0-9]{3})", "g"), "$1"), "," === t3.radixPoint && (n3 = n3.replace((0, i2.default)(t3.radixPoint), ".")), isFinite(n3);
          }, onBeforeMask: function(e3, t3) {
            var n3;
            e3 = null !== (n3 = e3) && void 0 !== n3 ? n3 : "";
            var a2 = t3.radixPoint || ",";
            isFinite(t3.digits) && (t3.digits = parseInt(t3.digits)), "number" != typeof e3 && "number" !== t3.inputType || "" === a2 || (e3 = e3.toString().replace(".", a2));
            var r2 = "-" === e3.charAt(0) || e3.charAt(0) === t3.negationSymbol.front, o2 = e3.split(a2), l2 = o2[0].replace(/[^\-0-9]/g, ""), s2 = o2.length > 1 ? o2[1].replace(/[^0-9]/g, "") : "", c2 = o2.length > 1;
            e3 = l2 + ("" !== s2 ? a2 + s2 : s2);
            var f2 = 0;
            if ("" !== a2 && (f2 = t3.digitsOptional ? t3.digits < s2.length ? t3.digits : s2.length : t3.digits, "" !== s2 || !t3.digitsOptional)) {
              var p2 = Math.pow(10, f2 || 1);
              e3 = e3.replace((0, i2.default)(a2), "."), isNaN(parseFloat(e3)) || (e3 = (t3.roundingFN(parseFloat(e3) * p2) / p2).toFixed(f2)), e3 = e3.toString().replace(".", a2);
            }
            if (0 === t3.digits && -1 !== e3.indexOf(a2) && (e3 = e3.substring(0, e3.indexOf(a2))), null !== t3.min || null !== t3.max) {
              var d2 = e3.toString().replace(a2, ".");
              null !== t3.min && d2 < t3.min ? e3 = t3.min.toString().replace(".", a2) : null !== t3.max && d2 > t3.max && (e3 = t3.max.toString().replace(".", a2));
            }
            return r2 && "-" !== e3.charAt(0) && (e3 = "-" + e3), u(e3.toString().split(""), f2, t3, c2).join("");
          }, onBeforeWrite: function(e3, t3, n3, a2) {
            function r2(e4, t4) {
              if (false !== a2.__financeInput || t4) {
                var n4 = e4.indexOf(a2.radixPoint);
                -1 !== n4 && e4.splice(n4, 1);
              }
              if ("" !== a2.groupSeparator) for (; -1 !== (n4 = e4.indexOf(a2.groupSeparator)); ) e4.splice(n4, 1);
              return e4;
            }
            var o2, l2;
            if (a2.stripLeadingZeroes && (l2 = (function(e4, t4) {
              var n4 = new RegExp("(^" + ("" !== t4.negationSymbol.front ? (0, i2.default)(t4.negationSymbol.front) + "?" : "") + (0, i2.default)(t4.prefix) + ")(.*)(" + (0, i2.default)(t4.suffix) + ("" != t4.negationSymbol.back ? (0, i2.default)(t4.negationSymbol.back) + "?" : "") + "$)").exec(e4.slice().reverse().join("")), a3 = n4 ? n4[2] : "", r3 = false;
              return a3 && (a3 = a3.split(t4.radixPoint.charAt(0))[0], r3 = new RegExp("^[0" + t4.groupSeparator + "]*").exec(a3)), !(!r3 || !(r3[0].length > 1 || r3[0].length > 0 && r3[0].length < a3.length)) && r3;
            })(t3, a2))) for (var c2 = t3.join("").lastIndexOf(l2[0].split("").reverse().join("")) - (l2[0] == l2.input ? 0 : 1), f2 = l2[0] == l2.input ? 1 : 0, p2 = l2[0].length - f2; p2 > 0; p2--) this.maskset.validPositions.splice(c2 + p2, 1), delete t3[c2 + p2];
            if (e3) switch (e3.type) {
              case "blur":
              case "checkval":
                if (null !== a2.min) {
                  var d2 = a2.onUnMask(t3.slice().reverse().join(""), void 0, s.extend({}, a2, { unmaskAsNumber: true }));
                  if (null !== a2.min && d2 < a2.min) return { refreshFromBuffer: true, buffer: u(a2.min.toString().replace(".", a2.radixPoint).split(""), a2.digits, a2).reverse() };
                }
                if (t3[t3.length - 1] === a2.negationSymbol.front) {
                  var h = new RegExp("(^" + ("" != a2.negationSymbol.front ? (0, i2.default)(a2.negationSymbol.front) + "?" : "") + (0, i2.default)(a2.prefix) + ")(.*)(" + (0, i2.default)(a2.suffix) + ("" != a2.negationSymbol.back ? (0, i2.default)(a2.negationSymbol.back) + "?" : "") + "$)").exec(r2(t3.slice(), true).reverse().join(""));
                  0 == (h ? h[2] : "") && (o2 = { refreshFromBuffer: true, buffer: [0] });
                } else if ("" !== a2.radixPoint) {
                  t3.indexOf(a2.radixPoint) === a2.suffix.length && (o2 && o2.buffer ? o2.buffer.splice(0, 1 + a2.suffix.length) : (t3.splice(0, 1 + a2.suffix.length), o2 = { refreshFromBuffer: true, buffer: r2(t3) }));
                }
                if (a2.enforceDigitsOnBlur) {
                  var v = (o2 = o2 || {}) && o2.buffer || t3.slice().reverse();
                  o2.refreshFromBuffer = true, o2.buffer = u(v, a2.digits, a2, true).reverse();
                }
            }
            return o2;
          }, onKeyDown: function(e3, t3, n3, i3) {
            var a2, o2 = s(this);
            if (3 != e3.location) {
              var l2, c2 = e3.key;
              if ((l2 = i3.shortcuts && i3.shortcuts[c2]) && l2.length > 1) return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) * parseInt(l2)), o2.trigger("setvalue"), false;
            }
            if (e3.ctrlKey) switch (e3.key) {
              case r.keys.ArrowUp:
                return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) + parseInt(i3.step)), o2.trigger("setvalue"), false;
              case r.keys.ArrowDown:
                return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) - parseInt(i3.step)), o2.trigger("setvalue"), false;
            }
            if (!e3.shiftKey && (e3.key === r.keys.Delete || e3.key === r.keys.Backspace || e3.key === r.keys.BACKSPACE_SAFARI) && n3.begin !== t3.length) {
              if (t3[e3.key === r.keys.Delete ? n3.begin - 1 : n3.end] === i3.negationSymbol.front) return a2 = t3.slice().reverse(), "" !== i3.negationSymbol.front && a2.shift(), "" !== i3.negationSymbol.back && a2.pop(), o2.trigger("setvalue", [a2.join(""), n3.begin]), false;
              if (true === i3._radixDance) {
                var f2, p2 = t3.indexOf(i3.radixPoint);
                if (i3.digitsOptional) {
                  if (0 === p2) return (a2 = t3.slice().reverse()).pop(), o2.trigger("setvalue", [a2.join(""), n3.begin >= a2.length ? a2.length : n3.begin]), false;
                } else if (-1 !== p2 && (n3.begin < p2 || n3.end < p2 || e3.key === r.keys.Delete && (n3.begin === p2 || n3.begin - 1 === p2))) return n3.begin === n3.end && (e3.key === r.keys.Backspace || e3.key === r.keys.BACKSPACE_SAFARI ? n3.begin++ : e3.key === r.keys.Delete && n3.begin - 1 === p2 && (f2 = s.extend({}, n3), n3.begin--, n3.end--)), (a2 = t3.slice().reverse()).splice(a2.length - n3.begin, n3.begin - n3.end + 1), a2 = u(a2, i3.digits, i3).join(""), f2 && (n3 = f2), o2.trigger("setvalue", [a2, n3.begin >= a2.length ? p2 + 1 : n3.begin]), false;
              }
            }
          } }, currency: { prefix: "", groupSeparator: ",", alias: "numeric", digits: 2, digitsOptional: false }, decimal: { alias: "numeric" }, integer: { alias: "numeric", inputmode: "numeric", digits: 0 }, percentage: { alias: "numeric", min: 0, max: 100, suffix: " %", digits: 0, allowMinus: false }, indianns: { alias: "numeric", _mask: function(e3) {
            return "(" + e3.groupSeparator + "99){*|1}(" + e3.groupSeparator + "999){1|1}";
          }, groupSeparator: ",", radixPoint: ".", placeholder: "0", digits: 2, digitsOptional: false } });
        }, 9380: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          var n2 = !("undefined" == typeof window || !window.document || !window.document.createElement);
          t2.default = n2 ? window : {};
        }, 7760: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.HandleNativePlaceholder = function(e3, t3) {
            var n3 = e3 ? e3.inputmask : this;
            if (i2.ie) {
              if (e3.inputmask._valueGet() !== t3 && (e3.placeholder !== t3 || "" === e3.placeholder)) {
                var a2 = o.getBuffer.call(n3).slice(), r2 = e3.inputmask._valueGet();
                if (r2 !== t3) {
                  var l2 = o.getLastValidPosition.call(n3);
                  -1 === l2 && r2 === o.getBufferTemplate.call(n3).join("") ? a2 = [] : -1 !== l2 && u.call(n3, a2), p(e3, a2);
                }
              }
            } else e3.placeholder !== t3 && (e3.placeholder = t3, "" === e3.placeholder && e3.removeAttribute("placeholder"));
          }, t2.applyInputValue = c, t2.checkVal = f, t2.clearOptionalTail = u, t2.unmaskedvalue = function(e3) {
            var t3 = e3 ? e3.inputmask : this, n3 = t3.opts, i3 = t3.maskset;
            if (e3) {
              if (void 0 === e3.inputmask) return e3.value;
              e3.inputmask && e3.inputmask.refreshValue && c(e3, e3.inputmask._valueGet(true));
            }
            for (var a2 = [], r2 = i3.validPositions, l2 = 0, s2 = r2.length; l2 < s2; l2++) r2[l2] && r2[l2].match && (1 != r2[l2].match.static || Array.isArray(i3.metadata) && true !== r2[l2].generatedInput) && a2.push(r2[l2].input);
            var u2 = 0 === a2.length ? "" : (t3.isRTL ? a2.reverse() : a2).join("");
            if ("function" == typeof n3.onUnMask) {
              var f2 = (t3.isRTL ? o.getBuffer.call(t3).slice().reverse() : o.getBuffer.call(t3)).join("");
              u2 = n3.onUnMask.call(t3, f2, u2, n3);
            }
            return u2;
          }, t2.writeBuffer = p;
          var i2 = n2(9845), a = n2(6030), r = n2(2839), o = n2(8711), l = n2(7215), s = n2(4713);
          function c(e3, t3, n3) {
            var i3 = e3 ? e3.inputmask : this, a2 = i3.opts;
            e3.inputmask.refreshValue = false, "function" == typeof a2.onBeforeMask && (t3 = a2.onBeforeMask.call(i3, t3, a2) || t3), f(e3, true, false, t3 = (t3 || "").toString().split(""), n3), i3.undoValue = i3._valueGet(true), (a2.clearMaskOnLostFocus || a2.clearIncomplete) && e3.inputmask._valueGet() === o.getBufferTemplate.call(i3).join("") && -1 === o.getLastValidPosition.call(i3) && e3.inputmask._valueSet("");
          }
          function u(e3) {
            e3.length = 0;
            for (var t3, n3 = s.getMaskTemplate.call(this, true, 0, true, void 0, true); void 0 !== (t3 = n3.shift()); ) e3.push(t3);
            return e3;
          }
          function f(e3, t3, n3, i3, r2) {
            var c2, u2 = e3 ? e3.inputmask : this, f2 = u2.maskset, d = u2.opts, h = u2.dependencyLib, v = i3.slice(), m = "", g = -1, y = d.skipOptionalPartCharacter;
            d.skipOptionalPartCharacter = "", o.resetMaskSet.call(u2, false), u2.clicked = 0, g = d.radixPoint ? o.determineNewCaretPosition.call(u2, { begin: 0, end: 0 }, false, false === d.__financeInput ? "radixFocus" : void 0).begin : 0, f2.p = g, u2.caretPos = { begin: g };
            var k = [], b = u2.caretPos;
            if (v.forEach((function(e4, t4) {
              if (void 0 !== e4) {
                var i4 = new h.Event("_checkval");
                i4.key = e4, m += e4;
                var r3 = o.getLastValidPosition.call(u2, void 0, true);
                !(function(e5, t5) {
                  for (var n4 = s.getMaskTemplate.call(u2, true, 0).slice(e5, o.seekNext.call(u2, e5, false, false)).join("").replace(/'/g, ""), i5 = n4.indexOf(t5); i5 > 0 && " " === n4[i5 - 1]; ) i5--;
                  var a2 = 0 === i5 && !o.isMask.call(u2, e5) && (s.getTest.call(u2, e5).match.nativeDef === t5.charAt(0) || true === s.getTest.call(u2, e5).match.static && s.getTest.call(u2, e5).match.nativeDef === "'" + t5.charAt(0) || " " === s.getTest.call(u2, e5).match.nativeDef && (s.getTest.call(u2, e5 + 1).match.nativeDef === t5.charAt(0) || true === s.getTest.call(u2, e5 + 1).match.static && s.getTest.call(u2, e5 + 1).match.nativeDef === "'" + t5.charAt(0)));
                  if (!a2 && i5 > 0 && !o.isMask.call(u2, e5, false, true)) {
                    var r4 = o.seekNext.call(u2, e5);
                    u2.caretPos.begin < r4 && (u2.caretPos = { begin: r4 });
                  }
                  return a2;
                })(g, m) ? (c2 = a.EventHandlers.keypressEvent.call(u2, i4, true, false, n3, u2.caretPos.begin)) && (g = u2.caretPos.begin + 1, m = "") : c2 = a.EventHandlers.keypressEvent.call(u2, i4, true, false, n3, r3 + 1), c2 ? (void 0 !== c2.pos && f2.validPositions[c2.pos] && true === f2.validPositions[c2.pos].match.static && void 0 === f2.validPositions[c2.pos].alternation && (k.push(c2.pos), u2.isRTL || (c2.forwardPosition = c2.pos + 1)), p.call(u2, void 0, o.getBuffer.call(u2), c2.forwardPosition, i4, false), u2.caretPos = { begin: c2.forwardPosition, end: c2.forwardPosition }, b = u2.caretPos) : void 0 === f2.validPositions[t4] && v[t4] === s.getPlaceholder.call(u2, t4) && o.isMask.call(u2, t4, true) ? u2.caretPos.begin++ : u2.caretPos = b;
              }
            })), k.length > 0) {
              var x, w, P = o.seekNext.call(u2, -1, void 0, false);
              if (!l.isComplete.call(u2, o.getBuffer.call(u2)) && k.length <= P || l.isComplete.call(u2, o.getBuffer.call(u2)) && k.length > 0 && k.length !== P && 0 === k[0]) {
                for (var S = P; void 0 !== (x = k.shift()); ) if (x < S) {
                  var O = new h.Event("_checkval");
                  if ((w = f2.validPositions[x]).generatedInput = true, O.key = w.input, (c2 = a.EventHandlers.keypressEvent.call(u2, O, true, false, n3, S)) && void 0 !== c2.pos && c2.pos !== x && f2.validPositions[c2.pos] && true === f2.validPositions[c2.pos].match.static) k.push(c2.pos);
                  else if (!c2) break;
                  S++;
                }
              }
            }
            t3 && p.call(u2, e3, o.getBuffer.call(u2), c2 ? c2.forwardPosition : u2.caretPos.begin, r2 || new h.Event("checkval"), r2 && ("input" === r2.type && u2.undoValue !== o.getBuffer.call(u2).join("") || "paste" === r2.type)), d.skipOptionalPartCharacter = y;
          }
          function p(e3, t3, n3, i3, a2) {
            var s2 = e3 ? e3.inputmask : this, c2 = s2.opts, u2 = s2.dependencyLib;
            if (i3 && "function" == typeof c2.onBeforeWrite) {
              var f2 = c2.onBeforeWrite.call(s2, i3, t3, n3, c2);
              if (f2) {
                if (f2.refreshFromBuffer) {
                  var p2 = f2.refreshFromBuffer;
                  l.refreshFromBuffer.call(s2, true === p2 ? p2 : p2.start, p2.end, f2.buffer || t3), t3 = o.getBuffer.call(s2, true);
                }
                void 0 !== n3 && (n3 = void 0 !== f2.caret ? f2.caret : n3);
              }
            }
            if (void 0 !== e3 && (e3.inputmask._valueSet(t3.join("")), void 0 === n3 || void 0 !== i3 && "blur" === i3.type || o.caret.call(s2, e3, n3, void 0, void 0, void 0 !== i3 && "keydown" === i3.type && (i3.key === r.keys.Delete || i3.key === r.keys.Backspace)), void 0 === e3.inputmask.writeBufferHook || e3.inputmask.writeBufferHook(n3), true === a2)) {
              var d = u2(e3), h = e3.inputmask._valueGet();
              e3.inputmask.skipInputEvent = true, d.trigger("input"), setTimeout((function() {
                h === o.getBufferTemplate.call(s2).join("") ? d.trigger("cleared") : true === l.isComplete.call(s2, t3) && d.trigger("complete");
              }), 0);
            }
          }
        }, 2394: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = void 0;
          var i2 = v(n2(3976)), a = v(n2(7392)), r = v(n2(4963)), o = n2(9716), l = v(n2(9380)), s = n2(7760), c = n2(157), u = n2(2391), f = n2(8711), p = n2(7215), d = n2(4713);
          function h(e3) {
            return h = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, h(e3);
          }
          function v(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var m = l.default.document, g = "_inputmask_opts";
          function y(e3, t3, n3) {
            if (!(this instanceof y)) return new y(e3, t3, n3);
            this.dependencyLib = r.default, this.el = void 0, this.events = {}, this.maskset = void 0, true !== n3 && ("[object Object]" === Object.prototype.toString.call(e3) ? t3 = e3 : (t3 = t3 || {}, e3 && (t3.alias = e3)), this.opts = r.default.extend(true, {}, this.defaults, t3), this.noMasksCache = t3 && void 0 !== t3.definitions, this.userOptions = t3 || {}, k(this.opts.alias, t3, this.opts)), this.refreshValue = false, this.undoValue = void 0, this.$el = void 0, this.skipInputEvent = false, this.validationEvent = false, this.ignorable = false, this.maxLength, this.mouseEnter = false, this.clicked = 0, this.originalPlaceholder = void 0, this.isComposing = false, this.hasAlternator = false;
          }
          function k(e3, t3, n3) {
            var i3 = y.prototype.aliases[e3];
            return i3 ? (i3.alias && k(i3.alias, void 0, n3), r.default.extend(true, n3, i3), r.default.extend(true, n3, t3), true) : (null === n3.mask && (n3.mask = e3), false);
          }
          y.prototype = { dataAttribute: "data-inputmask", defaults: i2.default, definitions: a.default, aliases: {}, masksCache: {}, i18n: {}, get isRTL() {
            return this.opts.isRTL || this.opts.numericInput;
          }, mask: function(e3) {
            var t3 = this;
            return "string" == typeof e3 && (e3 = m.getElementById(e3) || m.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : Array.isArray(e3) ? e3 : [].slice.call(e3)).forEach((function(e4, n3) {
              var i3 = r.default.extend(true, {}, t3.opts);
              if ((function(e5, t4, n4, i4) {
                function a3(t5, a4) {
                  var r2 = "" === i4 ? t5 : i4 + "-" + t5;
                  null !== (a4 = void 0 !== a4 ? a4 : e5.getAttribute(r2)) && ("string" == typeof a4 && (0 === t5.indexOf("on") ? a4 = l.default[a4] : "false" === a4 ? a4 = false : "true" === a4 && (a4 = true)), n4[t5] = a4);
                }
                if (true === t4.importDataAttributes) {
                  var o2, s2, c2, u2, f2 = e5.getAttribute(i4);
                  if (f2 && "" !== f2 && (f2 = f2.replace(/'/g, '"'), s2 = JSON.parse("{" + f2 + "}")), s2) {
                    for (u2 in c2 = void 0, s2) if ("alias" === u2.toLowerCase()) {
                      c2 = s2[u2];
                      break;
                    }
                  }
                  for (o2 in a3("alias", c2), n4.alias && k(n4.alias, n4, t4), t4) {
                    if (s2) {
                      for (u2 in c2 = void 0, s2) if (u2.toLowerCase() === o2.toLowerCase()) {
                        c2 = s2[u2];
                        break;
                      }
                    }
                    a3(o2, c2);
                  }
                }
                r.default.extend(true, t4, n4), ("rtl" === e5.dir || t4.rightAlign) && (e5.style.textAlign = "right");
                ("rtl" === e5.dir || t4.numericInput) && (e5.dir = "ltr", e5.removeAttribute("dir"), t4.isRTL = true);
                return Object.keys(n4).length;
              })(e4, i3, r.default.extend(true, {}, t3.userOptions), t3.dataAttribute)) {
                var a2 = (0, u.generateMaskSet)(i3, t3.noMasksCache);
                void 0 !== a2 && (void 0 !== e4.inputmask && (e4.inputmask.opts.autoUnmask = true, e4.inputmask.remove()), e4.inputmask = new y(void 0, void 0, true), e4.inputmask.opts = i3, e4.inputmask.noMasksCache = t3.noMasksCache, e4.inputmask.userOptions = r.default.extend(true, {}, t3.userOptions), e4.inputmask.el = e4, e4.inputmask.$el = (0, r.default)(e4), e4.inputmask.maskset = a2, r.default.data(e4, g, t3.userOptions), c.mask.call(e4.inputmask));
              }
            })), e3 && e3[0] && e3[0].inputmask || this;
          }, option: function(e3, t3) {
            return "string" == typeof e3 ? this.opts[e3] : "object" === h(e3) ? (r.default.extend(this.userOptions, e3), this.el && true !== t3 && this.mask(this.el), this) : void 0;
          }, unmaskedvalue: function(e3) {
            if (this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), void 0 === this.el || void 0 !== e3) {
              var t3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
              s.checkVal.call(this, void 0, false, false, t3), "function" == typeof this.opts.onBeforeWrite && this.opts.onBeforeWrite.call(this, void 0, f.getBuffer.call(this), 0, this.opts);
            }
            return s.unmaskedvalue.call(this, this.el);
          }, remove: function() {
            if (this.el) {
              r.default.data(this.el, g, null);
              var e3 = this.opts.autoUnmask ? (0, s.unmaskedvalue)(this.el) : this._valueGet(this.opts.autoUnmask);
              e3 !== f.getBufferTemplate.call(this).join("") ? this._valueSet(e3, this.opts.autoUnmask) : this._valueSet(""), o.EventRuler.off(this.el), Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.el), "value") && this.__valueGet && Object.defineProperty(this.el, "value", { get: this.__valueGet, set: this.__valueSet, configurable: true }) : m.__lookupGetter__ && this.el.__lookupGetter__("value") && this.__valueGet && (this.el.__defineGetter__("value", this.__valueGet), this.el.__defineSetter__("value", this.__valueSet)), this.el.inputmask = void 0;
            }
            return this.el;
          }, getemptymask: function() {
            return this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), (this.isRTL ? f.getBufferTemplate.call(this).reverse() : f.getBufferTemplate.call(this)).join("");
          }, hasMaskedValue: function() {
            return !this.opts.autoUnmask;
          }, isComplete: function() {
            return this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), p.isComplete.call(this, f.getBuffer.call(this));
          }, getmetadata: function() {
            if (this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), Array.isArray(this.maskset.metadata)) {
              var e3 = d.getMaskTemplate.call(this, true, 0, false).join("");
              return this.maskset.metadata.forEach((function(t3) {
                return t3.mask !== e3 || (e3 = t3, false);
              })), e3;
            }
            return this.maskset.metadata;
          }, isValid: function(e3) {
            if (this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache), e3) {
              var t3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
              s.checkVal.call(this, void 0, true, false, t3);
            } else e3 = this.isRTL ? f.getBuffer.call(this).slice().reverse().join("") : f.getBuffer.call(this).join("");
            for (var n3 = f.getBuffer.call(this), i3 = f.determineLastRequiredPosition.call(this), a2 = n3.length - 1; a2 > i3 && !f.isMask.call(this, a2); a2--) ;
            return n3.splice(i3, a2 + 1 - i3), p.isComplete.call(this, n3) && e3 === (this.isRTL ? f.getBuffer.call(this).slice().reverse().join("") : f.getBuffer.call(this).join(""));
          }, format: function(e3, t3) {
            this.maskset = this.maskset || (0, u.generateMaskSet)(this.opts, this.noMasksCache);
            var n3 = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e3, this.opts) || e3).split("");
            s.checkVal.call(this, void 0, true, false, n3);
            var i3 = this.isRTL ? f.getBuffer.call(this).slice().reverse().join("") : f.getBuffer.call(this).join("");
            return t3 ? { value: i3, metadata: this.getmetadata() } : i3;
          }, setValue: function(e3) {
            this.el && (0, r.default)(this.el).trigger("setvalue", [e3]);
          }, analyseMask: u.analyseMask }, y.extendDefaults = function(e3) {
            r.default.extend(true, y.prototype.defaults, e3);
          }, y.extendDefinitions = function(e3) {
            r.default.extend(true, y.prototype.definitions, e3);
          }, y.extendAliases = function(e3) {
            r.default.extend(true, y.prototype.aliases, e3);
          }, y.format = function(e3, t3, n3) {
            return y(t3).format(e3, n3);
          }, y.unmask = function(e3, t3) {
            return y(t3).unmaskedvalue(e3);
          }, y.isValid = function(e3, t3) {
            return y(t3).isValid(e3);
          }, y.remove = function(e3) {
            "string" == typeof e3 && (e3 = m.getElementById(e3) || m.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : e3).forEach((function(e4) {
              e4.inputmask && e4.inputmask.remove();
            }));
          }, y.setValue = function(e3, t3) {
            "string" == typeof e3 && (e3 = m.getElementById(e3) || m.querySelectorAll(e3)), (e3 = e3.nodeName ? [e3] : e3).forEach((function(e4) {
              e4.inputmask ? e4.inputmask.setValue(t3) : (0, r.default)(e4).trigger("setvalue", [t3]);
            }));
          }, y.dependencyLib = r.default, l.default.Inputmask = y;
          t2.default = y;
        }, 5296: function(e2, t2, n2) {
          function i2(e3) {
            return i2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, i2(e3);
          }
          var a = d(n2(9380)), r = d(n2(2394));
          function o(e3, t3) {
            for (var n3 = 0; n3 < t3.length; n3++) {
              var a2 = t3[n3];
              a2.enumerable = a2.enumerable || false, a2.configurable = true, "value" in a2 && (a2.writable = true), Object.defineProperty(e3, (r2 = a2.key, o2 = void 0, o2 = (function(e4, t4) {
                if ("object" !== i2(e4) || null === e4) return e4;
                var n4 = e4[Symbol.toPrimitive];
                if (void 0 !== n4) {
                  var a3 = n4.call(e4, t4);
                  if ("object" !== i2(a3)) return a3;
                  throw new TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t4 ? String : Number)(e4);
              })(r2, "string"), "symbol" === i2(o2) ? o2 : String(o2)), a2);
            }
            var r2, o2;
          }
          function l(e3) {
            var t3 = u();
            return function() {
              var n3, a2 = p(e3);
              if (t3) {
                var r2 = p(this).constructor;
                n3 = Reflect.construct(a2, arguments, r2);
              } else n3 = a2.apply(this, arguments);
              return (function(e4, t4) {
                if (t4 && ("object" === i2(t4) || "function" == typeof t4)) return t4;
                if (void 0 !== t4) throw new TypeError("Derived constructors may only return object or undefined");
                return (function(e5) {
                  if (void 0 === e5) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  return e5;
                })(e4);
              })(this, n3);
            };
          }
          function s(e3) {
            var t3 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
            return s = function(e4) {
              if (null === e4 || !(function(e5) {
                try {
                  return -1 !== Function.toString.call(e5).indexOf("[native code]");
                } catch (t4) {
                  return "function" == typeof e5;
                }
              })(e4)) return e4;
              if ("function" != typeof e4) throw new TypeError("Super expression must either be null or a function");
              if (void 0 !== t3) {
                if (t3.has(e4)) return t3.get(e4);
                t3.set(e4, n3);
              }
              function n3() {
                return c(e4, arguments, p(this).constructor);
              }
              return n3.prototype = Object.create(e4.prototype, { constructor: { value: n3, enumerable: false, writable: true, configurable: true } }), f(n3, e4);
            }, s(e3);
          }
          function c(e3, t3, n3) {
            return c = u() ? Reflect.construct.bind() : function(e4, t4, n4) {
              var i3 = [null];
              i3.push.apply(i3, t4);
              var a2 = new (Function.bind.apply(e4, i3))();
              return n4 && f(a2, n4.prototype), a2;
            }, c.apply(null, arguments);
          }
          function u() {
            if ("undefined" == typeof Reflect || !Reflect.construct) return false;
            if (Reflect.construct.sham) return false;
            if ("function" == typeof Proxy) return true;
            try {
              return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {
              }))), true;
            } catch (e3) {
              return false;
            }
          }
          function f(e3, t3) {
            return f = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e4, t4) {
              return e4.__proto__ = t4, e4;
            }, f(e3, t3);
          }
          function p(e3) {
            return p = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(e4) {
              return e4.__proto__ || Object.getPrototypeOf(e4);
            }, p(e3);
          }
          function d(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var h = a.default.document;
          if (h && h.head && h.head.attachShadow && a.default.customElements && void 0 === a.default.customElements.get("input-mask")) {
            var v = (function(e3) {
              !(function(e4, t4) {
                if ("function" != typeof t4 && null !== t4) throw new TypeError("Super expression must either be null or a function");
                e4.prototype = Object.create(t4 && t4.prototype, { constructor: { value: e4, writable: true, configurable: true } }), Object.defineProperty(e4, "prototype", { writable: false }), t4 && f(e4, t4);
              })(s2, e3);
              var t3, n3, a2 = l(s2);
              function s2() {
                var e4;
                !(function(e5, t5) {
                  if (!(e5 instanceof t5)) throw new TypeError("Cannot call a class as a function");
                })(this, s2);
                var t4 = (e4 = a2.call(this)).getAttributeNames(), n4 = e4.attachShadow({ mode: "closed" });
                for (var i4 in e4.input = h.createElement("input"), e4.input.type = "text", n4.appendChild(e4.input), t4) Object.prototype.hasOwnProperty.call(t4, i4) && e4.input.setAttribute(t4[i4], e4.getAttribute(t4[i4]));
                var o2 = new r.default();
                return o2.dataAttribute = "", o2.mask(e4.input), e4.input.inputmask.shadowRoot = n4, e4;
              }
              return t3 = s2, (n3 = [{ key: "attributeChangedCallback", value: function(e4, t4, n4) {
                this.input.setAttribute(e4, n4);
              } }, { key: "value", get: function() {
                return this.input.value;
              }, set: function(e4) {
                this.input.value = e4;
              } }]) && o(t3.prototype, n3), Object.defineProperty(t3, "prototype", { writable: false }), s2;
            })(s(HTMLElement));
            a.default.customElements.define("input-mask", v);
          }
        }, 2839: function(e2, t2) {
          function n2(e3) {
            return n2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, n2(e3);
          }
          function i2(e3, t3) {
            return (function(e4) {
              if (Array.isArray(e4)) return e4;
            })(e3) || (function(e4, t4) {
              var n3 = null == e4 ? null : "undefined" != typeof Symbol && e4[Symbol.iterator] || e4["@@iterator"];
              if (null != n3) {
                var i3, a2, r2, o2, l2 = [], s2 = true, c = false;
                try {
                  if (r2 = (n3 = n3.call(e4)).next, 0 === t4) ;
                  else for (; !(s2 = (i3 = r2.call(n3)).done) && (l2.push(i3.value), l2.length !== t4); s2 = true) ;
                } catch (e5) {
                  c = true, a2 = e5;
                } finally {
                  try {
                    if (!s2 && null != n3.return && (o2 = n3.return(), Object(o2) !== o2)) return;
                  } finally {
                    if (c) throw a2;
                  }
                }
                return l2;
              }
            })(e3, t3) || (function(e4, t4) {
              if (!e4) return;
              if ("string" == typeof e4) return a(e4, t4);
              var n3 = Object.prototype.toString.call(e4).slice(8, -1);
              "Object" === n3 && e4.constructor && (n3 = e4.constructor.name);
              if ("Map" === n3 || "Set" === n3) return Array.from(e4);
              if ("Arguments" === n3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return a(e4, t4);
            })(e3, t3) || (function() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            })();
          }
          function a(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function r(e3, t3) {
            var n3 = Object.keys(e3);
            if (Object.getOwnPropertySymbols) {
              var i3 = Object.getOwnPropertySymbols(e3);
              t3 && (i3 = i3.filter((function(t4) {
                return Object.getOwnPropertyDescriptor(e3, t4).enumerable;
              }))), n3.push.apply(n3, i3);
            }
            return n3;
          }
          function o(e3, t3, i3) {
            return (t3 = (function(e4) {
              var t4 = (function(e5, t5) {
                if ("object" !== n2(e5) || null === e5) return e5;
                var i4 = e5[Symbol.toPrimitive];
                if (void 0 !== i4) {
                  var a2 = i4.call(e5, t5);
                  if ("object" !== n2(a2)) return a2;
                  throw new TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t5 ? String : Number)(e5);
              })(e4, "string");
              return "symbol" === n2(t4) ? t4 : String(t4);
            })(t3)) in e3 ? Object.defineProperty(e3, t3, { value: i3, enumerable: true, configurable: true, writable: true }) : e3[t3] = i3, e3;
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.keys = t2.keyCode = void 0, t2.toKey = function(e3, t3) {
            return s[e3] || (t3 ? String.fromCharCode(e3) : String.fromCharCode(e3).toLowerCase());
          }, t2.toKeyCode = function(e3) {
            return l[e3];
          };
          var l = t2.keyCode = (function(e3) {
            for (var t3 = 1; t3 < arguments.length; t3++) {
              var n3 = null != arguments[t3] ? arguments[t3] : {};
              t3 % 2 ? r(Object(n3), true).forEach((function(t4) {
                o(e3, t4, n3[t4]);
              })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e3, Object.getOwnPropertyDescriptors(n3)) : r(Object(n3)).forEach((function(t4) {
                Object.defineProperty(e3, t4, Object.getOwnPropertyDescriptor(n3, t4));
              }));
            }
            return e3;
          })({ c: 67, x: 88, z: 90, BACKSPACE_SAFARI: 127, Enter: 13, Meta_LEFT: 91, Meta_RIGHT: 92, Space: 32 }, { Alt: 18, AltGraph: 18, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, ArrowUp: 38, Backspace: 8, CapsLock: 20, Control: 17, ContextMenu: 93, Dead: 221, Delete: 46, End: 35, Escape: 27, F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, Home: 36, Insert: 45, NumLock: 144, PageDown: 34, PageUp: 33, Pause: 19, PrintScreen: 44, Process: 229, Shift: 16, ScrollLock: 145, Tab: 9, Unidentified: 229 }), s = Object.entries(l).reduce((function(e3, t3) {
            var n3 = i2(t3, 2), a2 = n3[0], r2 = n3[1];
            return e3[r2] = void 0 === e3[r2] ? a2 : e3[r2], e3;
          }), {});
          t2.keys = Object.entries(l).reduce((function(e3, t3) {
            var n3 = i2(t3, 2), a2 = n3[0];
            n3[1];
            return e3[a2] = "Space" === a2 ? " " : a2, e3;
          }), {});
        }, 2391: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.analyseMask = function(e3, t3, n3) {
            var i3, a2, s2, c2, u, f, p = /(?:[?*+]|\{[0-9+*]+(?:,[0-9+*]*)?(?:\|[0-9+*]*)?\})|[^.?*+^${[]()|\\]+|./g, d = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g, h = false, v = new o.default(), m = [], g = [], y = false;
            function k(e4, i4, a3) {
              a3 = void 0 !== a3 ? a3 : e4.matches.length;
              var o2 = e4.matches[a3 - 1];
              if (t3) {
                if (0 === i4.indexOf("[") || h && /\\d|\\s|\\w|\\p/i.test(i4) || "." === i4) {
                  var s3 = n3.casing ? "i" : "";
                  /\\p\{.*}/i.test(i4) && (s3 += "u"), e4.matches.splice(a3++, 0, { fn: new RegExp(i4, s3), static: false, optionality: false, newBlockMarker: void 0 === o2 ? "master" : o2.def !== i4, casing: null, def: i4, placeholder: "object" === l(n3.placeholder) ? n3.placeholder[v.matches.length] : void 0, nativeDef: i4 });
                } else h && (i4 = i4[i4.length - 1]), i4.split("").forEach((function(t4, i5) {
                  o2 = e4.matches[a3 - 1], e4.matches.splice(a3++, 0, { fn: /[a-z]/i.test(n3.staticDefinitionSymbol || t4) ? new RegExp("[" + (n3.staticDefinitionSymbol || t4) + "]", n3.casing ? "i" : "") : null, static: true, optionality: false, newBlockMarker: void 0 === o2 ? "master" : o2.def !== t4 && true !== o2.static, casing: null, def: n3.staticDefinitionSymbol || t4, placeholder: void 0 !== n3.staticDefinitionSymbol ? t4 : "object" === l(n3.placeholder) ? n3.placeholder[v.matches.length] : void 0, nativeDef: (h ? "'" : "") + t4 });
                }));
                h = false;
              } else {
                var c3 = n3.definitions && n3.definitions[i4] || n3.usePrototypeDefinitions && r.default.prototype.definitions[i4];
                c3 && !h ? e4.matches.splice(a3++, 0, { fn: c3.validator ? "string" == typeof c3.validator ? new RegExp(c3.validator, n3.casing ? "i" : "") : new function() {
                  this.test = c3.validator;
                }() : /./, static: c3.static || false, optionality: c3.optional || false, defOptionality: c3.optional || false, newBlockMarker: void 0 === o2 || c3.optional ? "master" : o2.def !== (c3.definitionSymbol || i4), casing: c3.casing, def: c3.definitionSymbol || i4, placeholder: c3.placeholder, nativeDef: i4, generated: c3.generated }) : (e4.matches.splice(a3++, 0, { fn: /[a-z]/i.test(n3.staticDefinitionSymbol || i4) ? new RegExp("[" + (n3.staticDefinitionSymbol || i4) + "]", n3.casing ? "i" : "") : null, static: true, optionality: false, newBlockMarker: void 0 === o2 ? "master" : o2.def !== i4 && true !== o2.static, casing: null, def: n3.staticDefinitionSymbol || i4, placeholder: void 0 !== n3.staticDefinitionSymbol ? i4 : void 0, nativeDef: (h ? "'" : "") + i4 }), h = false);
              }
            }
            function b() {
              if (m.length > 0) {
                if (k(c2 = m[m.length - 1], a2), c2.isAlternator) {
                  u = m.pop();
                  for (var e4 = 0; e4 < u.matches.length; e4++) u.matches[e4].isGroup && (u.matches[e4].isGroup = false);
                  m.length > 0 ? (c2 = m[m.length - 1]).matches.push(u) : v.matches.push(u);
                }
              } else k(v, a2);
            }
            function x(e4) {
              var t4 = new o.default(true);
              return t4.openGroup = false, t4.matches = e4, t4;
            }
            function w() {
              if ((s2 = m.pop()).openGroup = false, void 0 !== s2) if (m.length > 0) {
                if ((c2 = m[m.length - 1]).matches.push(s2), c2.isAlternator) {
                  u = m.pop();
                  for (var e4 = 0; e4 < u.matches.length; e4++) u.matches[e4].isGroup = false, u.matches[e4].alternatorGroup = false;
                  m.length > 0 ? (c2 = m[m.length - 1]).matches.push(u) : v.matches.push(u);
                }
              } else v.matches.push(s2);
              else b();
            }
            function P(e4) {
              var t4 = e4.pop();
              return t4.isQuantifier && (t4 = x([e4.pop(), t4])), t4;
            }
            t3 && (n3.optionalmarker[0] = void 0, n3.optionalmarker[1] = void 0);
            for (; i3 = t3 ? d.exec(e3) : p.exec(e3); ) {
              if (a2 = i3[0], t3) {
                switch (a2.charAt(0)) {
                  case "?":
                    a2 = "{0,1}";
                    break;
                  case "+":
                  case "*":
                    a2 = "{" + a2 + "}";
                    break;
                  case "|":
                    if (0 === m.length) {
                      var S = x(v.matches);
                      S.openGroup = true, m.push(S), v.matches = [], y = true;
                    }
                }
                switch (a2) {
                  case "\\d":
                    a2 = "[0-9]";
                    break;
                  case "\\p":
                    a2 += d.exec(e3)[0], a2 += d.exec(e3)[0];
                }
              }
              if (h) b();
              else switch (a2.charAt(0)) {
                case "$":
                case "^":
                  t3 || b();
                  break;
                case n3.escapeChar:
                  h = true, t3 && b();
                  break;
                case n3.optionalmarker[1]:
                case n3.groupmarker[1]:
                  w();
                  break;
                case n3.optionalmarker[0]:
                  m.push(new o.default(false, true));
                  break;
                case n3.groupmarker[0]:
                  m.push(new o.default(true));
                  break;
                case n3.quantifiermarker[0]:
                  var O = new o.default(false, false, true), _ = (a2 = a2.replace(/[{}?]/g, "")).split("|"), M = _[0].split(","), E = isNaN(M[0]) ? M[0] : parseInt(M[0]), j = 1 === M.length ? E : isNaN(M[1]) ? M[1] : parseInt(M[1]), T = isNaN(_[1]) ? _[1] : parseInt(_[1]);
                  "*" !== E && "+" !== E || (E = "*" === j ? 0 : 1), O.quantifier = { min: E, max: j, jit: T };
                  var A = m.length > 0 ? m[m.length - 1].matches : v.matches;
                  (i3 = A.pop()).isGroup || (i3 = x([i3])), A.push(i3), A.push(O);
                  break;
                case n3.alternatormarker:
                  if (m.length > 0) {
                    var D = (c2 = m[m.length - 1]).matches[c2.matches.length - 1];
                    f = c2.openGroup && (void 0 === D.matches || false === D.isGroup && false === D.isAlternator) ? m.pop() : P(c2.matches);
                  } else f = P(v.matches);
                  if (f.isAlternator) m.push(f);
                  else if (f.alternatorGroup ? (u = m.pop(), f.alternatorGroup = false) : u = new o.default(false, false, false, true), u.matches.push(f), m.push(u), f.openGroup) {
                    f.openGroup = false;
                    var L = new o.default(true);
                    L.alternatorGroup = true, m.push(L);
                  }
                  break;
                default:
                  b();
              }
            }
            y && w();
            for (; m.length > 0; ) s2 = m.pop(), v.matches.push(s2);
            v.matches.length > 0 && (!(function e4(i4) {
              i4 && i4.matches && i4.matches.forEach((function(a3, r2) {
                var o2 = i4.matches[r2 + 1];
                (void 0 === o2 || void 0 === o2.matches || false === o2.isQuantifier) && a3 && a3.isGroup && (a3.isGroup = false, t3 || (k(a3, n3.groupmarker[0], 0), true !== a3.openGroup && k(a3, n3.groupmarker[1]))), e4(a3);
              }));
            })(v), g.push(v));
            (n3.numericInput || n3.isRTL) && (function e4(t4) {
              for (var i4 in t4.matches = t4.matches.reverse(), t4.matches) if (Object.prototype.hasOwnProperty.call(t4.matches, i4)) {
                var a3 = parseInt(i4);
                if (t4.matches[i4].isQuantifier && t4.matches[a3 + 1] && t4.matches[a3 + 1].isGroup) {
                  var r2 = t4.matches[i4];
                  t4.matches.splice(i4, 1), t4.matches.splice(a3 + 1, 0, r2);
                }
                void 0 !== t4.matches[i4].matches ? t4.matches[i4] = e4(t4.matches[i4]) : t4.matches[i4] = ((o2 = t4.matches[i4]) === n3.optionalmarker[0] ? o2 = n3.optionalmarker[1] : o2 === n3.optionalmarker[1] ? o2 = n3.optionalmarker[0] : o2 === n3.groupmarker[0] ? o2 = n3.groupmarker[1] : o2 === n3.groupmarker[1] && (o2 = n3.groupmarker[0]), o2);
              }
              var o2;
              return t4;
            })(g[0]);
            return g;
          }, t2.generateMaskSet = function(e3, t3) {
            var n3;
            function o2(e4, t4) {
              var n4 = t4.repeat, i3 = t4.groupmarker, r2 = t4.quantifiermarker, o3 = t4.keepStatic;
              if (n4 > 0 || "*" === n4 || "+" === n4) {
                var l2 = "*" === n4 ? 0 : "+" === n4 ? 1 : n4;
                if (l2 != n4) e4 = i3[0] + e4 + i3[1] + r2[0] + l2 + "," + n4 + r2[1];
                else for (var c3 = e4, u2 = 1; u2 < l2; u2++) e4 += c3;
              }
              if (true === o3) {
                var f = e4.match(new RegExp("(.)\\[([^\\]]*)\\]", "g"));
                f && f.forEach((function(t5, n5) {
                  var i4 = (function(e5, t6) {
                    return (function(e6) {
                      if (Array.isArray(e6)) return e6;
                    })(e5) || (function(e6, t7) {
                      var n6 = null == e6 ? null : "undefined" != typeof Symbol && e6[Symbol.iterator] || e6["@@iterator"];
                      if (null != n6) {
                        var i5, a2, r4, o5, l3 = [], s2 = true, c4 = false;
                        try {
                          if (r4 = (n6 = n6.call(e6)).next, 0 === t7) ;
                          else for (; !(s2 = (i5 = r4.call(n6)).done) && (l3.push(i5.value), l3.length !== t7); s2 = true) ;
                        } catch (e7) {
                          c4 = true, a2 = e7;
                        } finally {
                          try {
                            if (!s2 && null != n6.return && (o5 = n6.return(), Object(o5) !== o5)) return;
                          } finally {
                            if (c4) throw a2;
                          }
                        }
                        return l3;
                      }
                    })(e5, t6) || (function(e6, t7) {
                      if (!e6) return;
                      if ("string" == typeof e6) return s(e6, t7);
                      var n6 = Object.prototype.toString.call(e6).slice(8, -1);
                      "Object" === n6 && e6.constructor && (n6 = e6.constructor.name);
                      if ("Map" === n6 || "Set" === n6) return Array.from(e6);
                      if ("Arguments" === n6 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n6)) return s(e6, t7);
                    })(e5, t6) || (function() {
                      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                    })();
                  })(t5.split("["), 2), r3 = i4[0], o4 = i4[1];
                  o4 = o4.replace("]", ""), e4 = e4.replace(new RegExp("".concat((0, a.default)(r3), "\\[").concat((0, a.default)(o4), "\\]")), r3.charAt(0) === o4.charAt(0) ? "(".concat(r3, "|").concat(r3).concat(o4, ")") : "".concat(r3, "[").concat(o4, "]"));
                }));
              }
              return e4;
            }
            function c2(e4, n4, a2) {
              var s2, c3, u2 = false;
              return null !== e4 && "" !== e4 || ((u2 = null !== a2.regex) ? e4 = (e4 = a2.regex).replace(/^(\^)(.*)(\$)$/, "$2") : (u2 = true, e4 = ".*")), 1 === e4.length && false === a2.greedy && 0 !== a2.repeat && (a2.placeholder = ""), e4 = o2(e4, a2), c3 = u2 ? "regex_" + a2.regex : a2.numericInput ? e4.split("").reverse().join("") : e4, null !== a2.keepStatic && (c3 = "ks_" + a2.keepStatic + c3), "object" === l(a2.placeholder) && (c3 = "ph_" + JSON.stringify(a2.placeholder) + c3), void 0 === r.default.prototype.masksCache[c3] || true === t3 ? (s2 = { mask: e4, maskToken: r.default.prototype.analyseMask(e4, u2, a2), validPositions: [], _buffer: void 0, buffer: void 0, tests: {}, excludes: {}, metadata: n4, maskLength: void 0, jitOffset: {} }, true !== t3 && (r.default.prototype.masksCache[c3] = s2, s2 = i2.default.extend(true, {}, r.default.prototype.masksCache[c3]))) : s2 = i2.default.extend(true, {}, r.default.prototype.masksCache[c3]), s2;
            }
            "function" == typeof e3.mask && (e3.mask = e3.mask(e3));
            if (Array.isArray(e3.mask)) {
              if (e3.mask.length > 1) {
                null === e3.keepStatic && (e3.keepStatic = true);
                var u = e3.groupmarker[0];
                return (e3.isRTL ? e3.mask.reverse() : e3.mask).forEach((function(t4) {
                  u.length > 1 && (u += e3.alternatormarker), void 0 !== t4.mask && "function" != typeof t4.mask ? u += t4.mask : u += t4;
                })), c2(u += e3.groupmarker[1], e3.mask, e3);
              }
              e3.mask = e3.mask.pop();
            }
            n3 = e3.mask && void 0 !== e3.mask.mask && "function" != typeof e3.mask.mask ? c2(e3.mask.mask, e3.mask, e3) : c2(e3.mask, e3.mask, e3);
            null === e3.keepStatic && (e3.keepStatic = false);
            return n3;
          };
          var i2 = c(n2(4963)), a = c(n2(7184)), r = c(n2(2394)), o = c(n2(9695));
          function l(e3) {
            return l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, l(e3);
          }
          function s(e3, t3) {
            (null == t3 || t3 > e3.length) && (t3 = e3.length);
            for (var n3 = 0, i3 = new Array(t3); n3 < t3; n3++) i3[n3] = e3[n3];
            return i3;
          }
          function c(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
        }, 157: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.mask = function() {
            var e3 = this, t3 = this.opts, n3 = this.el, c = this.dependencyLib;
            r.EventRuler.off(n3);
            var u = (function(t4, n4) {
              var i3 = t4.getAttribute("type"), a2 = "input" === t4.tagName.toLowerCase() && n4.supportsInputType.includes(i3) || t4.isContentEditable || "textarea" === t4.tagName.toLowerCase();
              if (!a2) if ("input" === t4.tagName.toLowerCase()) {
                var s2 = document.createElement("input");
                s2.setAttribute("type", i3), a2 = "text" === s2.type, s2 = null;
              } else a2 = "partial";
              return false !== a2 ? (function(t5) {
                var i4, a3;
                function s3() {
                  return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : -1 !== l.getLastValidPosition.call(e3) || true !== n4.nullable ? (this.inputmask.shadowRoot || this.ownerDocument).activeElement === this && n4.clearMaskOnLostFocus ? (e3.isRTL ? o.clearOptionalTail.call(e3, l.getBuffer.call(e3).slice()).reverse() : o.clearOptionalTail.call(e3, l.getBuffer.call(e3).slice())).join("") : i4.call(this) : "" : i4.call(this);
                }
                function u2(e4) {
                  a3.call(this, e4), this.inputmask && (0, o.applyInputValue)(this, e4);
                }
                if (!t5.inputmask.__valueGet) {
                  if (true !== n4.noValuePatching) {
                    if (Object.getOwnPropertyDescriptor) {
                      var f2 = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t5), "value") : void 0;
                      f2 && f2.get && f2.set ? (i4 = f2.get, a3 = f2.set, Object.defineProperty(t5, "value", { get: s3, set: u2, configurable: true })) : "input" !== t5.tagName.toLowerCase() && (i4 = function() {
                        return this.textContent;
                      }, a3 = function(e4) {
                        this.textContent = e4;
                      }, Object.defineProperty(t5, "value", { get: s3, set: u2, configurable: true }));
                    } else document.__lookupGetter__ && t5.__lookupGetter__("value") && (i4 = t5.__lookupGetter__("value"), a3 = t5.__lookupSetter__("value"), t5.__defineGetter__("value", s3), t5.__defineSetter__("value", u2));
                    t5.inputmask.__valueGet = i4, t5.inputmask.__valueSet = a3;
                  }
                  t5.inputmask._valueGet = function(t6) {
                    return e3.isRTL && true !== t6 ? i4.call(this.el).split("").reverse().join("") : i4.call(this.el);
                  }, t5.inputmask._valueSet = function(t6, n5) {
                    a3.call(this.el, null == t6 ? "" : true !== n5 && e3.isRTL ? t6.split("").reverse().join("") : t6);
                  }, void 0 === i4 && (i4 = function() {
                    return this.value;
                  }, a3 = function(e4) {
                    this.value = e4;
                  }, (function(t6) {
                    if (c.valHooks && (void 0 === c.valHooks[t6] || true !== c.valHooks[t6].inputmaskpatch)) {
                      var i5 = c.valHooks[t6] && c.valHooks[t6].get ? c.valHooks[t6].get : function(e4) {
                        return e4.value;
                      }, a4 = c.valHooks[t6] && c.valHooks[t6].set ? c.valHooks[t6].set : function(e4, t7) {
                        return e4.value = t7, e4;
                      };
                      c.valHooks[t6] = { get: function(t7) {
                        if (t7.inputmask) {
                          if (t7.inputmask.opts.autoUnmask) return t7.inputmask.unmaskedvalue();
                          var a5 = i5(t7);
                          return -1 !== l.getLastValidPosition.call(e3, void 0, void 0, t7.inputmask.maskset.validPositions) || true !== n4.nullable ? a5 : "";
                        }
                        return i5(t7);
                      }, set: function(e4, t7) {
                        var n5 = a4(e4, t7);
                        return e4.inputmask && (0, o.applyInputValue)(e4, t7), n5;
                      }, inputmaskpatch: true };
                    }
                  })(t5.type), (function(e4) {
                    r.EventRuler.on(e4, "mouseenter", (function() {
                      var e5 = this, t6 = e5.inputmask._valueGet(true);
                      t6 != (e5.inputmask.isRTL ? l.getBuffer.call(e5.inputmask).slice().reverse() : l.getBuffer.call(e5.inputmask)).join("") && (0, o.applyInputValue)(e5, t6);
                    }));
                  })(t5));
                }
              })(t4) : t4.inputmask = void 0, a2;
            })(n3, t3);
            if (false !== u) {
              e3.originalPlaceholder = n3.placeholder, e3.maxLength = void 0 !== n3 ? n3.maxLength : void 0, -1 === e3.maxLength && (e3.maxLength = void 0), "inputMode" in n3 && null === n3.getAttribute("inputmode") && (n3.inputMode = t3.inputmode, n3.setAttribute("inputmode", t3.inputmode)), true === u && (t3.showMaskOnFocus = t3.showMaskOnFocus && -1 === ["cc-number", "cc-exp"].indexOf(n3.autocomplete), i2.iphone && (t3.insertModeVisual = false, n3.setAttribute("autocorrect", "off")), r.EventRuler.on(n3, "submit", a.EventHandlers.submitEvent), r.EventRuler.on(n3, "reset", a.EventHandlers.resetEvent), r.EventRuler.on(n3, "blur", a.EventHandlers.blurEvent), r.EventRuler.on(n3, "focus", a.EventHandlers.focusEvent), r.EventRuler.on(n3, "invalid", a.EventHandlers.invalidEvent), r.EventRuler.on(n3, "click", a.EventHandlers.clickEvent), r.EventRuler.on(n3, "mouseleave", a.EventHandlers.mouseleaveEvent), r.EventRuler.on(n3, "mouseenter", a.EventHandlers.mouseenterEvent), r.EventRuler.on(n3, "paste", a.EventHandlers.pasteEvent), r.EventRuler.on(n3, "cut", a.EventHandlers.cutEvent), r.EventRuler.on(n3, "complete", t3.oncomplete), r.EventRuler.on(n3, "incomplete", t3.onincomplete), r.EventRuler.on(n3, "cleared", t3.oncleared), true !== t3.inputEventOnly && r.EventRuler.on(n3, "keydown", a.EventHandlers.keyEvent), (i2.mobile || t3.inputEventOnly) && n3.removeAttribute("maxLength"), r.EventRuler.on(n3, "input", a.EventHandlers.inputFallBackEvent)), r.EventRuler.on(n3, "setvalue", a.EventHandlers.setValueEvent), void 0 === e3.applyMaskHook || e3.applyMaskHook(), l.getBufferTemplate.call(e3).join(""), e3.undoValue = e3._valueGet(true);
              var f = (n3.inputmask.shadowRoot || n3.ownerDocument).activeElement;
              if ("" !== n3.inputmask._valueGet(true) || false === t3.clearMaskOnLostFocus || f === n3) {
                (0, o.applyInputValue)(n3, n3.inputmask._valueGet(true), t3);
                var p = l.getBuffer.call(e3).slice();
                false === s.isComplete.call(e3, p) && t3.clearIncomplete && l.resetMaskSet.call(e3, false), t3.clearMaskOnLostFocus && f !== n3 && (-1 === l.getLastValidPosition.call(e3) ? p = [] : o.clearOptionalTail.call(e3, p)), (false === t3.clearMaskOnLostFocus || t3.showMaskOnFocus && f === n3 || "" !== n3.inputmask._valueGet(true)) && (0, o.writeBuffer)(n3, p), f === n3 && l.caret.call(e3, n3, l.seekNext.call(e3, l.getLastValidPosition.call(e3)));
              }
            }
          };
          var i2 = n2(9845), a = n2(6030), r = n2(9716), o = n2(7760), l = n2(8711), s = n2(7215);
        }, 9695: function(e2, t2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e3, t3, n2, i2) {
            this.matches = [], this.openGroup = e3 || false, this.alternatorGroup = false, this.isGroup = e3 || false, this.isOptional = t3 || false, this.isQuantifier = n2 || false, this.isAlternator = i2 || false, this.quantifier = { min: 1, max: 1 };
          };
        }, 3194: function() {
          Array.prototype.includes || Object.defineProperty(Array.prototype, "includes", { value: function(e2, t2) {
            if (null == this) throw new TypeError('"this" is null or not defined');
            var n2 = Object(this), i2 = n2.length >>> 0;
            if (0 === i2) return false;
            for (var a = 0 | t2, r = Math.max(a >= 0 ? a : i2 - Math.abs(a), 0); r < i2; ) {
              if (n2[r] === e2) return true;
              r++;
            }
            return false;
          } });
        }, 9302: function() {
          var e2 = Function.bind.call(Function.call, Array.prototype.reduce), t2 = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable), n2 = Function.bind.call(Function.call, Array.prototype.concat), i2 = Object.keys;
          Object.entries || (Object.entries = function(a) {
            return e2(i2(a), (function(e3, i3) {
              return n2(e3, "string" == typeof i3 && t2(a, i3) ? [[i3, a[i3]]] : []);
            }), []);
          });
        }, 7149: function() {
          function e2(t2) {
            return e2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
              return typeof e3;
            } : function(e3) {
              return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
            }, e2(t2);
          }
          "function" != typeof Object.getPrototypeOf && (Object.getPrototypeOf = "object" === e2("test".__proto__) ? function(e3) {
            return e3.__proto__;
          } : function(e3) {
            return e3.constructor.prototype;
          });
        }, 4013: function() {
          String.prototype.includes || (String.prototype.includes = function(e2, t2) {
            return "number" != typeof t2 && (t2 = 0), !(t2 + e2.length > this.length) && -1 !== this.indexOf(e2, t2);
          });
        }, 8711: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.caret = function(e3, t3, n3, i3, r2) {
            var o2, l2 = this, s2 = this.opts;
            if (void 0 === t3) return "selectionStart" in e3 && "selectionEnd" in e3 ? (t3 = e3.selectionStart, n3 = e3.selectionEnd) : a.default.getSelection ? (o2 = a.default.getSelection().getRangeAt(0)).commonAncestorContainer.parentNode !== e3 && o2.commonAncestorContainer !== e3 || (t3 = o2.startOffset, n3 = o2.endOffset) : document.selection && document.selection.createRange && (n3 = (t3 = 0 - (o2 = document.selection.createRange()).duplicate().moveStart("character", -e3.inputmask._valueGet().length)) + o2.text.length), { begin: i3 ? t3 : f.call(l2, t3), end: i3 ? n3 : f.call(l2, n3) };
            if (Array.isArray(t3) && (n3 = l2.isRTL ? t3[0] : t3[1], t3 = l2.isRTL ? t3[1] : t3[0]), void 0 !== t3.begin && (n3 = l2.isRTL ? t3.begin : t3.end, t3 = l2.isRTL ? t3.end : t3.begin), "number" == typeof t3) {
              t3 = i3 ? t3 : f.call(l2, t3), n3 = "number" == typeof (n3 = i3 ? n3 : f.call(l2, n3)) ? n3 : t3;
              var c2 = parseInt(((e3.ownerDocument.defaultView || a.default).getComputedStyle ? (e3.ownerDocument.defaultView || a.default).getComputedStyle(e3, null) : e3.currentStyle).fontSize) * n3;
              if (e3.scrollLeft = c2 > e3.scrollWidth ? c2 : 0, e3.inputmask.caretPos = { begin: t3, end: n3 }, s2.insertModeVisual && false === s2.insertMode && t3 === n3 && (r2 || n3++), e3 === (e3.inputmask.shadowRoot || e3.ownerDocument).activeElement) {
                if ("setSelectionRange" in e3) e3.setSelectionRange(t3, n3);
                else if (a.default.getSelection) {
                  if (o2 = document.createRange(), void 0 === e3.firstChild || null === e3.firstChild) {
                    var u2 = document.createTextNode("");
                    e3.appendChild(u2);
                  }
                  o2.setStart(e3.firstChild, t3 < e3.inputmask._valueGet().length ? t3 : e3.inputmask._valueGet().length), o2.setEnd(e3.firstChild, n3 < e3.inputmask._valueGet().length ? n3 : e3.inputmask._valueGet().length), o2.collapse(true);
                  var p = a.default.getSelection();
                  p.removeAllRanges(), p.addRange(o2);
                } else e3.createTextRange && ((o2 = e3.createTextRange()).collapse(true), o2.moveEnd("character", n3), o2.moveStart("character", t3), o2.select());
                void 0 === e3.inputmask.caretHook || e3.inputmask.caretHook.call(l2, { begin: t3, end: n3 });
              }
            }
          }, t2.determineLastRequiredPosition = function(e3) {
            var t3, n3, i3 = this, a2 = i3.maskset, l2 = i3.dependencyLib, c2 = s.call(i3), u2 = {}, f2 = a2.validPositions[c2], p = o.getMaskTemplate.call(i3, true, s.call(i3), true, true), d = p.length, h = void 0 !== f2 ? f2.locator.slice() : void 0;
            for (t3 = c2 + 1; t3 < p.length; t3++) h = (n3 = o.getTestTemplate.call(i3, t3, h, t3 - 1)).locator.slice(), u2[t3] = l2.extend(true, {}, n3);
            var v = f2 && void 0 !== f2.alternation ? f2.locator[f2.alternation] : void 0;
            for (t3 = d - 1; t3 > c2 && (((n3 = u2[t3]).match.optionality || n3.match.optionalQuantifier && n3.match.newBlockMarker || v && (v !== u2[t3].locator[f2.alternation] && true !== n3.match.static || true === n3.match.static && n3.locator[f2.alternation] && r.checkAlternationMatch.call(i3, n3.locator[f2.alternation].toString().split(","), v.toString().split(",")) && "" !== o.getTests.call(i3, t3)[0].def)) && p[t3] === o.getPlaceholder.call(i3, t3, n3.match)); t3--) d--;
            return e3 ? { l: d, def: u2[d] ? u2[d].match : void 0 } : d;
          }, t2.determineNewCaretPosition = function(e3, t3, n3) {
            var i3, a2, r2, f2 = this, p = f2.maskset, d = f2.opts;
            t3 && (f2.isRTL ? e3.end = e3.begin : e3.begin = e3.end);
            if (e3.begin === e3.end) {
              switch (n3 = n3 || d.positionCaretOnClick) {
                case "none":
                  break;
                case "select":
                  e3 = { begin: 0, end: l.call(f2).length };
                  break;
                case "ignore":
                  e3.end = e3.begin = u.call(f2, s.call(f2));
                  break;
                case "radixFocus":
                  if (f2.clicked > 1 && 0 === p.validPositions.length) break;
                  if ((function(e4) {
                    if ("" !== d.radixPoint && 0 !== d.digits) {
                      var t4 = p.validPositions;
                      if (void 0 === t4[e4] || void 0 === t4[e4].input) {
                        if (e4 < u.call(f2, -1)) return true;
                        var n4 = l.call(f2).indexOf(d.radixPoint);
                        if (-1 !== n4) {
                          for (var i4 = 0, a3 = t4.length; i4 < a3; i4++) if (t4[i4] && n4 < i4 && t4[i4].input !== o.getPlaceholder.call(f2, i4)) return false;
                          return true;
                        }
                      }
                    }
                    return false;
                  })(e3.begin)) {
                    var h = l.call(f2).join("").indexOf(d.radixPoint);
                    e3.end = e3.begin = d.numericInput ? u.call(f2, h) : h;
                    break;
                  }
                default:
                  if (i3 = e3.begin, a2 = s.call(f2, i3, true), i3 <= (r2 = u.call(f2, -1 !== a2 || c.call(f2, 0) ? a2 : -1))) e3.end = e3.begin = c.call(f2, i3, false, true) ? i3 : u.call(f2, i3);
                  else {
                    var v = p.validPositions[a2], m = o.getTestTemplate.call(f2, r2, v ? v.match.locator : void 0, v), g = o.getPlaceholder.call(f2, r2, m.match);
                    if ("" !== g && l.call(f2)[r2] !== g && true !== m.match.optionalQuantifier && true !== m.match.newBlockMarker || !c.call(f2, r2, d.keepStatic, true) && m.match.def === g) {
                      var y = u.call(f2, r2);
                      (i3 >= y || i3 === r2) && (r2 = y);
                    }
                    e3.end = e3.begin = r2;
                  }
              }
              return e3;
            }
          }, t2.getBuffer = l, t2.getBufferTemplate = function() {
            var e3 = this.maskset;
            void 0 === e3._buffer && (e3._buffer = o.getMaskTemplate.call(this, false, 1), void 0 === e3.buffer && (e3.buffer = e3._buffer.slice()));
            return e3._buffer;
          }, t2.getLastValidPosition = s, t2.isMask = c, t2.resetMaskSet = function(e3) {
            var t3 = this.maskset;
            t3.buffer = void 0, true !== e3 && (t3.validPositions = [], t3.p = 0);
            false === e3 && (t3.tests = {}, t3.jitOffset = {});
          }, t2.seekNext = u, t2.seekPrevious = function(e3, t3) {
            var n3 = this, i3 = e3 - 1;
            if (e3 <= 0) return 0;
            for (; i3 > 0 && (true === t3 && (true !== o.getTest.call(n3, i3).match.newBlockMarker || !c.call(n3, i3, void 0, true)) || true !== t3 && !c.call(n3, i3, void 0, true)); ) i3--;
            return i3;
          }, t2.translatePosition = f;
          var i2, a = (i2 = n2(9380)) && i2.__esModule ? i2 : { default: i2 }, r = n2(7215), o = n2(4713);
          function l(e3) {
            var t3 = this, n3 = t3.maskset;
            return void 0 !== n3.buffer && true !== e3 || (n3.buffer = o.getMaskTemplate.call(t3, true, s.call(t3), true), void 0 === n3._buffer && (n3._buffer = n3.buffer.slice())), n3.buffer;
          }
          function s(e3, t3, n3) {
            var i3 = this.maskset, a2 = -1, r2 = -1, o2 = n3 || i3.validPositions;
            void 0 === e3 && (e3 = -1);
            for (var l2 = 0, s2 = o2.length; l2 < s2; l2++) o2[l2] && (t3 || true !== o2[l2].generatedInput) && (l2 <= e3 && (a2 = l2), l2 >= e3 && (r2 = l2));
            return -1 === a2 || a2 === e3 ? r2 : -1 === r2 || e3 - a2 < r2 - e3 ? a2 : r2;
          }
          function c(e3, t3, n3) {
            var i3 = this, a2 = this.maskset, r2 = o.getTestTemplate.call(i3, e3).match;
            if ("" === r2.def && (r2 = o.getTest.call(i3, e3).match), true !== r2.static) return r2.fn;
            if (true === n3 && void 0 !== a2.validPositions[e3] && true !== a2.validPositions[e3].generatedInput) return true;
            if (true !== t3 && e3 > -1) {
              if (n3) {
                var l2 = o.getTests.call(i3, e3);
                return l2.length > 1 + ("" === l2[l2.length - 1].match.def ? 1 : 0);
              }
              var s2 = o.determineTestTemplate.call(i3, e3, o.getTests.call(i3, e3)), c2 = o.getPlaceholder.call(i3, e3, s2.match);
              return s2.match.def !== c2;
            }
            return false;
          }
          function u(e3, t3, n3) {
            var i3 = this;
            void 0 === n3 && (n3 = true);
            for (var a2 = e3 + 1; "" !== o.getTest.call(i3, a2).match.def && (true === t3 && (true !== o.getTest.call(i3, a2).match.newBlockMarker || !c.call(i3, a2, void 0, true)) || true !== t3 && !c.call(i3, a2, void 0, n3)); ) a2++;
            return a2;
          }
          function f(e3) {
            var t3 = this.opts, n3 = this.el;
            return !this.isRTL || "number" != typeof e3 || t3.greedy && "" === t3.placeholder || !n3 || (e3 = this._valueGet().length - e3) < 0 && (e3 = 0), e3;
          }
        }, 4713: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.determineTestTemplate = f, t2.getDecisionTaker = s, t2.getMaskTemplate = function(e3, t3, n3, i3, a2) {
            var r2 = this, o2 = this.opts, l2 = this.maskset, s2 = o2.greedy;
            a2 && o2.greedy && (o2.greedy = false, r2.maskset.tests = {});
            t3 = t3 || 0;
            var p2, d2, v, m, g = [], y = 0;
            do {
              if (true === e3 && l2.validPositions[y]) d2 = (v = a2 && l2.validPositions[y].match.optionality && void 0 === l2.validPositions[y + 1] && (true === l2.validPositions[y].generatedInput || l2.validPositions[y].input == o2.skipOptionalPartCharacter && y > 0) ? f.call(r2, y, h.call(r2, y, p2, y - 1)) : l2.validPositions[y]).match, p2 = v.locator.slice(), g.push(true === n3 ? v.input : false === n3 ? d2.nativeDef : c.call(r2, y, d2));
              else {
                d2 = (v = u.call(r2, y, p2, y - 1)).match, p2 = v.locator.slice();
                var k = true !== i3 && (false !== o2.jitMasking ? o2.jitMasking : d2.jit);
                (m = (m || l2.validPositions[y - 1]) && d2.static && d2.def !== o2.groupSeparator && null === d2.fn) || false === k || void 0 === k || "number" == typeof k && isFinite(k) && k > y ? g.push(false === n3 ? d2.nativeDef : c.call(r2, g.length, d2)) : m = false;
              }
              y++;
            } while (true !== d2.static || "" !== d2.def || t3 > y);
            "" === g[g.length - 1] && g.pop();
            false === n3 && void 0 !== l2.maskLength || (l2.maskLength = y - 1);
            return o2.greedy = s2, g;
          }, t2.getPlaceholder = c, t2.getTest = p, t2.getTestTemplate = u, t2.getTests = h, t2.isSubsetOf = d;
          var i2, a = (i2 = n2(2394)) && i2.__esModule ? i2 : { default: i2 }, r = n2(8711);
          function o(e3) {
            return o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e4) {
              return typeof e4;
            } : function(e4) {
              return e4 && "function" == typeof Symbol && e4.constructor === Symbol && e4 !== Symbol.prototype ? "symbol" : typeof e4;
            }, o(e3);
          }
          function l(e3, t3) {
            var n3 = (null != e3.alternation ? e3.mloc[s(e3)] : e3.locator).join("");
            if ("" !== n3) for (n3 = n3.split(":")[0]; n3.length < t3; ) n3 += "0";
            return n3;
          }
          function s(e3) {
            var t3 = e3.locator[e3.alternation];
            return "string" == typeof t3 && t3.length > 0 && (t3 = t3.split(",")[0]), void 0 !== t3 ? t3.toString() : "";
          }
          function c(e3, t3, n3) {
            var i3 = this, a2 = this.opts, l2 = this.maskset;
            if (void 0 !== (t3 = t3 || p.call(i3, e3).match).placeholder || true === n3) {
              if ("" !== t3.placeholder && true === t3.static && true !== t3.generated) {
                var s2 = r.getLastValidPosition.call(i3, e3), c2 = r.seekNext.call(i3, s2);
                return (n3 ? e3 <= c2 : e3 < c2) ? a2.staticDefinitionSymbol && t3.static ? t3.nativeDef : t3.def : "function" == typeof t3.placeholder ? t3.placeholder(a2) : t3.placeholder;
              }
              return "function" == typeof t3.placeholder ? t3.placeholder(a2) : t3.placeholder;
            }
            if (true === t3.static) {
              if (e3 > -1 && void 0 === l2.validPositions[e3]) {
                var u2, f2 = h.call(i3, e3), d2 = [];
                if ("string" == typeof a2.placeholder && f2.length > 1 + ("" === f2[f2.length - 1].match.def ? 1 : 0)) {
                  for (var v = 0; v < f2.length; v++) if ("" !== f2[v].match.def && true !== f2[v].match.optionality && true !== f2[v].match.optionalQuantifier && (true === f2[v].match.static || void 0 === u2 || false !== f2[v].match.fn.test(u2.match.def, l2, e3, true, a2)) && (d2.push(f2[v]), true === f2[v].match.static && (u2 = f2[v]), d2.length > 1 && /[0-9a-bA-Z]/.test(d2[0].match.def))) return a2.placeholder.charAt(e3 % a2.placeholder.length);
                }
              }
              return t3.def;
            }
            return "object" === o(a2.placeholder) ? t3.def : a2.placeholder.charAt(e3 % a2.placeholder.length);
          }
          function u(e3, t3, n3) {
            return this.maskset.validPositions[e3] || f.call(this, e3, h.call(this, e3, t3 ? t3.slice() : t3, n3));
          }
          function f(e3, t3) {
            var n3 = this.opts, i3 = 0, a2 = (function(e4, t4) {
              var n4 = 0, i4 = false;
              t4.forEach((function(e5) {
                e5.match.optionality && (0 !== n4 && n4 !== e5.match.optionality && (i4 = true), (0 === n4 || n4 > e5.match.optionality) && (n4 = e5.match.optionality));
              })), n4 && (0 == e4 || 1 == t4.length ? n4 = 0 : i4 || (n4 = 0));
              return n4;
            })(e3, t3);
            e3 = e3 > 0 ? e3 - 1 : 0;
            var r2, o2, s2, c2 = l(p.call(this, e3));
            n3.greedy && t3.length > 1 && "" === t3[t3.length - 1].match.def && (i3 = 1);
            for (var u2 = 0; u2 < t3.length - i3; u2++) {
              var f2 = t3[u2];
              r2 = l(f2, c2.length);
              var d2 = Math.abs(r2 - c2);
              (true !== f2.unMatchedAlternationStopped || t3.filter((function(e4) {
                return true !== e4.unMatchedAlternationStopped;
              })).length <= 1) && (void 0 === o2 || "" !== r2 && d2 < o2 || s2 && !n3.greedy && s2.match.optionality && s2.match.optionality - a2 > 0 && "master" === s2.match.newBlockMarker && (!f2.match.optionality || f2.match.optionality - a2 < 1 || !f2.match.newBlockMarker) || s2 && !n3.greedy && s2.match.optionalQuantifier && !f2.match.optionalQuantifier) && (o2 = d2, s2 = f2);
            }
            return s2;
          }
          function p(e3, t3) {
            var n3 = this.maskset;
            return n3.validPositions[e3] ? n3.validPositions[e3] : (t3 || h.call(this, e3))[0];
          }
          function d(e3, t3, n3) {
            function i3(e4) {
              for (var t4, n4 = [], i4 = -1, a2 = 0, r2 = e4.length; a2 < r2; a2++) if ("-" === e4.charAt(a2)) for (t4 = e4.charCodeAt(a2 + 1); ++i4 < t4; ) n4.push(String.fromCharCode(i4));
              else i4 = e4.charCodeAt(a2), n4.push(e4.charAt(a2));
              return n4.join("");
            }
            return e3.match.def === t3.match.nativeDef || !(!(n3.regex || e3.match.fn instanceof RegExp && t3.match.fn instanceof RegExp) || true === e3.match.static || true === t3.match.static) && ("." === t3.match.fn.source || -1 !== i3(t3.match.fn.source.replace(/[[\]/]/g, "")).indexOf(i3(e3.match.fn.source.replace(/[[\]/]/g, ""))));
          }
          function h(e3, t3, n3) {
            var i3, r2, o2 = this, l2 = this.dependencyLib, s2 = this.maskset, c2 = this.opts, u2 = this.el, p2 = s2.maskToken, h2 = t3 ? n3 : 0, v = t3 ? t3.slice() : [0], m = [], g = false, y = t3 ? t3.join("") : "", k = false;
            function b(t4, n4, r3, l3) {
              function f2(r4, l4, p4) {
                function v3(e4, t5) {
                  var n5 = 0 === t5.matches.indexOf(e4);
                  return n5 || t5.matches.every((function(i4, a2) {
                    return true === i4.isQuantifier ? n5 = v3(e4, t5.matches[a2 - 1]) : Object.prototype.hasOwnProperty.call(i4, "matches") && (n5 = v3(e4, i4)), !n5;
                  })), n5;
                }
                function w2(e4, t5, n5) {
                  var i4, a2;
                  if ((s2.tests[e4] || s2.validPositions[e4]) && (s2.validPositions[e4] ? [s2.validPositions[e4]] : s2.tests[e4]).every((function(e5, r6) {
                    if (e5.mloc[t5]) return i4 = e5, false;
                    var o4 = void 0 !== n5 ? n5 : e5.alternation, l5 = void 0 !== e5.locator[o4] ? e5.locator[o4].toString().indexOf(t5) : -1;
                    return (void 0 === a2 || l5 < a2) && -1 !== l5 && (i4 = e5, a2 = l5), true;
                  })), i4) {
                    var r5 = i4.locator[i4.alternation], o3 = i4.mloc[t5] || i4.mloc[r5] || i4.locator;
                    if (-1 !== o3[o3.length - 1].toString().indexOf(":")) o3.pop();
                    return o3.slice((void 0 !== n5 ? n5 : i4.alternation) + 1);
                  }
                  return void 0 !== n5 ? w2(e4, t5) : void 0;
                }
                function P2(t5, n5) {
                  return true === t5.match.static && true !== n5.match.static && n5.match.fn.test(t5.match.def, s2, e3, false, c2, false);
                }
                function S2(e4, t5) {
                  var n5 = e4.alternation, i4 = void 0 === t5 || n5 <= t5.alternation && -1 === e4.locator[n5].toString().indexOf(t5.locator[n5]);
                  if (!i4 && n5 > t5.alternation) {
                    for (var a2 = 0; a2 < n5; a2++) if (e4.locator[a2] !== t5.locator[a2]) {
                      n5 = a2, i4 = true;
                      break;
                    }
                  }
                  return !!i4 && (function(n6) {
                    e4.mloc = e4.mloc || {};
                    var i5 = e4.locator[n6];
                    if (void 0 !== i5) {
                      if ("string" == typeof i5 && (i5 = i5.split(",")[0]), void 0 === e4.mloc[i5] && (e4.mloc[i5] = e4.locator.slice(), e4.mloc[i5].push(":".concat(e4.alternation))), void 0 !== t5) {
                        for (var a3 in t5.mloc) "string" == typeof a3 && (a3 = parseInt(a3.split(",")[0])), e4.mloc[a3 + 0] = t5.mloc[a3];
                        e4.locator[n6] = Object.keys(e4.mloc).join(",");
                      }
                      return e4.alternation > n6 && (e4.alternation = n6), true;
                    }
                    return e4.alternation = void 0, false;
                  })(n5);
                }
                function O(e4, t5) {
                  if (e4.locator.length !== t5.locator.length) return false;
                  for (var n5 = e4.alternation + 1; n5 < e4.locator.length; n5++) if (e4.locator[n5] !== t5.locator[n5]) return false;
                  return true;
                }
                if (h2 > e3 + c2._maxTestPos) throw new Error("Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. ".concat(s2.mask));
                if (h2 === e3 && void 0 === r4.matches) {
                  if (m.push({ match: r4, locator: l4.reverse(), cd: y, mloc: {} }), !r4.optionality || void 0 !== p4 || !(c2.definitions && c2.definitions[r4.nativeDef] && c2.definitions[r4.nativeDef].optional || a.default.prototype.definitions[r4.nativeDef] && a.default.prototype.definitions[r4.nativeDef].optional)) return true;
                  g = true, h2 = e3;
                } else if (void 0 !== r4.matches) {
                  if (r4.isGroup && p4 !== r4) return (function() {
                    if (r4 = f2(t4.matches[t4.matches.indexOf(r4) + 1], l4, p4)) return true;
                  })();
                  if (r4.isOptional) return (function() {
                    var t5 = r4, a2 = m.length;
                    if (r4 = b(r4, n4, l4, p4), m.length > 0) {
                      if (m.forEach((function(e4, t6) {
                        t6 >= a2 && (e4.match.optionality = e4.match.optionality ? e4.match.optionality + 1 : 1);
                      })), i3 = m[m.length - 1].match, void 0 !== p4 || !v3(i3, t5)) return r4;
                      g = true, h2 = e3;
                    }
                  })();
                  if (r4.isAlternator) return (function() {
                    function i4(e4) {
                      for (var t5, n5 = e4.matches[0].matches ? e4.matches[0].matches.length : 1, i5 = 0; i5 < e4.matches.length && n5 === (t5 = e4.matches[i5].matches ? e4.matches[i5].matches.length : 1); i5++) ;
                      return n5 !== t5;
                    }
                    o2.hasAlternator = true;
                    var a2, v4 = r4, y2 = [], b2 = m.slice(), x2 = l4.length, _ = n4.length > 0 ? n4.shift() : -1;
                    if (-1 === _ || "string" == typeof _) {
                      var M, E = h2, j = n4.slice(), T = [];
                      if ("string" == typeof _) T = _.split(",");
                      else for (M = 0; M < v4.matches.length; M++) T.push(M.toString());
                      if (void 0 !== s2.excludes[e3]) {
                        for (var A = T.slice(), D = 0, L = s2.excludes[e3].length; D < L; D++) {
                          var C = s2.excludes[e3][D].toString().split(":");
                          l4.length == C[1] && T.splice(T.indexOf(C[0]), 1);
                        }
                        0 === T.length && (delete s2.excludes[e3], T = A);
                      }
                      (true === c2.keepStatic || isFinite(parseInt(c2.keepStatic)) && E >= c2.keepStatic) && (T = T.slice(0, 1));
                      for (var B = 0; B < T.length; B++) {
                        M = parseInt(T[B]), m = [], n4 = "string" == typeof _ && w2(h2, M, x2) || j.slice();
                        var I = v4.matches[M];
                        if (I && f2(I, [M].concat(l4), p4)) r4 = true;
                        else if (0 === B && (k = i4(v4)), I && I.matches && I.matches.length > v4.matches[0].matches.length) break;
                        a2 = m.slice(), h2 = E, m = [];
                        for (var R = 0; R < a2.length; R++) {
                          var F = a2[R], N = false;
                          F.alternation = F.alternation || x2, S2(F);
                          for (var V = 0; V < y2.length; V++) {
                            var G = y2[V];
                            if ("string" != typeof _ || void 0 !== F.alternation && T.includes(F.locator[F.alternation].toString())) {
                              if (F.match.nativeDef === G.match.nativeDef) {
                                N = true, S2(G, F);
                                break;
                              }
                              if (d(F, G, c2)) {
                                S2(F, G) && (N = true, y2.splice(y2.indexOf(G), 0, F));
                                break;
                              }
                              if (d(G, F, c2)) {
                                S2(G, F);
                                break;
                              }
                              if (P2(F, G)) {
                                O(F, G) || void 0 !== u2.inputmask.userOptions.keepStatic ? S2(F, G) && (N = true, y2.splice(y2.indexOf(G), 0, F)) : c2.keepStatic = true;
                                break;
                              }
                              if (P2(G, F)) {
                                S2(G, F);
                                break;
                              }
                            }
                          }
                          N || y2.push(F);
                        }
                      }
                      m = b2.concat(y2), h2 = e3, g = m.length > 0 && k, r4 = y2.length > 0 && !k, k && g && !r4 && m.forEach((function(e4, t5) {
                        e4.unMatchedAlternationStopped = true;
                      })), n4 = j.slice();
                    } else r4 = f2(v4.matches[_] || t4.matches[_], [_].concat(l4), p4);
                    if (r4) return true;
                  })();
                  if (r4.isQuantifier && p4 !== t4.matches[t4.matches.indexOf(r4) - 1]) return (function() {
                    for (var a2 = r4, o3 = false, u3 = n4.length > 0 ? n4.shift() : 0; u3 < (isNaN(a2.quantifier.max) ? u3 + 1 : a2.quantifier.max) && h2 <= e3; u3++) {
                      var p5 = t4.matches[t4.matches.indexOf(a2) - 1];
                      if (r4 = f2(p5, [u3].concat(l4), p5)) {
                        if (m.forEach((function(t5, n5) {
                          (i3 = x(p5, t5.match) ? t5.match : m[m.length - 1].match).optionalQuantifier = u3 >= a2.quantifier.min, i3.jit = (u3 + 1) * (p5.matches.indexOf(i3) + 1) > a2.quantifier.jit, i3.optionalQuantifier && v3(i3, p5) && (g = true, h2 = e3, c2.greedy && null == s2.validPositions[e3 - 1] && u3 > a2.quantifier.min && -1 != ["*", "+"].indexOf(a2.quantifier.max) && (m.pop(), y = void 0), o3 = true, r4 = false), !o3 && i3.jit && (s2.jitOffset[e3] = p5.matches.length - p5.matches.indexOf(i3));
                        })), o3) break;
                        return true;
                      }
                    }
                  })();
                  if (r4 = b(r4, n4, l4, p4)) return true;
                } else h2++;
              }
              for (var p3 = n4.length > 0 ? n4.shift() : 0; p3 < t4.matches.length; p3++) if (true !== t4.matches[p3].isQuantifier) {
                var v2 = f2(t4.matches[p3], [p3].concat(r3), l3);
                if (v2 && h2 === e3) return v2;
                if (h2 > e3) break;
              }
            }
            function x(e4, t4) {
              var n4 = -1 != e4.matches.indexOf(t4);
              return n4 || e4.matches.forEach((function(e5, i4) {
                void 0 === e5.matches || n4 || (n4 = x(e5, t4));
              })), n4;
            }
            if (e3 > -1) {
              if (void 0 === t3) {
                for (var w, P = e3 - 1; void 0 === (w = s2.validPositions[P] || s2.tests[P]) && P > -1; ) P--;
                void 0 !== w && P > -1 && (v = (function(e4, t4) {
                  var n4, i4 = [];
                  return Array.isArray(t4) || (t4 = [t4]), t4.length > 0 && (void 0 === t4[0].alternation || true === c2.keepStatic ? 0 === (i4 = f.call(o2, e4, t4.slice()).locator.slice()).length && (i4 = t4[0].locator.slice()) : t4.forEach((function(e5) {
                    "" !== e5.def && (0 === i4.length ? (n4 = e5.alternation, i4 = e5.locator.slice()) : e5.locator[n4] && -1 === i4[n4].toString().indexOf(e5.locator[n4]) && (i4[n4] += "," + e5.locator[n4]));
                  }))), i4;
                })(P, w), y = v.join(""), h2 = P);
              }
              if (s2.tests[e3] && s2.tests[e3][0].cd === y) return s2.tests[e3];
              for (var S = v.shift(); S < p2.length; S++) {
                if (b(p2[S], v, [S]) && h2 === e3 || h2 > e3) break;
              }
            }
            return (0 === m.length || g) && m.push({ match: { fn: null, static: true, optionality: false, casing: null, def: "", placeholder: "" }, locator: k && 0 === m.filter((function(e4) {
              return true !== e4.unMatchedAlternationStopped;
            })).length ? [0] : [], mloc: {}, cd: y }), void 0 !== t3 && s2.tests[e3] ? r2 = l2.extend(true, [], m) : (s2.tests[e3] = l2.extend(true, [], m), r2 = s2.tests[e3]), m.forEach((function(e4) {
              e4.match.optionality = e4.match.defOptionality || false;
            })), r2;
          }
        }, 7215: function(e2, t2, n2) {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.alternate = l, t2.checkAlternationMatch = function(e3, t3, n3) {
            for (var i3, a2 = this.opts.greedy ? t3 : t3.slice(0, 1), r2 = false, o2 = void 0 !== n3 ? n3.split(",") : [], l2 = 0; l2 < o2.length; l2++) -1 !== (i3 = e3.indexOf(o2[l2])) && e3.splice(i3, 1);
            for (var s2 = 0; s2 < e3.length; s2++) if (a2.includes(e3[s2])) {
              r2 = true;
              break;
            }
            return r2;
          }, t2.handleRemove = function(e3, t3, n3, i3, s2) {
            var c2 = this, u2 = this.maskset, f2 = this.opts;
            if ((f2.numericInput || c2.isRTL) && (t3 === a.keys.Backspace ? t3 = a.keys.Delete : t3 === a.keys.Delete && (t3 = a.keys.Backspace), c2.isRTL)) {
              var p2 = n3.end;
              n3.end = n3.begin, n3.begin = p2;
            }
            var d2, h2 = r.getLastValidPosition.call(c2, void 0, true);
            n3.end >= r.getBuffer.call(c2).length && h2 >= n3.end && (n3.end = h2 + 1);
            t3 === a.keys.Backspace ? n3.end - n3.begin < 1 && (n3.begin = r.seekPrevious.call(c2, n3.begin)) : t3 === a.keys.Delete && n3.begin === n3.end && (n3.end = r.isMask.call(c2, n3.end, true, true) ? n3.end + 1 : r.seekNext.call(c2, n3.end) + 1);
            false !== (d2 = v.call(c2, n3)) && ((true !== i3 && false !== f2.keepStatic || null !== f2.regex && -1 !== o.getTest.call(c2, n3.begin).match.def.indexOf("|")) && l.call(c2, true), true !== i3 && (u2.p = t3 === a.keys.Delete ? n3.begin + d2 : n3.begin, u2.p = r.determineNewCaretPosition.call(c2, { begin: u2.p, end: u2.p }, false, false === f2.insertMode && t3 === a.keys.Backspace ? "none" : void 0).begin));
          }, t2.isComplete = c, t2.isSelection = u, t2.isValid = f, t2.refreshFromBuffer = d, t2.revalidateMask = v;
          var i2 = n2(6030), a = n2(2839), r = n2(8711), o = n2(4713);
          function l(e3, t3, n3, i3, a2, s2) {
            var c2 = this, u2 = this.dependencyLib, p2 = this.opts, d2 = c2.maskset;
            if (!c2.hasAlternator) return false;
            var h2, v2, m, g, y, k, b, x, w, P, S, O = u2.extend(true, [], d2.validPositions), _ = u2.extend(true, {}, d2.tests), M = false, E = false, j = void 0 !== a2 ? a2 : r.getLastValidPosition.call(c2);
            if (s2 && (P = s2.begin, S = s2.end, s2.begin > s2.end && (P = s2.end, S = s2.begin)), -1 === j && void 0 === a2) h2 = 0, v2 = (g = o.getTest.call(c2, h2)).alternation;
            else for (; j >= 0; j--) if ((m = d2.validPositions[j]) && void 0 !== m.alternation) {
              if (j <= (e3 || 0) && g && g.locator[m.alternation] !== m.locator[m.alternation]) break;
              h2 = j, v2 = d2.validPositions[h2].alternation, g = m;
            }
            if (void 0 !== v2) {
              b = parseInt(h2), d2.excludes[b] = d2.excludes[b] || [], true !== e3 && d2.excludes[b].push((0, o.getDecisionTaker)(g) + ":" + g.alternation);
              var T = [], A = -1;
              for (y = b; b < r.getLastValidPosition.call(c2, void 0, true) + 1; y++) -1 === A && e3 <= y && void 0 !== t3 && (T.push(t3), A = T.length - 1), (k = d2.validPositions[b]) && true !== k.generatedInput && (void 0 === s2 || y < P || y >= S) && T.push(k.input), d2.validPositions.splice(b, 1);
              for (-1 === A && void 0 !== t3 && (T.push(t3), A = T.length - 1); void 0 !== d2.excludes[b] && d2.excludes[b].length < 10; ) {
                for (d2.tests = {}, r.resetMaskSet.call(c2, true), M = true, y = 0; y < T.length && (x = M.caret || 0 == p2.insertMode && null != x ? r.seekNext.call(c2, x) : r.getLastValidPosition.call(c2, void 0, true) + 1, w = T[y], M = f.call(c2, x, w, false, i3, true)); y++) y === A && (E = M), 1 == e3 && M && (E = { caretPos: y });
                if (M) break;
                if (r.resetMaskSet.call(c2), g = o.getTest.call(c2, b), d2.validPositions = u2.extend(true, [], O), d2.tests = u2.extend(true, {}, _), !d2.excludes[b]) {
                  E = l.call(c2, e3, t3, n3, i3, b - 1, s2);
                  break;
                }
                if (null != g.alternation) {
                  var D = (0, o.getDecisionTaker)(g);
                  if (-1 !== d2.excludes[b].indexOf(D + ":" + g.alternation)) {
                    E = l.call(c2, e3, t3, n3, i3, b - 1, s2);
                    break;
                  }
                  for (d2.excludes[b].push(D + ":" + g.alternation), y = b; y < r.getLastValidPosition.call(c2, void 0, true) + 1; y++) d2.validPositions.splice(b);
                } else delete d2.excludes[b];
              }
            }
            return E && false === p2.keepStatic || delete d2.excludes[b], E;
          }
          function s(e3, t3, n3) {
            var i3 = this.opts, r2 = this.maskset;
            switch (i3.casing || t3.casing) {
              case "upper":
                e3 = e3.toUpperCase();
                break;
              case "lower":
                e3 = e3.toLowerCase();
                break;
              case "title":
                var o2 = r2.validPositions[n3 - 1];
                e3 = 0 === n3 || o2 && o2.input === String.fromCharCode(a.keyCode.Space) ? e3.toUpperCase() : e3.toLowerCase();
                break;
              default:
                if ("function" == typeof i3.casing) {
                  var l2 = Array.prototype.slice.call(arguments);
                  l2.push(r2.validPositions), e3 = i3.casing.apply(this, l2);
                }
            }
            return e3;
          }
          function c(e3) {
            var t3 = this, n3 = this.opts, i3 = this.maskset;
            if ("function" == typeof n3.isComplete) return n3.isComplete(e3, n3);
            if ("*" !== n3.repeat) {
              var a2 = false, l2 = r.determineLastRequiredPosition.call(t3, true), s2 = l2.l;
              if (void 0 === l2.def || l2.def.newBlockMarker || l2.def.optionality || l2.def.optionalQuantifier) {
                a2 = true;
                for (var c2 = 0; c2 <= s2; c2++) {
                  var u2 = o.getTestTemplate.call(t3, c2).match;
                  if (true !== u2.static && void 0 === i3.validPositions[c2] && (false === u2.optionality || void 0 === u2.optionality || u2.optionality && 0 == u2.newBlockMarker) && (false === u2.optionalQuantifier || void 0 === u2.optionalQuantifier) || true === u2.static && "" != u2.def && e3[c2] !== o.getPlaceholder.call(t3, c2, u2)) {
                    a2 = false;
                    break;
                  }
                }
              }
              return a2;
            }
          }
          function u(e3) {
            var t3 = this.opts.insertMode ? 0 : 1;
            return this.isRTL ? e3.begin - e3.end > t3 : e3.end - e3.begin > t3;
          }
          function f(e3, t3, n3, i3, a2, p2, m) {
            var g = this, y = this.dependencyLib, k = this.opts, b = g.maskset;
            n3 = true === n3;
            var x = e3;
            function w(e4) {
              if (void 0 !== e4) {
                if (void 0 !== e4.remove && (Array.isArray(e4.remove) || (e4.remove = [e4.remove]), e4.remove.sort((function(e5, t5) {
                  return g.isRTL ? e5.pos - t5.pos : t5.pos - e5.pos;
                })).forEach((function(e5) {
                  v.call(g, { begin: e5, end: e5 + 1 });
                })), e4.remove = void 0), void 0 !== e4.insert && (Array.isArray(e4.insert) || (e4.insert = [e4.insert]), e4.insert.sort((function(e5, t5) {
                  return g.isRTL ? t5.pos - e5.pos : e5.pos - t5.pos;
                })).forEach((function(e5) {
                  "" !== e5.c && f.call(g, e5.pos, e5.c, void 0 === e5.strict || e5.strict, void 0 !== e5.fromIsValid ? e5.fromIsValid : i3);
                })), e4.insert = void 0), e4.refreshFromBuffer && e4.buffer) {
                  var t4 = e4.refreshFromBuffer;
                  d.call(g, true === t4 ? t4 : t4.start, t4.end, e4.buffer), e4.refreshFromBuffer = void 0;
                }
                void 0 !== e4.rewritePosition && (x = e4.rewritePosition, e4 = true);
              }
              return e4;
            }
            function P(t4, n4, a3) {
              var l2 = false;
              return o.getTests.call(g, t4).every((function(c2, f2) {
                var p3 = c2.match;
                if (r.getBuffer.call(g, true), false !== (l2 = (!p3.jit || void 0 !== b.validPositions[r.seekPrevious.call(g, t4)]) && (null != p3.fn ? p3.fn.test(n4, b, t4, a3, k, u.call(g, e3)) : (n4 === p3.def || n4 === k.skipOptionalPartCharacter) && "" !== p3.def && { c: o.getPlaceholder.call(g, t4, p3, true) || p3.def, pos: t4 }))) {
                  var d2 = void 0 !== l2.c ? l2.c : n4, h2 = t4;
                  return d2 = d2 === k.skipOptionalPartCharacter && true === p3.static ? o.getPlaceholder.call(g, t4, p3, true) || p3.def : d2, true !== (l2 = w(l2)) && void 0 !== l2.pos && l2.pos !== t4 && (h2 = l2.pos), true !== l2 && void 0 === l2.pos && void 0 === l2.c ? false : (false === v.call(g, e3, y.extend({}, c2, { input: s.call(g, d2, p3, h2) }), i3, h2) && (l2 = false), false);
                }
                return true;
              })), l2;
            }
            void 0 !== e3.begin && (x = g.isRTL ? e3.end : e3.begin);
            var S = true, O = y.extend(true, [], b.validPositions);
            if (false === k.keepStatic && void 0 !== b.excludes[x] && true !== a2 && true !== i3) for (var _ = x; _ < (g.isRTL ? e3.begin : e3.end); _++) void 0 !== b.excludes[_] && (b.excludes[_] = void 0, delete b.tests[_]);
            if ("function" == typeof k.preValidation && true !== i3 && true !== p2 && (S = w(S = k.preValidation.call(g, r.getBuffer.call(g), x, t3, u.call(g, e3), k, b, e3, n3 || a2))), true === S) {
              if (S = P(x, t3, n3), (!n3 || true === i3) && false === S && true !== p2) {
                var M = b.validPositions[x];
                if (!M || true !== M.match.static || M.match.def !== t3 && t3 !== k.skipOptionalPartCharacter) {
                  if (k.insertMode || void 0 === b.validPositions[r.seekNext.call(g, x)] || e3.end > x) {
                    var E = false;
                    if (b.jitOffset[x] && void 0 === b.validPositions[r.seekNext.call(g, x)] && false !== (S = f.call(g, x + b.jitOffset[x], t3, true, true)) && (true !== a2 && (S.caret = x), E = true), e3.end > x && (b.validPositions[x] = void 0), !E && !r.isMask.call(g, x, k.keepStatic && 0 === x)) {
                      for (var j = x + 1, T = r.seekNext.call(g, x, false, 0 !== x); j <= T; j++) if (false !== (S = P(j, t3, n3))) {
                        S = h.call(g, x, void 0 !== S.pos ? S.pos : j) || S, x = j;
                        break;
                      }
                    }
                  }
                } else S = { caret: r.seekNext.call(g, x) };
              }
              g.hasAlternator && true !== a2 && !n3 && (a2 = true, false === S && k.keepStatic && (c.call(g, r.getBuffer.call(g)) || 0 === x) ? S = l.call(g, x, t3, n3, i3, void 0, e3) : (u.call(g, e3) && b.tests[x] && b.tests[x].length > 1 && k.keepStatic || 1 == S && true !== k.numericInput && b.tests[x] && b.tests[x].length > 1 && r.getLastValidPosition.call(g, void 0, true) > x) && (S = l.call(g, true))), true === S && (S = { pos: x });
            }
            if ("function" == typeof k.postValidation && true !== i3 && true !== p2) {
              var A = k.postValidation.call(g, r.getBuffer.call(g, true), void 0 !== e3.begin ? g.isRTL ? e3.end : e3.begin : e3, t3, S, k, b, n3, m);
              void 0 !== A && (S = true === A ? S : A);
            }
            S && void 0 === S.pos && (S.pos = x), false === S || true === p2 ? (r.resetMaskSet.call(g, true), b.validPositions = y.extend(true, [], O)) : h.call(g, void 0, x, true);
            var D = w(S);
            void 0 !== g.maxLength && (r.getBuffer.call(g).length > g.maxLength && !i3 && (r.resetMaskSet.call(g, true), b.validPositions = y.extend(true, [], O), D = false));
            return D;
          }
          function p(e3, t3, n3) {
            for (var i3 = this.maskset, a2 = false, r2 = o.getTests.call(this, e3), l2 = 0; l2 < r2.length; l2++) {
              if (r2[l2].match && (r2[l2].match.nativeDef === t3.match[n3.shiftPositions ? "def" : "nativeDef"] && (!n3.shiftPositions || !t3.match.static) || r2[l2].match.nativeDef === t3.match.nativeDef || n3.regex && !r2[l2].match.static && r2[l2].match.fn.test(t3.input, i3, e3, false, n3))) {
                a2 = true;
                break;
              }
              if (r2[l2].match && r2[l2].match.def === t3.match.nativeDef) {
                a2 = void 0;
                break;
              }
            }
            return false === a2 && void 0 !== i3.jitOffset[e3] && (a2 = p.call(this, e3 + i3.jitOffset[e3], t3, n3)), a2;
          }
          function d(e3, t3, n3) {
            var a2, o2, l2 = this, s2 = this.maskset, c2 = this.opts, u2 = this.dependencyLib, f2 = c2.skipOptionalPartCharacter, p2 = l2.isRTL ? n3.slice().reverse() : n3;
            if (c2.skipOptionalPartCharacter = "", true === e3) r.resetMaskSet.call(l2, false), e3 = 0, t3 = n3.length, o2 = r.determineNewCaretPosition.call(l2, { begin: 0, end: 0 }, false).begin;
            else {
              for (a2 = e3; a2 < t3; a2++) s2.validPositions.splice(e3, 0);
              o2 = e3;
            }
            var d2 = new u2.Event("keypress");
            for (a2 = e3; a2 < t3; a2++) {
              d2.key = p2[a2].toString(), l2.ignorable = false;
              var h2 = i2.EventHandlers.keypressEvent.call(l2, d2, true, false, false, o2);
              false !== h2 && void 0 !== h2 && (o2 = h2.forwardPosition);
            }
            c2.skipOptionalPartCharacter = f2;
          }
          function h(e3, t3, n3) {
            var i3 = this, a2 = this.maskset, l2 = this.dependencyLib;
            if (void 0 === e3) for (e3 = t3 - 1; e3 > 0 && !a2.validPositions[e3]; e3--) ;
            for (var s2 = e3; s2 < t3; s2++) {
              if (void 0 === a2.validPositions[s2] && !r.isMask.call(i3, s2, false)) {
                if (0 == s2 ? o.getTest.call(i3, s2) : a2.validPositions[s2 - 1]) {
                  var c2 = o.getTests.call(i3, s2).slice();
                  "" === c2[c2.length - 1].match.def && c2.pop();
                  var u2, p2 = o.determineTestTemplate.call(i3, s2, c2);
                  if (p2 && (true !== p2.match.jit || "master" === p2.match.newBlockMarker && (u2 = a2.validPositions[s2 + 1]) && true === u2.match.optionalQuantifier) && ((p2 = l2.extend({}, p2, { input: o.getPlaceholder.call(i3, s2, p2.match, true) || p2.match.def })).generatedInput = true, v.call(i3, s2, p2, true), true !== n3)) {
                    var d2 = a2.validPositions[t3].input;
                    return a2.validPositions[t3] = void 0, f.call(i3, t3, d2, true, true);
                  }
                }
              }
            }
          }
          function v(e3, t3, n3, i3) {
            var a2 = this, l2 = this.maskset, s2 = this.opts, c2 = this.dependencyLib;
            function d2(e4, t4, n4) {
              var i4 = t4[e4];
              if (void 0 !== i4 && true === i4.match.static && true !== i4.match.optionality && (void 0 === t4[0] || void 0 === t4[0].alternation)) {
                var a3 = n4.begin <= e4 - 1 ? t4[e4 - 1] && true === t4[e4 - 1].match.static && t4[e4 - 1] : t4[e4 - 1], r2 = n4.end > e4 + 1 ? t4[e4 + 1] && true === t4[e4 + 1].match.static && t4[e4 + 1] : t4[e4 + 1];
                return a3 && r2;
              }
              return false;
            }
            var h2 = 0, v2 = void 0 !== e3.begin ? e3.begin : e3, m = void 0 !== e3.end ? e3.end : e3, g = true;
            if (e3.begin > e3.end && (v2 = e3.end, m = e3.begin), i3 = void 0 !== i3 ? i3 : v2, void 0 === n3 && (v2 !== m || s2.insertMode && void 0 !== l2.validPositions[i3] || void 0 === t3 || t3.match.optionalQuantifier || t3.match.optionality)) {
              var y, k = c2.extend(true, [], l2.validPositions), b = r.getLastValidPosition.call(a2, void 0, true);
              l2.p = v2;
              var x = u.call(a2, e3) ? v2 : i3;
              for (y = b; y >= x; y--) l2.validPositions.splice(y, 1), void 0 === t3 && delete l2.tests[y + 1];
              var w, P, S = i3, O = S;
              for (t3 && (l2.validPositions[i3] = c2.extend(true, {}, t3), O++, S++), null == k[m] && l2.jitOffset[m] && (m += l2.jitOffset[m] + 1), y = t3 ? m : m - 1; y <= b; y++) {
                if (void 0 !== (w = k[y]) && true !== w.generatedInput && (y >= m || y >= v2 && d2(y, k, { begin: v2, end: m }))) {
                  for (; "" !== o.getTest.call(a2, O).match.def; ) {
                    if (false !== (P = p.call(a2, O, w, s2)) || "+" === w.match.def) {
                      "+" === w.match.def && r.getBuffer.call(a2, true);
                      var _ = f.call(a2, O, w.input, "+" !== w.match.def, true);
                      if (g = false !== _, S = (_.pos || O) + 1, !g && P) break;
                    } else g = false;
                    if (g) {
                      void 0 === t3 && w.match.static && y === e3.begin && h2++;
                      break;
                    }
                    if (!g && r.getBuffer.call(a2), O > l2.maskLength) break;
                    O++;
                  }
                  "" == o.getTest.call(a2, O).match.def && (g = false), O = S;
                }
                if (!g) break;
              }
              if (!g) return l2.validPositions = c2.extend(true, [], k), r.resetMaskSet.call(a2, true), false;
            } else t3 && o.getTest.call(a2, i3).match.cd === t3.match.cd && (l2.validPositions[i3] = c2.extend(true, {}, t3));
            return r.resetMaskSet.call(a2, true), h2;
          }
        } }, t = {};
        function n(i2) {
          var a = t[i2];
          if (void 0 !== a) return a.exports;
          var r = t[i2] = { exports: {} };
          return e[i2](r, r.exports, n), r.exports;
        }
        var i = {};
        return (function() {
          var e2 = i;
          Object.defineProperty(e2, "__esModule", { value: true }), e2.default = void 0, n(7149), n(3194), n(9302), n(4013), n(3851), n(219), n(207), n(5296);
          var t2, a = (t2 = n(2394)) && t2.__esModule ? t2 : { default: t2 };
          e2.default = a.default;
        })(), i;
      })();
    }));
  })(inputmask_min$1);
  return inputmask_min$1.exports;
}
requireInputmask_min();
function inputMask() {
  const inputMasks = document.querySelectorAll("input[data-fls-input-mask]");
  inputMasks.forEach((inputMask2) => {
    Inputmask({ "mask": `${inputMask2.dataset.flsInputMask}` }).mask(inputMask2);
  });
}
document.querySelector("input[data-fls-input-mask]") ? window.addEventListener("load", inputMask) : null;
const autoHeight = () => {
  const textareas = document.querySelectorAll("textarea[data-fls-input-autoheight]");
  if (textareas.length) {
    let setHeight = function(textarea, height) {
      textarea.style.height = `${height}px`;
    };
    textareas.forEach((textarea) => {
      const startHeight = textarea.hasAttribute("data-fls-input-autoheight-min") ? Number(textarea.dataset.flsInputAutoheightMin) : Number(textarea.offsetHeight);
      const maxHeight = textarea.hasAttribute("data-fls-input-autoheight-max") ? Number(textarea.dataset.flsInputAutoheightMax) : Infinity;
      setHeight(textarea, Math.min(startHeight, maxHeight));
      textarea.addEventListener("input", () => {
        if (textarea.scrollHeight > startHeight) {
          textarea.style.height = `auto`;
          setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
        }
      });
    });
  }
};
document.querySelector("textarea[data-fls-input-autoheight]") ? window.addEventListener("load", autoHeight) : null;
function formInit() {
  function formSubmit() {
    const forms = document.forms;
    if (forms.length) {
      for (const form of forms) {
        !form.hasAttribute("data-fls-form-novalidate") ? form.setAttribute("novalidate", true) : null;
        form.addEventListener("submit", function(e) {
          const form2 = e.target;
          formSubmitAction(form2, e);
        });
        form.addEventListener("reset", function(e) {
          const form2 = e.target;
          formValidate.formClean(form2);
        });
      }
    }
    async function formSubmitAction(form, e) {
      const error = formValidate.getErrors(form);
      if (error === 0) {
        if (form.dataset.flsForm === "ajax") {
          e.preventDefault();
          const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
          const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
          const formData = new FormData(form);
          form.classList.add("--sending");
          const response = await fetch(formAction, {
            method: formMethod,
            body: formData
          });
          if (response.ok) {
            let responseResult = await response.json();
            form.classList.remove("--sending");
            formSent(form, responseResult);
          } else {
            form.classList.remove("--sending");
          }
        } else if (form.dataset.flsForm === "dev") {
          e.preventDefault();
          formSent(form);
        }
      } else {
        e.preventDefault();
        if (form.querySelector(".--form-error") && form.hasAttribute("data-fls-form-gotoerr")) {
          const formGoToErrorClass = form.dataset.flsFormGotoerr ? form.dataset.flsFormGotoerr : ".--form-error";
          gotoBlock(formGoToErrorClass);
        }
      }
    }
    function formSent(form, responseResult = ``) {
      document.dispatchEvent(new CustomEvent("formSent", {
        detail: {
          form
        }
      }));
      if (form.dataset.flsForm === "dev" && form.closest("[data-fls-popup]")) {
        if (window.flsPopup && window.flsPopup.isOpen) {
          window.flsPopup.close();
          let opened = false;
          const openSuccessPopup = function() {
            if (!opened && window.flsPopup) {
              opened = true;
              window.flsPopup.open("success");
            }
          };
          document.addEventListener("afterPopupClose", function handler() {
            document.removeEventListener("afterPopupClose", handler);
            setTimeout(openSuccessPopup, 400);
          }, { once: true });
          setTimeout(function() {
            if (!opened) {
              openSuccessPopup();
            }
          }, 800);
        } else {
          setTimeout(() => {
            if (window.flsPopup) {
              window.flsPopup.open("success");
            }
          }, 100);
        }
      } else if (form.dataset.flsFormCta === "true") {
        const ctaSuccessMessage = form.querySelector(".cta-form__success");
        const signupSuccessMessage = form.querySelector(".signup-form__success");
        const successMessage = ctaSuccessMessage || signupSuccessMessage;
        if (successMessage) {
          successMessage.classList.add("--active");
          setTimeout(() => {
            successMessage.classList.remove("--active");
          }, 4e3);
        }
      } else {
        setTimeout(() => {
          if (window.flsPopup) {
            const popup = form.dataset.flsFormPopup;
            popup ? window.flsPopup.open(popup) : null;
          }
        }, 0);
      }
      formValidate.formClean(form);
    }
  }
  function formFieldsInit() {
    document.body.addEventListener("focusin", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-fls-form-nofocus")) {
          targetElement.classList.add("--form-focus");
          targetElement.parentElement.classList.add("--form-focus");
        }
        targetElement.hasAttribute("data-fls-form-validatenow") ? formValidate.removeError(targetElement) : null;
      }
    });
    document.body.addEventListener("focusout", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-fls-form-nofocus")) {
          targetElement.classList.remove("--form-focus");
          targetElement.parentElement.classList.remove("--form-focus");
        }
        targetElement.hasAttribute("data-fls-form-validatenow") ? formValidate.validateInput(targetElement) : null;
      }
    });
  }
  formSubmit();
  formFieldsInit();
}
document.querySelector("[data-fls-form]") ? window.addEventListener("load", formInit) : null;
class ScrollWatcher {
  constructor(props) {
    let defaultConfig = {
      logging: true
    };
    this.config = Object.assign(defaultConfig, props);
    this.observer;
    !document.documentElement.hasAttribute("data-fls-watch") ? this.scrollWatcherRun() : null;
  }
  // Обновляем конструктор
  scrollWatcherUpdate() {
    this.scrollWatcherRun();
  }
  // Запускаем конструктор
  scrollWatcherRun() {
    document.documentElement.setAttribute("data-fls-watch", "");
    this.scrollWatcherConstructor(document.querySelectorAll("[data-fls-watcher]"));
  }
  // Конструктор наблюдателей
  scrollWatcherConstructor(items) {
    if (items.length) {
      let uniqParams = uniqArray(Array.from(items).map(function(item) {
        if (item.dataset.flsWatcher === "navigator" && !item.dataset.flsWatcherThreshold) {
          let valueOfThreshold;
          if (item.clientHeight > 2) {
            valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1);
            if (valueOfThreshold > 1) {
              valueOfThreshold = 1;
            }
          } else {
            valueOfThreshold = 1;
          }
          item.setAttribute(
            "data-fls-watcher-threshold",
            valueOfThreshold.toFixed(2)
          );
        }
        return `${item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null}|${item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px"}|${item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0}`;
      }));
      uniqParams.forEach((uniqParam) => {
        let uniqParamArray = uniqParam.split("|");
        let paramsWatch = {
          root: uniqParamArray[0],
          margin: uniqParamArray[1],
          threshold: uniqParamArray[2]
        };
        let groupItems = Array.from(items).filter(function(item) {
          let watchRoot = item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null;
          let watchMargin = item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px";
          let watchThreshold = item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0;
          if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) {
            return item;
          }
        });
        let configWatcher = this.getScrollWatcherConfig(paramsWatch);
        this.scrollWatcherInit(groupItems, configWatcher);
      });
    }
  }
  // Функция создания настроек
  getScrollWatcherConfig(paramsWatch) {
    let configWatcher = {};
    if (document.querySelector(paramsWatch.root)) {
      configWatcher.root = document.querySelector(paramsWatch.root);
    } else if (paramsWatch.root !== "null") ;
    configWatcher.rootMargin = paramsWatch.margin;
    if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) {
      return;
    }
    if (paramsWatch.threshold === "prx") {
      paramsWatch.threshold = [];
      for (let i = 0; i <= 1; i += 5e-3) {
        paramsWatch.threshold.push(i);
      }
    } else {
      paramsWatch.threshold = paramsWatch.threshold.split(",");
    }
    configWatcher.threshold = paramsWatch.threshold;
    return configWatcher;
  }
  // Функция создания нового наблюдателя со своими настройками
  scrollWatcherCreate(configWatcher) {
    this.observer = new IntersectionObserver((entries2, observer) => {
      entries2.forEach((entry) => {
        this.scrollWatcherCallback(entry, observer);
      });
    }, configWatcher);
  }
  // Функция инициализации наблюдателя со своими настройками
  scrollWatcherInit(items, configWatcher) {
    this.scrollWatcherCreate(configWatcher);
    items.forEach((item) => this.observer.observe(item));
  }
  // Функция обработки базовых действий точек срабатывания
  scrollWatcherIntersecting(entry, targetElement) {
    if (entry.isIntersecting) {
      !targetElement.classList.contains("--watcher-view") ? targetElement.classList.add("--watcher-view") : null;
    } else {
      targetElement.classList.contains("--watcher-view") ? targetElement.classList.remove("--watcher-view") : null;
    }
  }
  // Функция отключения слежения за объектом
  scrollWatcherOff(targetElement, observer) {
    observer.unobserve(targetElement);
  }
  // Функция обработки наблюдения
  scrollWatcherCallback(entry, observer) {
    const targetElement = entry.target;
    this.scrollWatcherIntersecting(entry, targetElement);
    targetElement.hasAttribute("data-fls-watcher-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
    document.dispatchEvent(new CustomEvent("watcherCallback", {
      detail: {
        entry
      }
    }));
  }
}
document.querySelector("[data-fls-watcher]") ? window.addEventListener("load", () => new ScrollWatcher({})) : null;
(function() {
  function append() {
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
      var node = i < 0 || arguments.length <= i ? void 0 : arguments[i];
      if (node.nodeType === 1 || node.nodeType === 11) this.appendChild(node);
      else this.appendChild(document.createTextNode(String(node)));
    }
  }
  function replaceChildren() {
    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }
    if (arguments.length) this.append.apply(this, arguments);
  }
  function replaceWith() {
    var parent = this.parentNode;
    for (var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++) {
      nodes[_key] = arguments[_key];
    }
    var i = nodes.length;
    if (!parent) return;
    if (!i) parent.removeChild(this);
    while (i--) {
      var node = nodes[i];
      if (typeof node !== "object") {
        node = this.ownerDocument.createTextNode(node);
      } else if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      if (!i) {
        parent.replaceChild(node, this);
      } else {
        parent.insertBefore(this.previousSibling, node);
      }
    }
  }
  if (typeof Element !== "undefined") {
    if (!Element.prototype.append) {
      Element.prototype.append = append;
      DocumentFragment.prototype.append = append;
    }
    if (!Element.prototype.replaceChildren) {
      Element.prototype.replaceChildren = replaceChildren;
      DocumentFragment.prototype.replaceChildren = replaceChildren;
    }
    if (!Element.prototype.replaceWith) {
      Element.prototype.replaceWith = replaceWith;
      DocumentFragment.prototype.replaceWith = replaceWith;
    }
  }
})();
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$1(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass$1(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties$1(Constructor, staticProps);
  return Constructor;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}
function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = void 0;
  try {
    for (var _i2 = arr[Symbol.iterator](), _s; !(_n = (_s = _i2.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i2["return"] != null) _i2["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function extend(target, object) {
  return Object.getOwnPropertyNames(Object(target)).reduce(function(extended, key) {
    var currentValue = Object.getOwnPropertyDescriptor(Object(target), key);
    var newValue = Object.getOwnPropertyDescriptor(Object(object), key);
    return Object.defineProperty(extended, key, newValue || currentValue);
  }, {});
}
function isString(value) {
  return typeof value === "string";
}
function isArray(value) {
  return Array.isArray(value);
}
function parseSettings() {
  var settings = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var object = extend(settings);
  var types;
  if (object.types !== void 0) {
    types = object.types;
  } else if (object.split !== void 0) {
    types = object.split;
  }
  if (types !== void 0) {
    object.types = (isString(types) || isArray(types) ? String(types) : "").split(",").map(function(type) {
      return String(type).trim();
    }).filter(function(type) {
      return /((line)|(word)|(char))/i.test(type);
    });
  }
  if (object.absolute || object.position) {
    object.absolute = object.absolute || /absolute/.test(settings.position);
  }
  return object;
}
function parseTypes(value) {
  var types = isString(value) || isArray(value) ? String(value) : "";
  return {
    none: !types,
    lines: /line/i.test(types),
    words: /word/i.test(types),
    chars: /char/i.test(types)
  };
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isNode(input) {
  return isObject(input) && /^(1|3|11)$/.test(input.nodeType);
}
function isLength(value) {
  return typeof value === "number" && value > -1 && value % 1 === 0;
}
function isArrayLike(value) {
  return isObject(value) && isLength(value.length);
}
function toArray$1(value) {
  if (isArray(value)) return value;
  if (value == null) return [];
  return isArrayLike(value) ? Array.prototype.slice.call(value) : [value];
}
function getTargetElements(target) {
  var elements = target;
  if (isString(target)) {
    if (/^(#[a-z]\w+)$/.test(target.trim())) {
      elements = document.getElementById(target.trim().slice(1));
    } else {
      elements = document.querySelectorAll(target);
    }
  }
  return toArray$1(elements).reduce(function(result, element) {
    return [].concat(_toConsumableArray(result), _toConsumableArray(toArray$1(element).filter(isNode)));
  }, []);
}
var entries = Object.entries;
var expando = "_splittype";
var cache = {};
var uid = 0;
function set(owner, key, value) {
  if (!isObject(owner)) {
    console.warn("[data.set] owner is not an object");
    return null;
  }
  var id = owner[expando] || (owner[expando] = ++uid);
  var data = cache[id] || (cache[id] = {});
  if (value === void 0) {
    if (!!key && Object.getPrototypeOf(key) === Object.prototype) {
      cache[id] = _objectSpread2(_objectSpread2({}, data), key);
    }
  } else if (key !== void 0) {
    data[key] = value;
  }
  return value;
}
function get(owner, key) {
  var id = isObject(owner) ? owner[expando] : null;
  var data = id && cache[id] || {};
  {
    return data;
  }
}
function remove(element) {
  var id = element && element[expando];
  if (id) {
    delete element[id];
    delete cache[id];
  }
}
function clear() {
  Object.keys(cache).forEach(function(key) {
    delete cache[key];
  });
}
function cleanup() {
  entries(cache).forEach(function(_ref) {
    var _ref2 = _slicedToArray(_ref, 2), id = _ref2[0], _ref2$ = _ref2[1], isRoot = _ref2$.isRoot, isSplit = _ref2$.isSplit;
    if (!isRoot || !isSplit) {
      cache[id] = null;
      delete cache[id];
    }
  });
}
function toWords(value) {
  var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : " ";
  var string = value ? String(value) : "";
  return string.trim().replace(/\s+/g, " ").split(separator);
}
var rsAstralRange = "\\ud800-\\udfff";
var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
var rsComboSymbolsRange = "\\u20d0-\\u20f0";
var rsVarRange = "\\ufe0e\\ufe0f";
var rsAstral = "[".concat(rsAstralRange, "]");
var rsCombo = "[".concat(rsComboMarksRange).concat(rsComboSymbolsRange, "]");
var rsFitz = "\\ud83c[\\udffb-\\udfff]";
var rsModifier = "(?:".concat(rsCombo, "|").concat(rsFitz, ")");
var rsNonAstral = "[^".concat(rsAstralRange, "]");
var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var rsZWJ = "\\u200d";
var reOptMod = "".concat(rsModifier, "?");
var rsOptVar = "[".concat(rsVarRange, "]?");
var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = "(?:".concat(["".concat(rsNonAstral).concat(rsCombo, "?"), rsCombo, rsRegional, rsSurrPair, rsAstral].join("|"), "\n)");
var reUnicode = RegExp("".concat(rsFitz, "(?=").concat(rsFitz, ")|").concat(rsSymbol).concat(rsSeq), "g");
var unicodeRange = [rsZWJ, rsAstralRange, rsComboMarksRange, rsComboSymbolsRange, rsVarRange];
var reHasUnicode = RegExp("[".concat(unicodeRange.join(""), "]"));
function asciiToArray(string) {
  return string.split("");
}
function hasUnicode(string) {
  return reHasUnicode.test(string);
}
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}
function stringToArray(string) {
  return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}
function toString(value) {
  return value == null ? "" : String(value);
}
function toChars(string) {
  var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
  string = toString(string);
  if (string && isString(string)) {
    if (!separator && hasUnicode(string)) {
      return stringToArray(string);
    }
  }
  return string.split(separator);
}
function createElement(name, attributes) {
  var element = document.createElement(name);
  if (!attributes) {
    return element;
  }
  Object.keys(attributes).forEach(function(attribute) {
    var rawValue = attributes[attribute];
    var value = isString(rawValue) ? rawValue.trim() : rawValue;
    if (value === null || value === "") return;
    if (attribute === "children") {
      element.append.apply(element, _toConsumableArray(toArray$1(value)));
    } else {
      element.setAttribute(attribute, value);
    }
  });
  return element;
}
var defaults = {
  splitClass: "",
  lineClass: "line",
  wordClass: "word",
  charClass: "char",
  types: ["lines", "words", "chars"],
  absolute: false,
  tagName: "div"
};
function splitWordsAndChars(textNode, settings) {
  settings = extend(defaults, settings);
  var types = parseTypes(settings.types);
  var TAG_NAME = settings.tagName;
  var VALUE = textNode.nodeValue;
  var splitText = document.createDocumentFragment();
  var words = [];
  var chars = [];
  if (/^\s/.test(VALUE)) {
    splitText.append(" ");
  }
  words = toWords(VALUE).reduce(function(result, WORD, idx, arr) {
    var wordElement;
    var characterElementsForCurrentWord;
    if (types.chars) {
      characterElementsForCurrentWord = toChars(WORD).map(function(CHAR) {
        var characterElement = createElement(TAG_NAME, {
          "class": "".concat(settings.splitClass, " ").concat(settings.charClass),
          style: "display: inline-block;",
          children: CHAR
        });
        set(characterElement, "isChar", true);
        chars = [].concat(_toConsumableArray(chars), [characterElement]);
        return characterElement;
      });
    }
    if (types.words || types.lines) {
      wordElement = createElement(TAG_NAME, {
        "class": "".concat(settings.wordClass, " ").concat(settings.splitClass),
        style: "display: inline-block; ".concat(types.words && settings.absolute ? "position: relative;" : ""),
        children: types.chars ? characterElementsForCurrentWord : WORD
      });
      set(wordElement, {
        isWord: true,
        isWordStart: true,
        isWordEnd: true
      });
      splitText.appendChild(wordElement);
    } else {
      characterElementsForCurrentWord.forEach(function(characterElement) {
        splitText.appendChild(characterElement);
      });
    }
    if (idx < arr.length - 1) {
      splitText.append(" ");
    }
    return types.words ? result.concat(wordElement) : result;
  }, []);
  if (/\s$/.test(VALUE)) {
    splitText.append(" ");
  }
  textNode.replaceWith(splitText);
  return {
    words,
    chars
  };
}
function split(node, settings) {
  var type = node.nodeType;
  var wordsAndChars = {
    words: [],
    chars: []
  };
  if (!/(1|3|11)/.test(type)) {
    return wordsAndChars;
  }
  if (type === 3 && /\S/.test(node.nodeValue)) {
    return splitWordsAndChars(node, settings);
  }
  var childNodes = toArray$1(node.childNodes);
  if (childNodes.length) {
    set(node, "isSplit", true);
    if (!get(node).isRoot) {
      node.style.display = "inline-block";
      node.style.position = "relative";
      var nextSibling = node.nextSibling;
      var prevSibling = node.previousSibling;
      var text = node.textContent || "";
      var textAfter = nextSibling ? nextSibling.textContent : " ";
      var textBefore = prevSibling ? prevSibling.textContent : " ";
      set(node, {
        isWordEnd: /\s$/.test(text) || /^\s/.test(textAfter),
        isWordStart: /^\s/.test(text) || /\s$/.test(textBefore)
      });
    }
  }
  return childNodes.reduce(function(result, child) {
    var _split = split(child, settings), words = _split.words, chars = _split.chars;
    return {
      words: [].concat(_toConsumableArray(result.words), _toConsumableArray(words)),
      chars: [].concat(_toConsumableArray(result.chars), _toConsumableArray(chars))
    };
  }, wordsAndChars);
}
function getPosition(node, isWord, settings, scrollPos) {
  if (!settings.absolute) {
    return {
      top: isWord ? node.offsetTop : null
    };
  }
  var parent = node.offsetParent;
  var _scrollPos = _slicedToArray(scrollPos, 2), scrollX = _scrollPos[0], scrollY = _scrollPos[1];
  var parentX = 0;
  var parentY = 0;
  if (parent && parent !== document.body) {
    var parentRect = parent.getBoundingClientRect();
    parentX = parentRect.x + scrollX;
    parentY = parentRect.y + scrollY;
  }
  var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height, x = _node$getBoundingClie.x, y = _node$getBoundingClie.y;
  var top = y + scrollY - parentY;
  var left = x + scrollX - parentX;
  return {
    width,
    height,
    top,
    left
  };
}
function unSplitWords(element) {
  if (!get(element).isWord) {
    toArray$1(element.children).forEach(function(child) {
      return unSplitWords(child);
    });
  } else {
    remove(element);
    element.replaceWith.apply(element, _toConsumableArray(element.childNodes));
  }
}
var createFragment = function createFragment2() {
  return document.createDocumentFragment();
};
function repositionAfterSplit(element, settings, scrollPos) {
  var types = parseTypes(settings.types);
  var TAG_NAME = settings.tagName;
  var nodes = element.getElementsByTagName("*");
  var wordsInEachLine = [];
  var wordsInCurrentLine = [];
  var lineOffsetY = null;
  var elementHeight;
  var elementWidth;
  var contentBox;
  var lines = [];
  var parent = element.parentElement;
  var nextSibling = element.nextElementSibling;
  var splitText = createFragment();
  var cs = window.getComputedStyle(element);
  var align = cs.textAlign;
  var fontSize = parseFloat(cs.fontSize);
  var lineThreshold = fontSize * 0.2;
  if (settings.absolute) {
    contentBox = {
      left: element.offsetLeft,
      top: element.offsetTop,
      width: element.offsetWidth
    };
    elementWidth = element.offsetWidth;
    elementHeight = element.offsetHeight;
    set(element, {
      cssWidth: element.style.width,
      cssHeight: element.style.height
    });
  }
  toArray$1(nodes).forEach(function(node) {
    var isWordLike = node.parentElement === element;
    var _getPosition = getPosition(node, isWordLike, settings, scrollPos), width = _getPosition.width, height = _getPosition.height, top = _getPosition.top, left = _getPosition.left;
    if (/^br$/i.test(node.nodeName)) return;
    if (types.lines && isWordLike) {
      if (lineOffsetY === null || top - lineOffsetY >= lineThreshold) {
        lineOffsetY = top;
        wordsInEachLine.push(wordsInCurrentLine = []);
      }
      wordsInCurrentLine.push(node);
    }
    if (settings.absolute) {
      set(node, {
        top,
        left,
        width,
        height
      });
    }
  });
  if (parent) {
    parent.removeChild(element);
  }
  if (types.lines) {
    lines = wordsInEachLine.map(function(wordsInThisLine) {
      var lineElement = createElement(TAG_NAME, {
        "class": "".concat(settings.splitClass, " ").concat(settings.lineClass),
        style: "display: block; text-align: ".concat(align, "; width: 100%;")
      });
      set(lineElement, "isLine", true);
      var lineDimensions = {
        height: 0,
        top: 1e4
      };
      splitText.appendChild(lineElement);
      wordsInThisLine.forEach(function(wordOrElement, idx, arr) {
        var _data$get = get(wordOrElement), isWordEnd = _data$get.isWordEnd, top = _data$get.top, height = _data$get.height;
        var next = arr[idx + 1];
        lineDimensions.height = Math.max(lineDimensions.height, height);
        lineDimensions.top = Math.min(lineDimensions.top, top);
        lineElement.appendChild(wordOrElement);
        if (isWordEnd && get(next).isWordStart) {
          lineElement.append(" ");
        }
      });
      if (settings.absolute) {
        set(lineElement, {
          height: lineDimensions.height,
          top: lineDimensions.top
        });
      }
      return lineElement;
    });
    if (!types.words) {
      unSplitWords(splitText);
    }
    element.replaceChildren(splitText);
  }
  if (settings.absolute) {
    element.style.width = "".concat(element.style.width || elementWidth, "px");
    element.style.height = "".concat(elementHeight, "px");
    toArray$1(nodes).forEach(function(node) {
      var _data$get2 = get(node), isLine = _data$get2.isLine, top = _data$get2.top, left = _data$get2.left, width = _data$get2.width, height = _data$get2.height;
      var parentData = get(node.parentElement);
      var isChildOfLineNode = !isLine && parentData.isLine;
      node.style.top = "".concat(isChildOfLineNode ? top - parentData.top : top, "px");
      node.style.left = isLine ? "".concat(contentBox.left, "px") : "".concat(left - (isChildOfLineNode ? contentBox.left : 0), "px");
      node.style.height = "".concat(height, "px");
      node.style.width = isLine ? "".concat(contentBox.width, "px") : "".concat(width, "px");
      node.style.position = "absolute";
    });
  }
  if (parent) {
    if (nextSibling) parent.insertBefore(element, nextSibling);
    else parent.appendChild(element);
  }
  return lines;
}
var _defaults$2 = extend(defaults, {});
var SplitType = /* @__PURE__ */ (function() {
  _createClass$1(SplitType2, null, [{
    key: "clearData",
    /**
     * CLears all data
     */
    value: function clearData() {
      clear();
    }
    /**
     * The default settings for all splitType instances
     * @static
     */
  }, {
    key: "setDefaults",
    /**
     * Sets the default settings for all SplitType instances.
     * The provided object will be merged with the existing defaults objects.
     *
     * @param {Object} settings an object containing the settings to override
     * @returns {Object} the new default settings
     * @public
     * @static
     * @example
     * SplitType.setDefaults({ "position": "absolute" })
     */
    value: function setDefaults(options) {
      _defaults$2 = extend(_defaults$2, parseSettings(options));
      return defaults;
    }
    /**
     * Revert target elements to their original html content
     * Has no effect on that
     *
     * @param {any} elements The target elements to revert. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @static
     */
  }, {
    key: "revert",
    value: function revert(elements) {
      getTargetElements(elements).forEach(function(element) {
        var _data$get = get(element), isSplit = _data$get.isSplit, html = _data$get.html, cssWidth = _data$get.cssWidth, cssHeight = _data$get.cssHeight;
        if (isSplit) {
          element.innerHTML = html;
          element.style.width = cssWidth || "";
          element.style.height = cssHeight || "";
          remove(element);
        }
      });
    }
    /**
     * Creates a new SplitType instance
     * This static method provides a way to create a `SplitType` instance without
     * using the `new` keyword.
     *
     * @param {any} target The target elements to split. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @param {Object} [options] Settings for the SplitType instance
     * @return {SplitType} the SplitType instance
     * @static
     */
  }, {
    key: "create",
    value: function create(target, options) {
      return new SplitType2(target, options);
    }
    /**
     * Creates a new `SplitType` instance
     *
     * @param {any} elements The target elements to split. One of:
     *  - {string} A css selector
     *  - {HTMLElement} A single element
     * -  {NodeList} A NodeList or collection
     *  - {HTMLElement[]} An array of Elements
     * -  {Array<HTMLElement|NodeList|HTMLElement[]>} A nested array of elements
     * @param {Object} [options] Settings for the SplitType instance
     */
  }, {
    key: "data",
    /**
     * The internal data store
     */
    get: function get2() {
      return cache;
    }
  }, {
    key: "defaults",
    get: function get2() {
      return _defaults$2;
    },
    set: function set2(options) {
      _defaults$2 = extend(_defaults$2, parseSettings(options));
    }
  }]);
  function SplitType2(elements, options) {
    _classCallCheck(this, SplitType2);
    this.isSplit = false;
    this.settings = extend(_defaults$2, parseSettings(options));
    this.elements = getTargetElements(elements);
    this.split();
  }
  _createClass$1(SplitType2, [{
    key: "split",
    value: function split$1(options) {
      var _this = this;
      this.revert();
      this.elements.forEach(function(element) {
        set(element, "html", element.innerHTML);
      });
      this.lines = [];
      this.words = [];
      this.chars = [];
      var scrollPos = [window.pageXOffset, window.pageYOffset];
      if (options !== void 0) {
        this.settings = extend(this.settings, parseSettings(options));
      }
      var types = parseTypes(this.settings.types);
      if (types.none) {
        return;
      }
      this.elements.forEach(function(element) {
        set(element, "isRoot", true);
        var _split2 = split(element, _this.settings), words = _split2.words, chars = _split2.chars;
        _this.words = [].concat(_toConsumableArray(_this.words), _toConsumableArray(words));
        _this.chars = [].concat(_toConsumableArray(_this.chars), _toConsumableArray(chars));
      });
      this.elements.forEach(function(element) {
        if (types.lines || _this.settings.absolute) {
          var lines = repositionAfterSplit(element, _this.settings, scrollPos);
          _this.lines = [].concat(_toConsumableArray(_this.lines), _toConsumableArray(lines));
        }
      });
      this.isSplit = true;
      window.scrollTo(scrollPos[0], scrollPos[1]);
      cleanup();
    }
    /**
     * Reverts target element(s) back to their original html content
     * Deletes all stored data associated with the target elements
     * Resets the properties on the splitType instance
     *
     * @public
     */
  }, {
    key: "revert",
    value: function revert() {
      if (this.isSplit) {
        this.lines = null;
        this.words = null;
        this.chars = null;
        this.isSplit = false;
      }
      SplitType2.revert(this.elements);
    }
  }]);
  return SplitType2;
})();
function splitType() {
  SplitType.create("[data-fls-splittype]", {
    absolute: false,
    tagName: "div",
    lineClass: "line",
    wordClass: "word",
    charClass: "char",
    splitClass: "",
    types: "lines, words, chars",
    split: ""
  });
}
document.querySelector("[data-fls-splittype]") ? window.addEventListener("load", splitType) : null;
function pageNavigation() {
  document.addEventListener("click", pageNavigationAction);
  document.addEventListener("watcherCallback", pageNavigationAction);
  function pageNavigationAction(e) {
    if (e.type === "click") {
      const targetElement = e.target;
      if (targetElement.closest("[data-fls-scrollto]")) {
        const gotoLink = targetElement.closest("[data-fls-scrollto]");
        const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : "";
        const noHeader = gotoLink.hasAttribute("data-fls-scrollto-header") ? true : false;
        const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
        const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
        if (window.fullpage) {
          const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest("[data-fls-fullpage-section]");
          const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
          if (fullpageSectionId !== null) {
            window.fullpage.switchingSection(fullpageSectionId);
            if (document.documentElement.hasAttribute("data-fls-menu-open")) {
              bodyUnlock();
              document.documentElement.removeAttribute("data-fls-menu-open");
            }
          }
        } else {
          gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
          if (document.documentElement.hasAttribute("data-fls-menu-open")) {
            bodyUnlock();
            document.documentElement.removeAttribute("data-fls-menu-open");
          }
        }
        e.preventDefault();
      }
    } else if (e.type === "watcherCallback" && e.detail) {
      const entry = e.detail.entry;
      const targetElement = entry.target;
      if (targetElement.dataset.flsWatcher === "navigator") {
        document.querySelector(`[data-fls-scrollto].--navigator-active`);
        let navigatorCurrentItem;
        if (targetElement.id && document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`)) {
          navigatorCurrentItem = document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`);
        } else if (targetElement.classList.length) {
          for (let index = 0; index < targetElement.classList.length; index++) {
            const element = targetElement.classList[index];
            if (document.querySelector(`[data-fls-scrollto=".${element}"]`)) {
              navigatorCurrentItem = document.querySelector(`[data-fls-scrollto=".${element}"]`);
              break;
            }
          }
        }
        if (entry.isIntersecting) {
          navigatorCurrentItem ? navigatorCurrentItem.classList.add("--navigator-active") : null;
        } else {
          navigatorCurrentItem ? navigatorCurrentItem.classList.remove("--navigator-active") : null;
        }
      }
    }
  }
  if (location.hash) {
    const hash = location.hash;
    history.replaceState(null, null, " ");
    setTimeout(() => {
      history.replaceState(null, null, hash);
    }, 0);
  }
  window.addEventListener("load", () => {
    const hash = getHash();
    if (hash && hash !== "hero") {
      let goToHash;
      if (document.querySelector(`#${hash}`)) {
        goToHash = `#${hash}`;
      } else if (document.querySelector(`.${hash}`)) {
        goToHash = `.${hash}`;
      }
      if (goToHash) {
        setTimeout(() => {
          gotoBlock(goToHash, false, 500, 0);
        }, 100);
      }
    } else {
      if (window.scrollY > 100) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      const heroLink = document.querySelector('[data-fls-scrollto="#hero"]');
      if (heroLink) {
        document.querySelectorAll("[data-fls-scrollto].--navigator-active").forEach((item) => {
          item.classList.remove("--navigator-active");
        });
        heroLink.classList.add("--navigator-active");
      }
    }
  });
}
document.querySelector("[data-fls-scrollto]") ? window.addEventListener("load", pageNavigation) : null;
function _assertThisInitialized(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}
var _config = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
}, _defaults$1 = {
  duration: 0.5,
  overwrite: false,
  delay: 0
}, _suppressOverwrites$1, _reverting$1, _context$2, _bigNum$1 = 1e8, _tinyNum = 1 / _bigNum$1, _2PI = Math.PI * 2, _HALF_PI = _2PI / 4, _gsID = 0, _sqrt = Math.sqrt, _cos = Math.cos, _sin = Math.sin, _isString$1 = function _isString2(value) {
  return typeof value === "string";
}, _isFunction$1 = function _isFunction2(value) {
  return typeof value === "function";
}, _isNumber$1 = function _isNumber2(value) {
  return typeof value === "number";
}, _isUndefined = function _isUndefined2(value) {
  return typeof value === "undefined";
}, _isObject$1 = function _isObject2(value) {
  return typeof value === "object";
}, _isNotFalse = function _isNotFalse2(value) {
  return value !== false;
}, _windowExists$2 = function _windowExists2() {
  return typeof window !== "undefined";
}, _isFuncOrString = function _isFuncOrString2(value) {
  return _isFunction$1(value) || _isString$1(value);
}, _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function() {
}, _isArray = Array.isArray, _randomExp = /random\([^)]+\)/g, _commaDelimExp = /,\s*/g, _strictNumExp = /(?:-?\.?\d|\.)+/gi, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, _relExp = /[+-]=-?[.\d]+/, _delimitedValueExp = /[^,'"\[\]\s]+/gi, _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, _globalTimeline, _win$3, _coreInitted$2, _doc$3, _globals = {}, _installScope = {}, _coreReady, _install = function _install2(scope) {
  return (_installScope = _merge(scope, _globals)) && gsap$2;
}, _missingPlugin = function _missingPlugin2(property, value) {
  return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
}, _warn = function _warn2(message, suppress) {
  return !suppress && console.warn(message);
}, _addGlobal = function _addGlobal2(name, obj) {
  return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
}, _emptyFunc = function _emptyFunc2() {
  return 0;
}, _startAtRevertConfig = {
  suppressEvents: true,
  isStart: true,
  kill: false
}, _revertConfigNoKill = {
  suppressEvents: true,
  kill: false
}, _revertConfig = {
  suppressEvents: true
}, _reservedProps = {}, _lazyTweens = [], _lazyLookup = {}, _lastRenderedFrame, _plugins = {}, _effects = {}, _nextGCFrame = 30, _harnessPlugins = [], _callbackNames = "", _harness = function _harness2(targets) {
  var target = targets[0], harnessPlugin, i;
  _isObject$1(target) || _isFunction$1(target) || (targets = [targets]);
  if (!(harnessPlugin = (target._gsap || {}).harness)) {
    i = _harnessPlugins.length;
    while (i-- && !_harnessPlugins[i].targetTest(target)) {
    }
    harnessPlugin = _harnessPlugins[i];
  }
  i = targets.length;
  while (i--) {
    targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
  }
  return targets;
}, _getCache = function _getCache2(target) {
  return target._gsap || _harness(toArray(target))[0]._gsap;
}, _getProperty = function _getProperty2(target, property, v) {
  return (v = target[property]) && _isFunction$1(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
}, _forEachName = function _forEachName2(names, func) {
  return (names = names.split(",")).forEach(func) || names;
}, _round$1 = function _round2(value) {
  return Math.round(value * 1e5) / 1e5 || 0;
}, _roundPrecise = function _roundPrecise2(value) {
  return Math.round(value * 1e7) / 1e7 || 0;
}, _parseRelative = function _parseRelative2(start, value) {
  var operator = value.charAt(0), end = parseFloat(value.substr(2));
  start = parseFloat(start);
  return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
}, _arrayContainsAny = function _arrayContainsAny2(toSearch, toFind) {
  var l = toFind.length, i = 0;
  for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) {
  }
  return i < l;
}, _lazyRender = function _lazyRender2() {
  var l = _lazyTweens.length, a = _lazyTweens.slice(0), i, tween;
  _lazyLookup = {};
  _lazyTweens.length = 0;
  for (i = 0; i < l; i++) {
    tween = a[i];
    tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
  }
}, _isRevertWorthy = function _isRevertWorthy2(animation) {
  return !!(animation._initted || animation._startAt || animation.add);
}, _lazySafeRender = function _lazySafeRender2(animation, time, suppressEvents, force) {
  _lazyTweens.length && !_reverting$1 && _lazyRender();
  animation.render(time, suppressEvents, !!(_reverting$1 && time < 0 && _isRevertWorthy(animation)));
  _lazyTweens.length && !_reverting$1 && _lazyRender();
}, _numericIfPossible = function _numericIfPossible2(value) {
  var n = parseFloat(value);
  return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString$1(value) ? value.trim() : value;
}, _passThrough$1 = function _passThrough2(p) {
  return p;
}, _setDefaults$1 = function _setDefaults2(obj, defaults22) {
  for (var p in defaults22) {
    p in obj || (obj[p] = defaults22[p]);
  }
  return obj;
}, _setKeyframeDefaults = function _setKeyframeDefaults2(excludeDuration) {
  return function(obj, defaults22) {
    for (var p in defaults22) {
      p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults22[p]);
    }
  };
}, _merge = function _merge2(base, toMerge) {
  for (var p in toMerge) {
    base[p] = toMerge[p];
  }
  return base;
}, _mergeDeep = function _mergeDeep2(base, toMerge) {
  for (var p in toMerge) {
    p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject$1(toMerge[p]) ? _mergeDeep2(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
  }
  return base;
}, _copyExcluding = function _copyExcluding2(obj, excluding) {
  var copy = {}, p;
  for (p in obj) {
    p in excluding || (copy[p] = obj[p]);
  }
  return copy;
}, _inheritDefaults = function _inheritDefaults2(vars) {
  var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults$1;
  if (_isNotFalse(vars.inherit)) {
    while (parent) {
      func(vars, parent.vars.defaults);
      parent = parent.parent || parent._dp;
    }
  }
  return vars;
}, _arraysMatch = function _arraysMatch2(a1, a2) {
  var i = a1.length, match = i === a2.length;
  while (match && i-- && a1[i] === a2[i]) {
  }
  return i < 0;
}, _addLinkedListItem = function _addLinkedListItem2(parent, child, firstProp, lastProp, sortBy) {
  var prev = parent[lastProp], t;
  if (sortBy) {
    t = child[sortBy];
    while (prev && prev[sortBy] > t) {
      prev = prev._prev;
    }
  }
  if (prev) {
    child._next = prev._next;
    prev._next = child;
  } else {
    child._next = parent[firstProp];
    parent[firstProp] = child;
  }
  if (child._next) {
    child._next._prev = child;
  } else {
    parent[lastProp] = child;
  }
  child._prev = prev;
  child.parent = child._dp = parent;
  return child;
}, _removeLinkedListItem = function _removeLinkedListItem2(parent, child, firstProp, lastProp) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }
  if (lastProp === void 0) {
    lastProp = "_last";
  }
  var prev = child._prev, next = child._next;
  if (prev) {
    prev._next = next;
  } else if (parent[firstProp] === child) {
    parent[firstProp] = next;
  }
  if (next) {
    next._prev = prev;
  } else if (parent[lastProp] === child) {
    parent[lastProp] = prev;
  }
  child._next = child._prev = child.parent = null;
}, _removeFromParent = function _removeFromParent2(child, onlyIfParentHasAutoRemove) {
  child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove && child.parent.remove(child);
  child._act = 0;
}, _uncache = function _uncache2(animation, child) {
  if (animation && (!child || child._end > animation._dur || child._start < 0)) {
    var a = animation;
    while (a) {
      a._dirty = 1;
      a = a.parent;
    }
  }
  return animation;
}, _recacheAncestors = function _recacheAncestors2(animation) {
  var parent = animation.parent;
  while (parent && parent.parent) {
    parent._dirty = 1;
    parent.totalDuration();
    parent = parent.parent;
  }
  return animation;
}, _rewindStartAt = function _rewindStartAt2(tween, totalTime, suppressEvents, force) {
  return tween._startAt && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
}, _hasNoPausedAncestors = function _hasNoPausedAncestors2(animation) {
  return !animation || animation._ts && _hasNoPausedAncestors2(animation.parent);
}, _elapsedCycleDuration = function _elapsedCycleDuration2(animation) {
  return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
}, _animationCycle = function _animationCycle2(tTime, cycleDuration) {
  var whole = Math.floor(tTime = _roundPrecise(tTime / cycleDuration));
  return tTime && whole === tTime ? whole - 1 : whole;
}, _parentToChildTotalTime = function _parentToChildTotalTime2(parentTime, child) {
  return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
}, _setEnd = function _setEnd2(animation) {
  return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
}, _alignPlayhead = function _alignPlayhead2(animation, totalTime) {
  var parent = animation._dp;
  if (parent && parent.smoothChildTiming && animation._ts) {
    animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
    _setEnd(animation);
    parent._dirty || _uncache(parent, animation);
  }
  return animation;
}, _postAddChecks = function _postAddChecks2(timeline2, child) {
  var t;
  if (child._time || !child._dur && child._initted || child._start < timeline2._time && (child._dur || !child.add)) {
    t = _parentToChildTotalTime(timeline2.rawTime(), child);
    if (!child._dur || _clamp$1(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
      child.render(t, true);
    }
  }
  if (_uncache(timeline2, child)._dp && timeline2._initted && timeline2._time >= timeline2._dur && timeline2._ts) {
    if (timeline2._dur < timeline2.duration()) {
      t = timeline2;
      while (t._dp) {
        t.rawTime() >= 0 && t.totalTime(t._tTime);
        t = t._dp;
      }
    }
    timeline2._zTime = -_tinyNum;
  }
}, _addToTimeline = function _addToTimeline2(timeline2, child, position, skipChecks) {
  child.parent && _removeFromParent(child);
  child._start = _roundPrecise((_isNumber$1(position) ? position : position || timeline2 !== _globalTimeline ? _parsePosition$1(timeline2, position, child) : timeline2._time) + child._delay);
  child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
  _addLinkedListItem(timeline2, child, "_first", "_last", timeline2._sort ? "_start" : 0);
  _isFromOrFromStart(child) || (timeline2._recent = child);
  skipChecks || _postAddChecks(timeline2, child);
  timeline2._ts < 0 && _alignPlayhead(timeline2, timeline2._tTime);
  return timeline2;
}, _scrollTrigger = function _scrollTrigger2(animation, trigger) {
  return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
}, _attemptInitTween = function _attemptInitTween2(tween, time, force, suppressEvents, tTime) {
  _initTween(tween, time, tTime);
  if (!tween._initted) {
    return 1;
  }
  if (!force && tween._pt && !_reverting$1 && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
    _lazyTweens.push(tween);
    tween._lazy = [tTime, suppressEvents];
    return 1;
  }
}, _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart2(_ref) {
  var parent = _ref.parent;
  return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent));
}, _isFromOrFromStart = function _isFromOrFromStart2(_ref2) {
  var data = _ref2.data;
  return data === "isFromStart" || data === "isStart";
}, _renderZeroDurationTween = function _renderZeroDurationTween2(tween, totalTime, suppressEvents, force) {
  var prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0, pt, iteration, prevIteration;
  if (repeatDelay && tween._repeat) {
    tTime = _clamp$1(0, tween._tDur, totalTime);
    iteration = _animationCycle(tTime, repeatDelay);
    tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
    if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
      prevRatio = 1 - ratio;
      tween.vars.repeatRefresh && tween._initted && tween.invalidate();
    }
  }
  if (ratio !== prevRatio || _reverting$1 || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
    if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
      return;
    }
    prevIteration = tween._zTime;
    tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
    suppressEvents || (suppressEvents = totalTime && !prevIteration);
    tween.ratio = ratio;
    tween._from && (ratio = 1 - ratio);
    tween._time = 0;
    tween._tTime = tTime;
    pt = tween._pt;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
    totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
    tween._onUpdate && !suppressEvents && _callback$1(tween, "onUpdate");
    tTime && tween._repeat && !suppressEvents && tween.parent && _callback$1(tween, "onRepeat");
    if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
      ratio && _removeFromParent(tween, 1);
      if (!suppressEvents && !_reverting$1) {
        _callback$1(tween, ratio ? "onComplete" : "onReverseComplete", true);
        tween._prom && tween._prom();
      }
    }
  } else if (!tween._zTime) {
    tween._zTime = totalTime;
  }
}, _findNextPauseTween = function _findNextPauseTween2(animation, prevTime, time) {
  var child;
  if (time > prevTime) {
    child = animation._first;
    while (child && child._start <= time) {
      if (child.data === "isPause" && child._start > prevTime) {
        return child;
      }
      child = child._next;
    }
  } else {
    child = animation._last;
    while (child && child._start >= time) {
      if (child.data === "isPause" && child._start < prevTime) {
        return child;
      }
      child = child._prev;
    }
  }
}, _setDuration = function _setDuration2(animation, duration, skipUncache, leavePlayhead) {
  var repeat = animation._repeat, dur = _roundPrecise(duration) || 0, totalProgress = animation._tTime / animation._tDur;
  totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
  animation._dur = dur;
  animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
  totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
  animation.parent && _setEnd(animation);
  skipUncache || _uncache(animation.parent, animation);
  return animation;
}, _onUpdateTotalDuration = function _onUpdateTotalDuration2(animation) {
  return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
}, _zeroPosition = {
  _start: 0,
  endTime: _emptyFunc,
  totalDuration: _emptyFunc
}, _parsePosition$1 = function _parsePosition2(animation, position, percentAnimation) {
  var labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum$1 ? recent.endTime(false) : animation._dur, i, offset, isPercent;
  if (_isString$1(position) && (isNaN(position) || position in labels)) {
    offset = position.charAt(0);
    isPercent = position.substr(-1) === "%";
    i = position.indexOf("=");
    if (offset === "<" || offset === ">") {
      i >= 0 && (position = position.replace(/=/, ""));
      return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
    }
    if (i < 0) {
      position in labels || (labels[position] = clippedDuration);
      return labels[position];
    }
    offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
    if (isPercent && percentAnimation) {
      offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
    }
    return i > 1 ? _parsePosition2(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
  }
  return position == null ? clippedDuration : +position;
}, _createTweenType = function _createTweenType2(type, params, timeline2) {
  var isLegacy = _isNumber$1(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex], irVars, parent;
  isLegacy && (vars.duration = params[1]);
  vars.parent = timeline2;
  if (type) {
    irVars = vars;
    parent = timeline2;
    while (parent && !("immediateRender" in irVars)) {
      irVars = parent.vars.defaults || {};
      parent = _isNotFalse(parent.vars.inherit) && parent.parent;
    }
    vars.immediateRender = _isNotFalse(irVars.immediateRender);
    type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
  }
  return new Tween(params[0], vars, params[varsIndex + 1]);
}, _conditionalReturn = function _conditionalReturn2(value, func) {
  return value || value === 0 ? func(value) : func;
}, _clamp$1 = function _clamp2(min, max, value) {
  return value < min ? min : value > max ? max : value;
}, getUnit = function getUnit2(value, v) {
  return !_isString$1(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
}, clamp = function clamp2(min, max, value) {
  return _conditionalReturn(value, function(v) {
    return _clamp$1(min, max, v);
  });
}, _slice = [].slice, _isArrayLike = function _isArrayLike2(value, nonEmpty) {
  return value && _isObject$1(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject$1(value[0])) && !value.nodeType && value !== _win$3;
}, _flatten = function _flatten2(ar, leaveStrings, accumulator) {
  if (accumulator === void 0) {
    accumulator = [];
  }
  return ar.forEach(function(value) {
    var _accumulator;
    return _isString$1(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
  }) || accumulator;
}, toArray = function toArray2(value, scope, leaveStrings) {
  return _context$2 && !scope && _context$2.selector ? _context$2.selector(value) : _isString$1(value) && !leaveStrings && (_coreInitted$2 || !_wake()) ? _slice.call((scope || _doc$3).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
}, selector = function selector2(value) {
  value = toArray(value)[0] || _warn("Invalid scope") || {};
  return function(v) {
    var el = value.current || value.nativeElement || value;
    return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc$3.createElement("div") : value);
  };
}, shuffle = function shuffle2(a) {
  return a.sort(function() {
    return 0.5 - Math.random();
  });
}, distribute = function distribute2(v) {
  if (_isFunction$1(v)) {
    return v;
  }
  var vars = _isObject$1(v) ? v : {
    each: v
  }, ease = _parseEase(vars.ease), from = vars.from || 0, base = parseFloat(vars.base) || 0, cache2 = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
  if (_isString$1(from)) {
    ratioX = ratioY = {
      center: 0.5,
      edges: 0.5,
      end: 1
    }[from] || 0;
  } else if (!isDecimal && ratios) {
    ratioX = from[0];
    ratioY = from[1];
  }
  return function(i, target, a) {
    var l = (a || vars).length, distances = cache2[l], originX, originY, x, y, d, j, max, min, wrapAt;
    if (!distances) {
      wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$1])[1];
      if (!wrapAt) {
        max = -_bigNum$1;
        while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {
        }
        wrapAt < l && wrapAt--;
      }
      distances = cache2[l] = [];
      originX = ratios ? Math.min(wrapAt, l) * ratioX - 0.5 : from % wrapAt;
      originY = wrapAt === _bigNum$1 ? 0 : ratios ? l * ratioY / wrapAt - 0.5 : from / wrapAt | 0;
      max = 0;
      min = _bigNum$1;
      for (j = 0; j < l; j++) {
        x = j % wrapAt - originX;
        y = originY - (j / wrapAt | 0);
        distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
        d > max && (max = d);
        d < min && (min = d);
      }
      from === "random" && shuffle(distances);
      distances.max = max - min;
      distances.min = min;
      distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
      distances.b = l < 0 ? base - l : base;
      distances.u = getUnit(vars.amount || vars.each) || 0;
      ease = ease && l < 0 ? _invertEase(ease) : ease;
    }
    l = (distances[i] - distances.min) / distances.max || 0;
    return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u;
  };
}, _roundModifier = function _roundModifier2(v) {
  var p = Math.pow(10, ((v + "").split(".")[1] || "").length);
  return function(raw) {
    var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
    return (n - n % 1) / p + (_isNumber$1(raw) ? 0 : getUnit(raw));
  };
}, snap = function snap2(snapTo, value) {
  var isArray2 = _isArray(snapTo), radius, is2D;
  if (!isArray2 && _isObject$1(snapTo)) {
    radius = isArray2 = snapTo.radius || _bigNum$1;
    if (snapTo.values) {
      snapTo = toArray(snapTo.values);
      if (is2D = !_isNumber$1(snapTo[0])) {
        radius *= radius;
      }
    } else {
      snapTo = _roundModifier(snapTo.increment);
    }
  }
  return _conditionalReturn(value, !isArray2 ? _roundModifier(snapTo) : _isFunction$1(snapTo) ? function(raw) {
    is2D = snapTo(raw);
    return Math.abs(is2D - raw) <= radius ? is2D : raw;
  } : function(raw) {
    var x = parseFloat(is2D ? raw.x : raw), y = parseFloat(is2D ? raw.y : 0), min = _bigNum$1, closest = 0, i = snapTo.length, dx, dy;
    while (i--) {
      if (is2D) {
        dx = snapTo[i].x - x;
        dy = snapTo[i].y - y;
        dx = dx * dx + dy * dy;
      } else {
        dx = Math.abs(snapTo[i] - x);
      }
      if (dx < min) {
        min = dx;
        closest = i;
      }
    }
    closest = !radius || min <= radius ? snapTo[closest] : raw;
    return is2D || closest === raw || _isNumber$1(raw) ? closest : closest + getUnit(raw);
  });
}, random = function random2(min, max, roundingIncrement, returnFunction) {
  return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function() {
    return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * 0.99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
  });
}, pipe = function pipe2() {
  for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }
  return function(value) {
    return functions.reduce(function(v, f) {
      return f(v);
    }, value);
  };
}, unitize = function unitize2(func, unit) {
  return function(value) {
    return func(parseFloat(value)) + (unit || getUnit(value));
  };
}, normalize = function normalize2(min, max, value) {
  return mapRange(min, max, 0, 1, value);
}, _wrapArray = function _wrapArray2(a, wrapper, value) {
  return _conditionalReturn(value, function(index) {
    return a[~~wrapper(index)];
  });
}, wrap = function wrap2(min, max, value) {
  var range = max - min;
  return _isArray(min) ? _wrapArray(min, wrap2(0, min.length), max) : _conditionalReturn(value, function(value2) {
    return (range + (value2 - min) % range) % range + min;
  });
}, wrapYoyo = function wrapYoyo2(min, max, value) {
  var range = max - min, total = range * 2;
  return _isArray(min) ? _wrapArray(min, wrapYoyo2(0, min.length - 1), max) : _conditionalReturn(value, function(value2) {
    value2 = (total + (value2 - min) % total) % total || 0;
    return min + (value2 > range ? total - value2 : value2);
  });
}, _replaceRandom = function _replaceRandom2(s) {
  return s.replace(_randomExp, function(match) {
    var arIndex = match.indexOf("[") + 1, values = match.substring(arIndex || 7, arIndex ? match.indexOf("]") : match.length - 1).split(_commaDelimExp);
    return random(arIndex ? values : +values[0], arIndex ? 0 : +values[1], +values[2] || 1e-5);
  });
}, mapRange = function mapRange2(inMin, inMax, outMin, outMax, value) {
  var inRange = inMax - inMin, outRange = outMax - outMin;
  return _conditionalReturn(value, function(value2) {
    return outMin + ((value2 - inMin) / inRange * outRange || 0);
  });
}, interpolate = function interpolate2(start, end, progress, mutate) {
  var func = isNaN(start + end) ? 0 : function(p2) {
    return (1 - p2) * start + p2 * end;
  };
  if (!func) {
    var isString2 = _isString$1(start), master = {}, p, i, interpolators, l, il;
    progress === true && (mutate = 1) && (progress = null);
    if (isString2) {
      start = {
        p: start
      };
      end = {
        p: end
      };
    } else if (_isArray(start) && !_isArray(end)) {
      interpolators = [];
      l = start.length;
      il = l - 2;
      for (i = 1; i < l; i++) {
        interpolators.push(interpolate2(start[i - 1], start[i]));
      }
      l--;
      func = function func2(p2) {
        p2 *= l;
        var i2 = Math.min(il, ~~p2);
        return interpolators[i2](p2 - i2);
      };
      progress = end;
    } else if (!mutate) {
      start = _merge(_isArray(start) ? [] : {}, start);
    }
    if (!interpolators) {
      for (p in end) {
        _addPropTween.call(master, start, p, "get", end[p]);
      }
      func = function func2(p2) {
        return _renderPropTweens(p2, master) || (isString2 ? start.p : start);
      };
    }
  }
  return _conditionalReturn(progress, func);
}, _getLabelInDirection = function _getLabelInDirection2(timeline2, fromTime, backward) {
  var labels = timeline2.labels, min = _bigNum$1, p, distance, label;
  for (p in labels) {
    distance = labels[p] - fromTime;
    if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
      label = p;
      min = distance;
    }
  }
  return label;
}, _callback$1 = function _callback2(animation, type, executeLazyFirst) {
  var v = animation.vars, callback = v[type], prevContext = _context$2, context3 = animation._ctx, params, scope, result;
  if (!callback) {
    return;
  }
  params = v[type + "Params"];
  scope = v.callbackScope || animation;
  executeLazyFirst && _lazyTweens.length && _lazyRender();
  context3 && (_context$2 = context3);
  result = params ? callback.apply(scope, params) : callback.call(scope);
  _context$2 = prevContext;
  return result;
}, _interrupt = function _interrupt2(animation) {
  _removeFromParent(animation);
  animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting$1);
  animation.progress() < 1 && _callback$1(animation, "onInterrupt");
  return animation;
}, _quickTween, _registerPluginQueue = [], _createPlugin = function _createPlugin2(config3) {
  if (!config3) return;
  config3 = !config3.name && config3["default"] || config3;
  if (_windowExists$2() || config3.headless) {
    var name = config3.name, isFunc = _isFunction$1(config3), Plugin = name && !isFunc && config3.init ? function() {
      this._props = [];
    } : config3, instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    }, statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };
    _wake();
    if (config3 !== Plugin) {
      if (_plugins[name]) {
        return;
      }
      _setDefaults$1(Plugin, _setDefaults$1(_copyExcluding(config3, instanceDefaults), statics));
      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config3, statics)));
      _plugins[Plugin.prop = name] = Plugin;
      if (config3.targetTest) {
        _harnessPlugins.push(Plugin);
        _reservedProps[name] = 1;
      }
      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
    }
    _addGlobal(name, Plugin);
    config3.register && config3.register(gsap$2, Plugin, PropTween);
  } else {
    _registerPluginQueue.push(config3);
  }
}, _255 = 255, _colorLookup = {
  aqua: [0, _255, _255],
  lime: [0, _255, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, _255],
  navy: [0, 0, 128],
  white: [_255, _255, _255],
  olive: [128, 128, 0],
  yellow: [_255, _255, 0],
  orange: [_255, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [_255, 0, 0],
  pink: [_255, 192, 203],
  cyan: [0, _255, _255],
  transparent: [_255, _255, _255, 0]
}, _hue = function _hue2(h, m1, m2) {
  h += h < 0 ? 1 : h > 1 ? -1 : 0;
  return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < 0.5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + 0.5 | 0;
}, splitColor = function splitColor2(v, toHSL, forceAlpha) {
  var a = !v ? _colorLookup.black : _isNumber$1(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0, r, g, b, h, s, l, max, min, d, wasHSL;
  if (!a) {
    if (v.substr(-1) === ",") {
      v = v.substr(0, v.length - 1);
    }
    if (_colorLookup[v]) {
      a = _colorLookup[v];
    } else if (v.charAt(0) === "#") {
      if (v.length < 6) {
        r = v.charAt(1);
        g = v.charAt(2);
        b = v.charAt(3);
        v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
      }
      if (v.length === 9) {
        a = parseInt(v.substr(1, 6), 16);
        return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
      }
      v = parseInt(v.substr(1), 16);
      a = [v >> 16, v >> 8 & _255, v & _255];
    } else if (v.substr(0, 3) === "hsl") {
      a = wasHSL = v.match(_strictNumExp);
      if (!toHSL) {
        h = +a[0] % 360 / 360;
        s = +a[1] / 100;
        l = +a[2] / 100;
        g = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        r = l * 2 - g;
        a.length > 3 && (a[3] *= 1);
        a[0] = _hue(h + 1 / 3, r, g);
        a[1] = _hue(h, r, g);
        a[2] = _hue(h - 1 / 3, r, g);
      } else if (~v.indexOf("=")) {
        a = v.match(_numExp);
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }
    } else {
      a = v.match(_strictNumExp) || _colorLookup.transparent;
    }
    a = a.map(Number);
  }
  if (toHSL && !wasHSL) {
    r = a[0] / _255;
    g = a[1] / _255;
    b = a[2] / _255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    a[0] = ~~(h + 0.5);
    a[1] = ~~(s * 100 + 0.5);
    a[2] = ~~(l * 100 + 0.5);
  }
  forceAlpha && a.length < 4 && (a[3] = 1);
  return a;
}, _colorOrderData = function _colorOrderData2(v) {
  var values = [], c = [], i = -1;
  v.split(_colorExp).forEach(function(v2) {
    var a = v2.match(_numWithUnitExp) || [];
    values.push.apply(values, a);
    c.push(i += a.length + 1);
  });
  values.c = c;
  return values;
}, _formatColors = function _formatColors2(s, toHSL, orderMatchData) {
  var result = "", colors = (s + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i = 0, c, shell, d, l;
  if (!colors) {
    return s;
  }
  colors = colors.map(function(color) {
    return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
  });
  if (orderMatchData) {
    d = _colorOrderData(s);
    c = orderMatchData.c;
    if (c.join(result) !== d.c.join(result)) {
      shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
      l = shell.length - 1;
      for (; i < l; i++) {
        result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
      }
    }
  }
  if (!shell) {
    shell = s.split(_colorExp);
    l = shell.length - 1;
    for (; i < l; i++) {
      result += shell[i] + colors[i];
    }
  }
  return result + shell[l];
}, _colorExp = (function() {
  var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", p;
  for (p in _colorLookup) {
    s += "|" + p + "\\b";
  }
  return new RegExp(s + ")", "gi");
})(), _hslExp = /hsl[a]?\(/, _colorStringFilter = function _colorStringFilter2(a) {
  var combined = a.join(" "), toHSL;
  _colorExp.lastIndex = 0;
  if (_colorExp.test(combined)) {
    toHSL = _hslExp.test(combined);
    a[1] = _formatColors(a[1], toHSL);
    a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
    return true;
  }
}, _tickerActive, _ticker = (function() {
  var _getTime2 = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime2(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners2 = [], _id, _req, _raf, _self, _delta, _i2, _tick = function _tick2(v) {
    var elapsed = _getTime2() - _lastUpdate, manual = v === true, overlap, dispatch, time, frame;
    (elapsed > _lagThreshold || elapsed < 0) && (_startTime += elapsed - _adjustedLag);
    _lastUpdate += elapsed;
    time = _lastUpdate - _startTime;
    overlap = time - _nextTime;
    if (overlap > 0 || manual) {
      frame = ++_self.frame;
      _delta = time - _self.time * 1e3;
      _self.time = time = time / 1e3;
      _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
      dispatch = 1;
    }
    manual || (_id = _req(_tick2));
    if (dispatch) {
      for (_i2 = 0; _i2 < _listeners2.length; _i2++) {
        _listeners2[_i2](time, _delta, frame, v);
      }
    }
  };
  _self = {
    time: 0,
    frame: 0,
    tick: function tick() {
      _tick(true);
    },
    deltaRatio: function deltaRatio(fps) {
      return _delta / (1e3 / (fps || 60));
    },
    wake: function wake() {
      if (_coreReady) {
        if (!_coreInitted$2 && _windowExists$2()) {
          _win$3 = _coreInitted$2 = window;
          _doc$3 = _win$3.document || {};
          _globals.gsap = gsap$2;
          (_win$3.gsapVersions || (_win$3.gsapVersions = [])).push(gsap$2.version);
          _install(_installScope || _win$3.GreenSockGlobals || !_win$3.gsap && _win$3 || {});
          _registerPluginQueue.forEach(_createPlugin);
        }
        _raf = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame;
        _id && _self.sleep();
        _req = _raf || function(f) {
          return setTimeout(f, _nextTime - _self.time * 1e3 + 1 | 0);
        };
        _tickerActive = 1;
        _tick(2);
      }
    },
    sleep: function sleep() {
      (_raf ? cancelAnimationFrame : clearTimeout)(_id);
      _tickerActive = 0;
      _req = _emptyFunc;
    },
    lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
      _lagThreshold = threshold || Infinity;
      _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
    },
    fps: function fps(_fps) {
      _gap = 1e3 / (_fps || 240);
      _nextTime = _self.time * 1e3 + _gap;
    },
    add: function add(callback, once, prioritize) {
      var func = once ? function(t, d, f, v) {
        callback(t, d, f, v);
        _self.remove(func);
      } : callback;
      _self.remove(callback);
      _listeners2[prioritize ? "unshift" : "push"](func);
      _wake();
      return func;
    },
    remove: function remove2(callback, i) {
      ~(i = _listeners2.indexOf(callback)) && _listeners2.splice(i, 1) && _i2 >= i && _i2--;
    },
    _listeners: _listeners2
  };
  return _self;
})(), _wake = function _wake2() {
  return !_tickerActive && _ticker.wake();
}, _easeMap = {}, _customEaseExp = /^[\d.\-M][\d.\-,\s]/, _quotesExp = /["']/g, _parseObjectInString = function _parseObjectInString2(value) {
  var obj = {}, split2 = value.substr(1, value.length - 3).split(":"), key = split2[0], i = 1, l = split2.length, index, val, parsedVal;
  for (; i < l; i++) {
    val = split2[i];
    index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
    parsedVal = val.substr(0, index);
    obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
    key = val.substr(index + 1).trim();
  }
  return obj;
}, _valueInParentheses = function _valueInParentheses2(value) {
  var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
  return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
}, _configEaseFromString = function _configEaseFromString2(name) {
  var split2 = (name + "").split("("), ease = _easeMap[split2[0]];
  return ease && split2.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split2[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
}, _invertEase = function _invertEase2(ease) {
  return function(p) {
    return 1 - ease(1 - p);
  };
}, _propagateYoyoEase = function _propagateYoyoEase2(timeline2, isYoyo) {
  var child = timeline2._first, ease;
  while (child) {
    if (child instanceof Timeline) {
      _propagateYoyoEase2(child, isYoyo);
    } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
      if (child.timeline) {
        _propagateYoyoEase2(child.timeline, isYoyo);
      } else {
        ease = child._ease;
        child._ease = child._yEase;
        child._yEase = ease;
        child._yoyo = isYoyo;
      }
    }
    child = child._next;
  }
}, _parseEase = function _parseEase2(ease, defaultEase) {
  return !ease ? defaultEase : (_isFunction$1(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
}, _insertEase = function _insertEase2(names, easeIn, easeOut, easeInOut) {
  if (easeOut === void 0) {
    easeOut = function easeOut2(p) {
      return 1 - easeIn(1 - p);
    };
  }
  if (easeInOut === void 0) {
    easeInOut = function easeInOut2(p) {
      return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
    };
  }
  var ease = {
    easeIn,
    easeOut,
    easeInOut
  }, lowercaseName;
  _forEachName(names, function(name) {
    _easeMap[name] = _globals[name] = ease;
    _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
    for (var p in ease) {
      _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
    }
  });
  return ease;
}, _easeInOutFromOut = function _easeInOutFromOut2(easeOut) {
  return function(p) {
    return p < 0.5 ? (1 - easeOut(1 - p * 2)) / 2 : 0.5 + easeOut((p - 0.5) * 2) / 2;
  };
}, _configElastic = function _configElastic2(type, amplitude, period) {
  var p1 = amplitude >= 1 ? amplitude : 1, p2 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1), p3 = p2 / _2PI * (Math.asin(1 / p1) || 0), easeOut = function easeOut2(p) {
    return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
  }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);
  p2 = _2PI / p2;
  ease.config = function(amplitude2, period2) {
    return _configElastic2(type, amplitude2, period2);
  };
  return ease;
}, _configBack = function _configBack2(type, overshoot) {
  if (overshoot === void 0) {
    overshoot = 1.70158;
  }
  var easeOut = function easeOut2(p) {
    return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
  }, ease = type === "out" ? easeOut : type === "in" ? function(p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);
  ease.config = function(overshoot2) {
    return _configBack2(type, overshoot2);
  };
  return ease;
};
_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function(name, i) {
  var power = i < 5 ? i + 1 : i;
  _insertEase(name + ",Power" + (power - 1), i ? function(p) {
    return Math.pow(p, power);
  } : function(p) {
    return p;
  }, function(p) {
    return 1 - Math.pow(1 - p, power);
  }, function(p) {
    return p < 0.5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
  });
});
_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
(function(n, c) {
  var n1 = 1 / c, n2 = 2 * n1, n3 = 2.5 * n1, easeOut = function easeOut2(p) {
    return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + 0.75 : p < n3 ? n * (p -= 2.25 / c) * p + 0.9375 : n * Math.pow(p - 2.625 / c, 2) + 0.984375;
  };
  _insertEase("Bounce", function(p) {
    return 1 - easeOut(1 - p);
  }, easeOut);
})(7.5625, 2.75);
_insertEase("Expo", function(p) {
  return Math.pow(2, 10 * (p - 1)) * p + p * p * p * p * p * p * (1 - p);
});
_insertEase("Circ", function(p) {
  return -(_sqrt(1 - p * p) - 1);
});
_insertEase("Sine", function(p) {
  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
});
_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
  config: function config(steps, immediateStart) {
    if (steps === void 0) {
      steps = 1;
    }
    var p1 = 1 / steps, p2 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max = 1 - _tinyNum;
    return function(p) {
      return ((p2 * _clamp$1(0, max, p) | 0) + p3) * p1;
    };
  }
};
_defaults$1.ease = _easeMap["quad.out"];
_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(name) {
  return _callbackNames += name + "," + name + "Params,";
});
var GSCache = function GSCache2(target, harness) {
  this.id = _gsID++;
  target._gsap = this;
  this.target = target;
  this.harness = harness;
  this.get = harness ? harness.get : _getProperty;
  this.set = harness ? harness.getSetter : _getSetter;
};
var Animation = /* @__PURE__ */ (function() {
  function Animation2(vars) {
    this.vars = vars;
    this._delay = +vars.delay || 0;
    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
      this._rDelay = vars.repeatDelay || 0;
      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
    }
    this._ts = 1;
    _setDuration(this, +vars.duration, 1, 1);
    this.data = vars.data;
    if (_context$2) {
      this._ctx = _context$2;
      _context$2.data.push(this);
    }
    _tickerActive || _ticker.wake();
  }
  var _proto = Animation2.prototype;
  _proto.delay = function delay(value) {
    if (value || value === 0) {
      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
      this._delay = value;
      return this;
    }
    return this._delay;
  };
  _proto.duration = function duration(value) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
  };
  _proto.totalDuration = function totalDuration(value) {
    if (!arguments.length) {
      return this._tDur;
    }
    this._dirty = 0;
    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
  };
  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
    _wake();
    if (!arguments.length) {
      return this._tTime;
    }
    var parent = this._dp;
    if (parent && parent.smoothChildTiming && this._ts) {
      _alignPlayhead(this, _totalTime);
      !parent._dp || parent.parent || _postAddChecks(parent, this);
      while (parent && parent.parent) {
        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
          parent.totalTime(parent._tTime, true);
        }
        parent = parent.parent;
      }
      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
        _addToTimeline(this._dp, this, this._start - this._delay);
      }
    }
    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !this._initted && this._dur && _totalTime || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
      this._ts || (this._pTime = _totalTime);
      _lazySafeRender(this, _totalTime, suppressEvents);
    }
    return this;
  };
  _proto.time = function time(value, suppressEvents) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
  };
  _proto.totalProgress = function totalProgress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  };
  _proto.progress = function progress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  };
  _proto.iteration = function iteration(value, suppressEvents) {
    var cycleDuration = this.duration() + this._rDelay;
    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
  };
  _proto.timeScale = function timeScale(value, suppressEvents) {
    if (!arguments.length) {
      return this._rts === -_tinyNum ? 0 : this._rts;
    }
    if (this._rts === value) {
      return this;
    }
    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
    this._rts = +value || 0;
    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
    this.totalTime(_clamp$1(-Math.abs(this._delay), this.totalDuration(), tTime), suppressEvents !== false);
    _setEnd(this);
    return _recacheAncestors(this);
  };
  _proto.paused = function paused(value) {
    if (!arguments.length) {
      return this._ps;
    }
    if (this._ps !== value) {
      this._ps = value;
      if (value) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
        this._ts = this._act = 0;
      } else {
        _wake();
        this._ts = this._rts;
        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
      }
    }
    return this;
  };
  _proto.startTime = function startTime(value) {
    if (arguments.length) {
      this._start = _roundPrecise(value);
      var parent = this.parent || this._dp;
      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, this._start - this._delay);
      return this;
    }
    return this._start;
  };
  _proto.endTime = function endTime(includeRepeats) {
    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  };
  _proto.rawTime = function rawTime(wrapRepeats) {
    var parent = this.parent || this._dp;
    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
  };
  _proto.revert = function revert(config3) {
    if (config3 === void 0) {
      config3 = _revertConfig;
    }
    var prevIsReverting = _reverting$1;
    _reverting$1 = config3;
    if (_isRevertWorthy(this)) {
      this.timeline && this.timeline.revert(config3);
      this.totalTime(-0.01, config3.suppressEvents);
    }
    this.data !== "nested" && config3.kill !== false && this.kill();
    _reverting$1 = prevIsReverting;
    return this;
  };
  _proto.globalTime = function globalTime(rawTime) {
    var animation = this, time = arguments.length ? rawTime : animation.rawTime();
    while (animation) {
      time = animation._start + time / (Math.abs(animation._ts) || 1);
      animation = animation._dp;
    }
    return !this.parent && this._sat ? this._sat.globalTime(rawTime) : time;
  };
  _proto.repeat = function repeat(value) {
    if (arguments.length) {
      this._repeat = value === Infinity ? -2 : value;
      return _onUpdateTotalDuration(this);
    }
    return this._repeat === -2 ? Infinity : this._repeat;
  };
  _proto.repeatDelay = function repeatDelay(value) {
    if (arguments.length) {
      var time = this._time;
      this._rDelay = value;
      _onUpdateTotalDuration(this);
      return time ? this.time(time) : this;
    }
    return this._rDelay;
  };
  _proto.yoyo = function yoyo(value) {
    if (arguments.length) {
      this._yoyo = value;
      return this;
    }
    return this._yoyo;
  };
  _proto.seek = function seek(position, suppressEvents) {
    return this.totalTime(_parsePosition$1(this, position), _isNotFalse(suppressEvents));
  };
  _proto.restart = function restart(includeDelay, suppressEvents) {
    this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
    this._dur || (this._zTime = -_tinyNum);
    return this;
  };
  _proto.play = function play(from, suppressEvents) {
    from != null && this.seek(from, suppressEvents);
    return this.reversed(false).paused(false);
  };
  _proto.reverse = function reverse(from, suppressEvents) {
    from != null && this.seek(from || this.totalDuration(), suppressEvents);
    return this.reversed(true).paused(false);
  };
  _proto.pause = function pause(atTime, suppressEvents) {
    atTime != null && this.seek(atTime, suppressEvents);
    return this.paused(true);
  };
  _proto.resume = function resume() {
    return this.paused(false);
  };
  _proto.reversed = function reversed(value) {
    if (arguments.length) {
      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
      return this;
    }
    return this._rts < 0;
  };
  _proto.invalidate = function invalidate() {
    this._initted = this._act = 0;
    this._zTime = -_tinyNum;
    return this;
  };
  _proto.isActive = function isActive() {
    var parent = this.parent || this._dp, start = this._start, rawTime;
    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
  };
  _proto.eventCallback = function eventCallback(type, callback, params) {
    var vars = this.vars;
    if (arguments.length > 1) {
      if (!callback) {
        delete vars[type];
      } else {
        vars[type] = callback;
        params && (vars[type + "Params"] = params);
        type === "onUpdate" && (this._onUpdate = callback);
      }
      return this;
    }
    return vars[type];
  };
  _proto.then = function then(onFulfilled) {
    var self2 = this, prevProm = self2._prom;
    return new Promise(function(resolve) {
      var f = _isFunction$1(onFulfilled) ? onFulfilled : _passThrough$1, _resolve = function _resolve2() {
        var _then = self2.then;
        self2.then = null;
        prevProm && prevProm();
        _isFunction$1(f) && (f = f(self2)) && (f.then || f === self2) && (self2.then = _then);
        resolve(f);
        self2.then = _then;
      };
      if (self2._initted && self2.totalProgress() === 1 && self2._ts >= 0 || !self2._tTime && self2._ts < 0) {
        _resolve();
      } else {
        self2._prom = _resolve;
      }
    });
  };
  _proto.kill = function kill() {
    _interrupt(this);
  };
  return Animation2;
})();
_setDefaults$1(Animation.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -_tinyNum,
  _prom: 0,
  _ps: false,
  _rts: 1
});
var Timeline = /* @__PURE__ */ (function(_Animation) {
  _inheritsLoose(Timeline2, _Animation);
  function Timeline2(vars, position) {
    var _this;
    if (vars === void 0) {
      vars = {};
    }
    _this = _Animation.call(this, vars) || this;
    _this.labels = {};
    _this.smoothChildTiming = !!vars.smoothChildTiming;
    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
    _this._sort = _isNotFalse(vars.sortChildren);
    _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
    vars.reversed && _this.reverse();
    vars.paused && _this.paused(true);
    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
    return _this;
  }
  var _proto2 = Timeline2.prototype;
  _proto2.to = function to(targets, vars, position) {
    _createTweenType(0, arguments, this);
    return this;
  };
  _proto2.from = function from(targets, vars, position) {
    _createTweenType(1, arguments, this);
    return this;
  };
  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
    _createTweenType(2, arguments, this);
    return this;
  };
  _proto2.set = function set2(targets, vars, position) {
    vars.duration = 0;
    vars.parent = this;
    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
    vars.immediateRender = !!vars.immediateRender;
    new Tween(targets, vars, _parsePosition$1(this, position), 1);
    return this;
  };
  _proto2.call = function call(callback, params, position) {
    return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
  };
  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.duration = duration;
    vars.stagger = vars.stagger || stagger;
    vars.onComplete = onCompleteAll;
    vars.onCompleteParams = onCompleteAllParams;
    vars.parent = this;
    new Tween(targets, vars, _parsePosition$1(this, position));
    return this;
  };
  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.runBackwards = 1;
    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
  };
  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
    toVars.startAt = fromVars;
    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
  };
  _proto2.render = function render22(totalTime, suppressEvents, force) {
    var prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime), crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur), time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo;
    this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
    if (tTime !== this._tTime || force || crossingStart) {
      if (prevTime !== this._time && dur) {
        tTime += this._time - prevTime;
        totalTime += this._time - prevTime;
      }
      time = tTime;
      prevStart = this._start;
      timeScale = this._ts;
      prevPaused = !timeScale;
      if (crossingStart) {
        dur || (prevTime = this._zTime);
        (totalTime || !suppressEvents) && (this._zTime = totalTime);
      }
      if (this._repeat) {
        yoyo = this._yoyo;
        cycleDuration = dur + this._rDelay;
        if (this._repeat < -1 && totalTime < 0) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }
        time = _roundPrecise(tTime % cycleDuration);
        if (tTime === tDur) {
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration);
          iteration = ~~prevIteration;
          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          }
          time > dur && (time = dur);
        }
        prevIteration = _animationCycle(this._tTime, cycleDuration);
        !prevTime && this._tTime && prevIteration !== iteration && this._tTime - prevIteration * cycleDuration - this._dur <= 0 && (prevIteration = iteration);
        if (yoyo && iteration & 1) {
          time = dur - time;
          isYoyo = 1;
        }
        if (iteration !== prevIteration && !this._lock) {
          var rewinding = yoyo && prevIteration & 1, doesWrap = rewinding === (yoyo && iteration & 1);
          iteration < prevIteration && (rewinding = !rewinding);
          prevTime = rewinding ? 0 : tTime % dur ? dur : tTime;
          this._lock = 1;
          this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
          this._tTime = tTime;
          !suppressEvents && this.parent && _callback$1(this, "onRepeat");
          if (this.vars.repeatRefresh && !isYoyo) {
            this.invalidate()._lock = 1;
            prevIteration = iteration;
          }
          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
            return this;
          }
          dur = this._dur;
          tDur = this._tDur;
          if (doesWrap) {
            this._lock = 2;
            prevTime = rewinding ? dur : -1e-4;
            this.render(prevTime, true);
            this.vars.repeatRefresh && !isYoyo && this.invalidate();
          }
          this._lock = 0;
          if (!this._ts && !prevPaused) {
            return this;
          }
          _propagateYoyoEase(this, isYoyo);
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2) {
        pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
        if (pauseTween) {
          tTime -= time - (time = pauseTween._start);
        }
      }
      this._tTime = tTime;
      this._time = time;
      this._act = !timeScale;
      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = totalTime;
        prevTime = 0;
      }
      if (!prevTime && tTime && dur && !suppressEvents && !prevIteration) {
        _callback$1(this, "onStart");
        if (this._tTime !== tTime) {
          return this;
        }
      }
      if (time >= prevTime && totalTime >= 0) {
        child = this._first;
        while (child) {
          next = child._next;
          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              return this.render(totalTime, suppressEvents, force);
            }
            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
            if (time !== this._time || !this._ts && !prevPaused) {
              pauseTween = 0;
              next && (tTime += this._zTime = -_tinyNum);
              break;
            }
          }
          child = next;
        }
      } else {
        child = this._last;
        var adjustedTime = totalTime < 0 ? totalTime : time;
        while (child) {
          next = child._prev;
          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              return this.render(totalTime, suppressEvents, force);
            }
            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting$1 && _isRevertWorthy(child));
            if (time !== this._time || !this._ts && !prevPaused) {
              pauseTween = 0;
              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
              break;
            }
          }
          child = next;
        }
      }
      if (pauseTween && !suppressEvents) {
        this.pause();
        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
        if (this._ts) {
          this._start = prevStart;
          _setEnd(this);
          return this.render(totalTime, suppressEvents, force);
        }
      }
      this._onUpdate && !suppressEvents && _callback$1(this, "onUpdate", true);
      if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) {
        if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) {
          if (!this._lock) {
            (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
              _callback$1(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }
      }
    }
    return this;
  };
  _proto2.add = function add(child, position) {
    var _this2 = this;
    _isNumber$1(position) || (position = _parsePosition$1(this, position, child));
    if (!(child instanceof Animation)) {
      if (_isArray(child)) {
        child.forEach(function(obj) {
          return _this2.add(obj, position);
        });
        return this;
      }
      if (_isString$1(child)) {
        return this.addLabel(child, position);
      }
      if (_isFunction$1(child)) {
        child = Tween.delayedCall(0, child);
      } else {
        return this;
      }
    }
    return this !== child ? _addToTimeline(this, child, position) : this;
  };
  _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
    if (nested === void 0) {
      nested = true;
    }
    if (tweens === void 0) {
      tweens = true;
    }
    if (timelines === void 0) {
      timelines = true;
    }
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = -_bigNum$1;
    }
    var a = [], child = this._first;
    while (child) {
      if (child._start >= ignoreBeforeTime) {
        if (child instanceof Tween) {
          tweens && a.push(child);
        } else {
          timelines && a.push(child);
          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
        }
      }
      child = child._next;
    }
    return a;
  };
  _proto2.getById = function getById2(id) {
    var animations = this.getChildren(1, 1, 1), i = animations.length;
    while (i--) {
      if (animations[i].vars.id === id) {
        return animations[i];
      }
    }
  };
  _proto2.remove = function remove2(child) {
    if (_isString$1(child)) {
      return this.removeLabel(child);
    }
    if (_isFunction$1(child)) {
      return this.killTweensOf(child);
    }
    child.parent === this && _removeLinkedListItem(this, child);
    if (child === this._recent) {
      this._recent = this._last;
    }
    return _uncache(this);
  };
  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
    if (!arguments.length) {
      return this._tTime;
    }
    this._forcing = 1;
    if (!this._dp && this._ts) {
      this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
    }
    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
    this._forcing = 0;
    return this;
  };
  _proto2.addLabel = function addLabel(label, position) {
    this.labels[label] = _parsePosition$1(this, position);
    return this;
  };
  _proto2.removeLabel = function removeLabel(label) {
    delete this.labels[label];
    return this;
  };
  _proto2.addPause = function addPause(position, callback, params) {
    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
    t.data = "isPause";
    this._hasPause = 1;
    return _addToTimeline(this, t, _parsePosition$1(this, position));
  };
  _proto2.removePause = function removePause(position) {
    var child = this._first;
    position = _parsePosition$1(this, position);
    while (child) {
      if (child._start === position && child.data === "isPause") {
        _removeFromParent(child);
      }
      child = child._next;
    }
  };
  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    var tweens = this.getTweensOf(targets, onlyActive), i = tweens.length;
    while (i--) {
      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
    }
    return this;
  };
  _proto2.getTweensOf = function getTweensOf2(targets, onlyActive) {
    var a = [], parsedTargets = toArray(targets), child = this._first, isGlobalTime = _isNumber$1(onlyActive), children;
    while (child) {
      if (child instanceof Tween) {
        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
          a.push(child);
        }
      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
        a.push.apply(a, children);
      }
      child = child._next;
    }
    return a;
  };
  _proto2.tweenTo = function tweenTo(position, vars) {
    vars = vars || {};
    var tl = this, endTime = _parsePosition$1(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, initted, tween = Tween.to(tl, _setDefaults$1({
      ease: vars.ease || "none",
      lazy: false,
      immediateRender: false,
      time: endTime,
      overwrite: "auto",
      duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
      onStart: function onStart() {
        tl.pause();
        if (!initted) {
          var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
          tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
          initted = 1;
        }
        _onStart && _onStart.apply(tween, onStartParams || []);
      }
    }, vars));
    return immediateRender ? tween.render(0) : tween;
  };
  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
    return this.tweenTo(toPosition, _setDefaults$1({
      startAt: {
        time: _parsePosition$1(this, fromPosition)
      }
    }, vars));
  };
  _proto2.recent = function recent() {
    return this._recent;
  };
  _proto2.nextLabel = function nextLabel(afterTime) {
    if (afterTime === void 0) {
      afterTime = this._time;
    }
    return _getLabelInDirection(this, _parsePosition$1(this, afterTime));
  };
  _proto2.previousLabel = function previousLabel(beforeTime) {
    if (beforeTime === void 0) {
      beforeTime = this._time;
    }
    return _getLabelInDirection(this, _parsePosition$1(this, beforeTime), 1);
  };
  _proto2.currentLabel = function currentLabel(value) {
    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
  };
  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = 0;
    }
    var child = this._first, labels = this.labels, p;
    amount = _roundPrecise(amount);
    while (child) {
      if (child._start >= ignoreBeforeTime) {
        child._start += amount;
        child._end += amount;
      }
      child = child._next;
    }
    if (adjustLabels) {
      for (p in labels) {
        if (labels[p] >= ignoreBeforeTime) {
          labels[p] += amount;
        }
      }
    }
    return _uncache(this);
  };
  _proto2.invalidate = function invalidate(soft) {
    var child = this._first;
    this._lock = 0;
    while (child) {
      child.invalidate(soft);
      child = child._next;
    }
    return _Animation.prototype.invalidate.call(this, soft);
  };
  _proto2.clear = function clear2(includeLabels) {
    if (includeLabels === void 0) {
      includeLabels = true;
    }
    var child = this._first, next;
    while (child) {
      next = child._next;
      this.remove(child);
      child = next;
    }
    this._dp && (this._time = this._tTime = this._pTime = 0);
    includeLabels && (this.labels = {});
    return _uncache(this);
  };
  _proto2.totalDuration = function totalDuration(value) {
    var max = 0, self2 = this, child = self2._last, prevStart = _bigNum$1, prev, start, parent;
    if (arguments.length) {
      return self2.timeScale((self2._repeat < 0 ? self2.duration() : self2.totalDuration()) / (self2.reversed() ? -value : value));
    }
    if (self2._dirty) {
      parent = self2.parent;
      while (child) {
        prev = child._prev;
        child._dirty && child.totalDuration();
        start = child._start;
        if (start > prevStart && self2._sort && child._ts && !self2._lock) {
          self2._lock = 1;
          _addToTimeline(self2, child, start - child._delay, 1)._lock = 0;
        } else {
          prevStart = start;
        }
        if (start < 0 && child._ts) {
          max -= start;
          if (!parent && !self2._dp || parent && parent.smoothChildTiming) {
            self2._start += _roundPrecise(start / self2._ts);
            self2._time -= start;
            self2._tTime -= start;
          }
          self2.shiftChildren(-start, false, -Infinity);
          prevStart = 0;
        }
        child._end > max && child._ts && (max = child._end);
        child = prev;
      }
      _setDuration(self2, self2 === _globalTimeline && self2._time > max ? self2._time : max, 1, 1);
      self2._dirty = 0;
    }
    return self2._tDur;
  };
  Timeline2.updateRoot = function updateRoot(time) {
    if (_globalTimeline._ts) {
      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
      _lastRenderedFrame = _ticker.frame;
    }
    if (_ticker.frame >= _nextGCFrame) {
      _nextGCFrame += _config.autoSleep || 120;
      var child = _globalTimeline._first;
      if (!child || !child._ts) {
        if (_config.autoSleep && _ticker._listeners.length < 2) {
          while (child && !child._ts) {
            child = child._next;
          }
          child || _ticker.sleep();
        }
      }
    }
  };
  return Timeline2;
})(Animation);
_setDefaults$1(Timeline.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});
var _addComplexStringPropTween = function _addComplexStringPropTween2(target, prop, start, end, setter, stringFilter, funcParam) {
  var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index = 0, matchIndex = 0, result, startNums, color, endNum, chunk, startNum, hasRandom, a;
  pt.b = start;
  pt.e = end;
  start += "";
  end += "";
  if (hasRandom = ~end.indexOf("random(")) {
    end = _replaceRandom(end);
  }
  if (stringFilter) {
    a = [start, end];
    stringFilter(a, target, prop);
    start = a[0];
    end = a[1];
  }
  startNums = start.match(_complexStringNumExp) || [];
  while (result = _complexStringNumExp.exec(end)) {
    endNum = result[0];
    chunk = end.substring(index, result.index);
    if (color) {
      color = (color + 1) % 5;
    } else if (chunk.substr(-5) === "rgba(") {
      color = 1;
    }
    if (endNum !== startNums[matchIndex++]) {
      startNum = parseFloat(startNums[matchIndex - 1]) || 0;
      pt._pt = {
        _next: pt._pt,
        p: chunk || matchIndex === 1 ? chunk : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: startNum,
        c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
        m: color && color < 4 ? Math.round : 0
      };
      index = _complexStringNumExp.lastIndex;
    }
  }
  pt.c = index < end.length ? end.substring(index, end.length) : "";
  pt.fp = funcParam;
  if (_relExp.test(end) || hasRandom) {
    pt.e = 0;
  }
  this._pt = pt;
  return pt;
}, _addPropTween = function _addPropTween2(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
  _isFunction$1(end) && (end = end(index || 0, target, targets));
  var currentValue = target[prop], parsedStart = start !== "get" ? start : !_isFunction$1(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction$1(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction$1(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc, pt;
  if (_isString$1(end)) {
    if (~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }
    if (end.charAt(1) === "=") {
      pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);
      if (pt || pt === 0) {
        end = pt;
      }
    }
  }
  if (!optional || parsedStart !== end || _forceAllPropTweens) {
    if (!isNaN(parsedStart * end) && end !== "") {
      pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
      funcParam && (pt.fp = funcParam);
      modifier && pt.modifier(modifier, this, target);
      return this._pt = pt;
    }
    !currentValue && !(prop in target) && _missingPlugin(prop, end);
    return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
  }
}, _processVars = function _processVars2(vars, index, target, targets, tween) {
  _isFunction$1(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
  if (!_isObject$1(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
    return _isString$1(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
  }
  var copy = {}, p;
  for (p in vars) {
    copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
  }
  return copy;
}, _checkPlugin = function _checkPlugin2(property, vars, tween, index, target, targets) {
  var plugin, pt, ptLookup, i;
  if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
    tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
    if (tween !== _quickTween) {
      ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
      i = plugin._props.length;
      while (i--) {
        ptLookup[plugin._props[i]] = pt;
      }
    }
  }
  return plugin;
}, _overwritingTween, _forceAllPropTweens, _initTween = function _initTween2(tween, time, tTime) {
  var vars = tween.vars, ease = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets, autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites$1, tl = tween.timeline, cleanVars, i, p, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index, harnessVars, overwritten;
  tl && (!keyframes || !ease) && (ease = "none");
  tween._ease = _parseEase(ease, _defaults$1.ease);
  tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults$1.ease)) : 0;
  if (yoyoEase && tween._yoyo && !tween._repeat) {
    yoyoEase = tween._yEase;
    tween._yEase = tween._ease;
    tween._ease = yoyoEase;
  }
  tween._from = !tl && !!vars.runBackwards;
  if (!tl || keyframes && !vars.stagger) {
    harness = targets[0] ? _getCache(targets[0]).harness : 0;
    harnessVars = harness && vars[harness.prop];
    cleanVars = _copyExcluding(vars, _reservedProps);
    if (prevStartAt) {
      prevStartAt._zTime < 0 && prevStartAt.progress(1);
      time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig);
      prevStartAt._lazy = 0;
    }
    if (startAt) {
      _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults$1({
        data: "isStart",
        overwrite: false,
        parent,
        immediateRender: true,
        lazy: !prevStartAt && _isNotFalse(lazy),
        startAt: null,
        delay: 0,
        onUpdate: onUpdate && function() {
          return _callback$1(tween, "onUpdate");
        },
        stagger: 0
      }, startAt)));
      tween._startAt._dp = 0;
      tween._startAt._sat = tween;
      time < 0 && (_reverting$1 || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill);
      if (immediateRender) {
        if (dur && time <= 0 && tTime <= 0) {
          time && (tween._zTime = time);
          return;
        }
      }
    } else if (runBackwards && dur) {
      if (!prevStartAt) {
        time && (immediateRender = false);
        p = _setDefaults$1({
          overwrite: false,
          data: "isFromStart",
          //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
          lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
          immediateRender,
          //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
          stagger: 0,
          parent
          //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
        }, cleanVars);
        harnessVars && (p[harness.prop] = harnessVars);
        _removeFromParent(tween._startAt = Tween.set(targets, p));
        tween._startAt._dp = 0;
        tween._startAt._sat = tween;
        time < 0 && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
        tween._zTime = time;
        if (!immediateRender) {
          _initTween2(tween._startAt, _tinyNum, _tinyNum);
        } else if (!time) {
          return;
        }
      }
    }
    tween._pt = tween._ptCache = 0;
    lazy = dur && _isNotFalse(lazy) || lazy && !dur;
    for (i = 0; i < targets.length; i++) {
      target = targets[i];
      gsData = target._gsap || _harness(targets)[i]._gsap;
      tween._ptLookup[i] = ptLookup = {};
      _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
      index = fullTargets === targets ? i : fullTargets.indexOf(target);
      if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
        plugin._props.forEach(function(name) {
          ptLookup[name] = pt;
        });
        plugin.priority && (hasPriority = 1);
      }
      if (!harness || harnessVars) {
        for (p in cleanVars) {
          if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
            plugin.priority && (hasPriority = 1);
          } else {
            ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
          }
        }
      }
      tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
      if (autoOverwrite && tween._pt) {
        _overwritingTween = tween;
        _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));
        overwritten = !tween.parent;
        _overwritingTween = 0;
      }
      tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
    }
    hasPriority && _sortPropTweensByPriority(tween);
    tween._onInit && tween._onInit(tween);
  }
  tween._onUpdate = onUpdate;
  tween._initted = (!tween._op || tween._pt) && !overwritten;
  keyframes && time <= 0 && tl.render(_bigNum$1, true, true);
}, _updatePropTweens = function _updatePropTweens2(tween, property, value, start, startIsRelative, ratio, time, skipRecursion) {
  var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property], pt, rootPT, lookup, i;
  if (!ptCache) {
    ptCache = tween._ptCache[property] = [];
    lookup = tween._ptLookup;
    i = tween._targets.length;
    while (i--) {
      pt = lookup[i][property];
      if (pt && pt.d && pt.d._pt) {
        pt = pt.d._pt;
        while (pt && pt.p !== property && pt.fp !== property) {
          pt = pt._next;
        }
      }
      if (!pt) {
        _forceAllPropTweens = 1;
        tween.vars[property] = "+=0";
        _initTween(tween, time);
        _forceAllPropTweens = 0;
        return skipRecursion ? _warn(property + " not eligible for reset") : 1;
      }
      ptCache.push(pt);
    }
  }
  i = ptCache.length;
  while (i--) {
    rootPT = ptCache[i];
    pt = rootPT._pt || rootPT;
    pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
    pt.c = value - pt.s;
    rootPT.e && (rootPT.e = _round$1(value) + getUnit(rootPT.e));
    rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b));
  }
}, _addAliasesToVars = function _addAliasesToVars2(targets, vars) {
  var harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases, copy, p, i, aliases;
  if (!propertyAliases) {
    return vars;
  }
  copy = _merge({}, vars);
  for (p in propertyAliases) {
    if (p in copy) {
      aliases = propertyAliases[p].split(",");
      i = aliases.length;
      while (i--) {
        copy[aliases[i]] = copy[p];
      }
    }
  }
  return copy;
}, _parseKeyframe = function _parseKeyframe2(prop, obj, allProps, easeEach) {
  var ease = obj.ease || easeEach || "power1.inOut", p, a;
  if (_isArray(obj)) {
    a = allProps[prop] || (allProps[prop] = []);
    obj.forEach(function(value, i) {
      return a.push({
        t: i / (obj.length - 1) * 100,
        v: value,
        e: ease
      });
    });
  } else {
    for (p in obj) {
      a = allProps[p] || (allProps[p] = []);
      p === "ease" || a.push({
        t: parseFloat(prop),
        v: obj[p],
        e: ease
      });
    }
  }
}, _parseFuncOrString = function _parseFuncOrString2(value, tween, i, target, targets) {
  return _isFunction$1(value) ? value.call(tween, i, target, targets) : _isString$1(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
}, _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", _staggerPropsToSkip = {};
_forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function(name) {
  return _staggerPropsToSkip[name] = 1;
});
var Tween = /* @__PURE__ */ (function(_Animation2) {
  _inheritsLoose(Tween2, _Animation2);
  function Tween2(targets, vars, position, skipInherit) {
    var _this3;
    if (typeof vars === "number") {
      position.duration = vars;
      vars = position;
      position = null;
    }
    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
    var _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes = _this3$vars.keyframes, defaults22 = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber$1(targets[0]) : "length" in vars) ? [targets] : toArray(targets), tl, i, copy, l, p, curTarget, staggerFunc, staggerVarsToMerge;
    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://gsap.com", !_config.nullTargetWarn) || [];
    _this3._ptLookup = [];
    _this3._overwrite = overwrite;
    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
      vars = _this3.vars;
      tl = _this3.timeline = new Timeline({
        data: "nested",
        defaults: defaults22 || {},
        targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
      });
      tl.kill();
      tl.parent = tl._dp = _assertThisInitialized(_this3);
      tl._start = 0;
      if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        l = parsedTargets.length;
        staggerFunc = stagger && distribute(stagger);
        if (_isObject$1(stagger)) {
          for (p in stagger) {
            if (~_staggerTweenProps.indexOf(p)) {
              staggerVarsToMerge || (staggerVarsToMerge = {});
              staggerVarsToMerge[p] = stagger[p];
            }
          }
        }
        for (i = 0; i < l; i++) {
          copy = _copyExcluding(vars, _staggerPropsToSkip);
          copy.stagger = 0;
          yoyoEase && (copy.yoyoEase = yoyoEase);
          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
          curTarget = parsedTargets[i];
          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
          if (!stagger && l === 1 && copy.delay) {
            _this3._delay = delay = copy.delay;
            _this3._start += delay;
            copy.delay = 0;
          }
          tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
          tl._ease = _easeMap.none;
        }
        tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
      } else if (keyframes) {
        _inheritDefaults(_setDefaults$1(tl.vars.defaults, {
          ease: "none"
        }));
        tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
        var time = 0, a, kf, v;
        if (_isArray(keyframes)) {
          keyframes.forEach(function(frame) {
            return tl.to(parsedTargets, frame, ">");
          });
          tl.duration();
        } else {
          copy = {};
          for (p in keyframes) {
            p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
          }
          for (p in copy) {
            a = copy[p].sort(function(a2, b) {
              return a2.t - b.t;
            });
            time = 0;
            for (i = 0; i < a.length; i++) {
              kf = a[i];
              v = {
                ease: kf.e,
                duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
              };
              v[p] = kf.v;
              tl.to(parsedTargets, v, time);
              time += v.duration;
            }
          }
          tl.duration() < duration && tl.to({}, {
            duration: duration - tl.duration()
          });
        }
      }
      duration || _this3.duration(duration = tl.duration());
    } else {
      _this3.timeline = 0;
    }
    if (overwrite === true && !_suppressOverwrites$1) {
      _overwritingTween = _assertThisInitialized(_this3);
      _globalTimeline.killTweensOf(parsedTargets);
      _overwritingTween = 0;
    }
    _addToTimeline(parent, _assertThisInitialized(_this3), position);
    vars.reversed && _this3.reverse();
    vars.paused && _this3.paused(true);
    if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
      _this3._tTime = -_tinyNum;
      _this3.render(Math.max(0, -delay) || 0);
    }
    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
    return _this3;
  }
  var _proto3 = Tween2.prototype;
  _proto3.render = function render22(totalTime, suppressEvents, force) {
    var prevTime = this._time, tDur = this._tDur, dur = this._dur, isNegative = totalTime < 0, tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime, time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline2, yoyoEase;
    if (!dur) {
      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative || this._lazy) {
      time = tTime;
      timeline2 = this.timeline;
      if (this._repeat) {
        cycleDuration = dur + this._rDelay;
        if (this._repeat < -1 && isNegative) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }
        time = _roundPrecise(tTime % cycleDuration);
        if (tTime === tDur) {
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration);
          iteration = ~~prevIteration;
          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          } else if (time > dur) {
            time = dur;
          }
        }
        isYoyo = this._yoyo && iteration & 1;
        if (isYoyo) {
          yoyoEase = this._yEase;
          time = dur - time;
        }
        prevIteration = _animationCycle(this._tTime, cycleDuration);
        if (time === prevTime && !force && this._initted && iteration === prevIteration) {
          this._tTime = tTime;
          return this;
        }
        if (iteration !== prevIteration) {
          timeline2 && this._yEase && _propagateYoyoEase(timeline2, isYoyo);
          if (this.vars.repeatRefresh && !isYoyo && !this._lock && time !== cycleDuration && this._initted) {
            this._lock = force = 1;
            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
          }
        }
      }
      if (!this._initted) {
        if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
          this._tTime = 0;
          return this;
        }
        if (prevTime !== this._time && !(force && this.vars.repeatRefresh && iteration !== prevIteration)) {
          return this;
        }
        if (dur !== this._dur) {
          return this.render(totalTime, suppressEvents, force);
        }
      }
      this._tTime = tTime;
      this._time = time;
      if (!this._act && this._ts) {
        this._act = 1;
        this._lazy = 0;
      }
      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
      if (this._from) {
        this.ratio = ratio = 1 - ratio;
      }
      if (!prevTime && tTime && !suppressEvents && !prevIteration) {
        _callback$1(this, "onStart");
        if (this._tTime !== tTime) {
          return this;
        }
      }
      pt = this._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
      timeline2 && timeline2.render(totalTime < 0 ? totalTime : timeline2._dur * timeline2._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
      if (this._onUpdate && !suppressEvents) {
        isNegative && _rewindStartAt(this, totalTime, suppressEvents, force);
        _callback$1(this, "onUpdate");
      }
      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback$1(this, "onRepeat");
      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
        isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
        if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
          _callback$1(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }
    return this;
  };
  _proto3.targets = function targets() {
    return this._targets;
  };
  _proto3.invalidate = function invalidate(soft) {
    (!soft || !this.vars.runBackwards) && (this._startAt = 0);
    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate(soft);
    return _Animation2.prototype.invalidate.call(this, soft);
  };
  _proto3.resetTo = function resetTo(property, value, start, startIsRelative, skipRecursion) {
    _tickerActive || _ticker.wake();
    this._ts || this.play();
    var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts), ratio;
    this._initted || _initTween(this, time);
    ratio = this._ease(time / this._dur);
    if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time, skipRecursion)) {
      return this.resetTo(property, value, start, startIsRelative, 1);
    }
    _alignPlayhead(this, 0);
    this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
    return this.render(0);
  };
  _proto3.kill = function kill(targets, vars) {
    if (vars === void 0) {
      vars = "all";
    }
    if (!targets && (!vars || vars === "all")) {
      this._lazy = this._pt = 0;
      this.parent ? _interrupt(this) : this.scrollTrigger && this.scrollTrigger.kill(!!_reverting$1);
      return this;
    }
    if (this.timeline) {
      var tDur = this.timeline.totalDuration();
      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
      return this;
    }
    var parsedTargets = this._targets, killingTargets = targets ? toArray(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt, overwrittenProps, curLookup, curOverwriteProps, props, p, pt, i;
    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
      vars === "all" && (this._pt = 0);
      return _interrupt(this);
    }
    overwrittenProps = this._op = this._op || [];
    if (vars !== "all") {
      if (_isString$1(vars)) {
        p = {};
        _forEachName(vars, function(name) {
          return p[name] = 1;
        });
        vars = p;
      }
      vars = _addAliasesToVars(parsedTargets, vars);
    }
    i = parsedTargets.length;
    while (i--) {
      if (~killingTargets.indexOf(parsedTargets[i])) {
        curLookup = propTweenLookup[i];
        if (vars === "all") {
          overwrittenProps[i] = vars;
          props = curLookup;
          curOverwriteProps = {};
        } else {
          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
          props = vars;
        }
        for (p in props) {
          pt = curLookup && curLookup[p];
          if (pt) {
            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
              _removeLinkedListItem(this, pt, "_pt");
            }
            delete curLookup[p];
          }
          if (curOverwriteProps !== "all") {
            curOverwriteProps[p] = 1;
          }
        }
      }
    }
    this._initted && !this._pt && firstPT && _interrupt(this);
    return this;
  };
  Tween2.to = function to(targets, vars) {
    return new Tween2(targets, vars, arguments[2]);
  };
  Tween2.from = function from(targets, vars) {
    return _createTweenType(1, arguments);
  };
  Tween2.delayedCall = function delayedCall(delay, callback, params, scope) {
    return new Tween2(callback, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay,
      onComplete: callback,
      onReverseComplete: callback,
      onCompleteParams: params,
      onReverseCompleteParams: params,
      callbackScope: scope
    });
  };
  Tween2.fromTo = function fromTo(targets, fromVars, toVars) {
    return _createTweenType(2, arguments);
  };
  Tween2.set = function set2(targets, vars) {
    vars.duration = 0;
    vars.repeatDelay || (vars.repeat = 0);
    return new Tween2(targets, vars);
  };
  Tween2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    return _globalTimeline.killTweensOf(targets, props, onlyActive);
  };
  return Tween2;
})(Animation);
_setDefaults$1(Tween.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
});
_forEachName("staggerTo,staggerFrom,staggerFromTo", function(name) {
  Tween[name] = function() {
    var tl = new Timeline(), params = _slice.call(arguments, 0);
    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
    return tl[name].apply(tl, params);
  };
});
var _setterPlain = function _setterPlain2(target, property, value) {
  return target[property] = value;
}, _setterFunc = function _setterFunc2(target, property, value) {
  return target[property](value);
}, _setterFuncWithParam = function _setterFuncWithParam2(target, property, value, data) {
  return target[property](data.fp, value);
}, _setterAttribute = function _setterAttribute2(target, property, value) {
  return target.setAttribute(property, value);
}, _getSetter = function _getSetter2(target, property) {
  return _isFunction$1(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
}, _renderPlain = function _renderPlain2(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e6) / 1e6, data);
}, _renderBoolean = function _renderBoolean2(ratio, data) {
  return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
}, _renderComplexString = function _renderComplexString2(ratio, data) {
  var pt = data._pt, s = "";
  if (!ratio && data.b) {
    s = data.b;
  } else if (ratio === 1 && data.e) {
    s = data.e;
  } else {
    while (pt) {
      s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) + s;
      pt = pt._next;
    }
    s += data.c;
  }
  data.set(data.t, data.p, s, data);
}, _renderPropTweens = function _renderPropTweens2(ratio, data) {
  var pt = data._pt;
  while (pt) {
    pt.r(ratio, pt.d);
    pt = pt._next;
  }
}, _addPluginModifier = function _addPluginModifier2(modifier, tween, target, property) {
  var pt = this._pt, next;
  while (pt) {
    next = pt._next;
    pt.p === property && pt.modifier(modifier, tween, target);
    pt = next;
  }
}, _killPropTweensOf = function _killPropTweensOf2(property) {
  var pt = this._pt, hasNonDependentRemaining, next;
  while (pt) {
    next = pt._next;
    if (pt.p === property && !pt.op || pt.op === property) {
      _removeLinkedListItem(this, pt, "_pt");
    } else if (!pt.dep) {
      hasNonDependentRemaining = 1;
    }
    pt = next;
  }
  return !hasNonDependentRemaining;
}, _setterWithModifier = function _setterWithModifier2(target, property, value, data) {
  data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
}, _sortPropTweensByPriority = function _sortPropTweensByPriority2(parent) {
  var pt = parent._pt, next, pt2, first, last;
  while (pt) {
    next = pt._next;
    pt2 = first;
    while (pt2 && pt2.pr > pt.pr) {
      pt2 = pt2._next;
    }
    if (pt._prev = pt2 ? pt2._prev : last) {
      pt._prev._next = pt;
    } else {
      first = pt;
    }
    if (pt._next = pt2) {
      pt2._prev = pt;
    } else {
      last = pt;
    }
    pt = next;
  }
  parent._pt = first;
};
var PropTween = /* @__PURE__ */ (function() {
  function PropTween2(next, target, prop, start, change, renderer, data, setter, priority) {
    this.t = target;
    this.s = start;
    this.c = change;
    this.p = prop;
    this.r = renderer || _renderPlain;
    this.d = data || this;
    this.set = setter || _setterPlain;
    this.pr = priority || 0;
    this._next = next;
    if (next) {
      next._prev = this;
    }
  }
  var _proto4 = PropTween2.prototype;
  _proto4.modifier = function modifier(func, tween, target) {
    this.mSet = this.mSet || this.set;
    this.set = _setterWithModifier;
    this.m = func;
    this.mt = target;
    this.tween = tween;
  };
  return PropTween2;
})();
_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(name) {
  return _reservedProps[name] = 1;
});
_globals.TweenMax = _globals.TweenLite = Tween;
_globals.TimelineLite = _globals.TimelineMax = Timeline;
_globalTimeline = new Timeline({
  sortChildren: false,
  defaults: _defaults$1,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true
});
_config.stringFilter = _colorStringFilter;
var _media = [], _listeners$1 = {}, _emptyArray$1 = [], _lastMediaTime = 0, _contextID = 0, _dispatch$1 = function _dispatch2(type) {
  return (_listeners$1[type] || _emptyArray$1).map(function(f) {
    return f();
  });
}, _onMediaChange = function _onMediaChange2() {
  var time = Date.now(), matches = [];
  if (time - _lastMediaTime > 2) {
    _dispatch$1("matchMediaInit");
    _media.forEach(function(c) {
      var queries = c.queries, conditions = c.conditions, match, p, anyMatch, toggled;
      for (p in queries) {
        match = _win$3.matchMedia(queries[p]).matches;
        match && (anyMatch = 1);
        if (match !== conditions[p]) {
          conditions[p] = match;
          toggled = 1;
        }
      }
      if (toggled) {
        c.revert();
        anyMatch && matches.push(c);
      }
    });
    _dispatch$1("matchMediaRevert");
    matches.forEach(function(c) {
      return c.onMatch(c, function(func) {
        return c.add(null, func);
      });
    });
    _lastMediaTime = time;
    _dispatch$1("matchMedia");
  }
};
var Context = /* @__PURE__ */ (function() {
  function Context2(func, scope) {
    this.selector = scope && selector(scope);
    this.data = [];
    this._r = [];
    this.isReverted = false;
    this.id = _contextID++;
    func && this.add(func);
  }
  var _proto5 = Context2.prototype;
  _proto5.add = function add(name, func, scope) {
    if (_isFunction$1(name)) {
      scope = func;
      func = name;
      name = _isFunction$1;
    }
    var self2 = this, f = function f2() {
      var prev = _context$2, prevSelector = self2.selector, result;
      prev && prev !== self2 && prev.data.push(self2);
      scope && (self2.selector = selector(scope));
      _context$2 = self2;
      result = func.apply(self2, arguments);
      _isFunction$1(result) && self2._r.push(result);
      _context$2 = prev;
      self2.selector = prevSelector;
      self2.isReverted = false;
      return result;
    };
    self2.last = f;
    return name === _isFunction$1 ? f(self2, function(func2) {
      return self2.add(null, func2);
    }) : name ? self2[name] = f : f;
  };
  _proto5.ignore = function ignore(func) {
    var prev = _context$2;
    _context$2 = null;
    func(this);
    _context$2 = prev;
  };
  _proto5.getTweens = function getTweens() {
    var a = [];
    this.data.forEach(function(e) {
      return e instanceof Context2 ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
    });
    return a;
  };
  _proto5.clear = function clear2() {
    this._r.length = this.data.length = 0;
  };
  _proto5.kill = function kill(revert, matchMedia2) {
    var _this4 = this;
    if (revert) {
      (function() {
        var tweens = _this4.getTweens(), i2 = _this4.data.length, t;
        while (i2--) {
          t = _this4.data[i2];
          if (t.data === "isFlip") {
            t.revert();
            t.getChildren(true, true, false).forEach(function(tween) {
              return tweens.splice(tweens.indexOf(tween), 1);
            });
          }
        }
        tweens.map(function(t2) {
          return {
            g: t2._dur || t2._delay || t2._sat && !t2._sat.vars.immediateRender ? t2.globalTime(0) : -Infinity,
            t: t2
          };
        }).sort(function(a, b) {
          return b.g - a.g || -Infinity;
        }).forEach(function(o) {
          return o.t.revert(revert);
        });
        i2 = _this4.data.length;
        while (i2--) {
          t = _this4.data[i2];
          if (t instanceof Timeline) {
            if (t.data !== "nested") {
              t.scrollTrigger && t.scrollTrigger.revert();
              t.kill();
            }
          } else {
            !(t instanceof Tween) && t.revert && t.revert(revert);
          }
        }
        _this4._r.forEach(function(f) {
          return f(revert, _this4);
        });
        _this4.isReverted = true;
      })();
    } else {
      this.data.forEach(function(e) {
        return e.kill && e.kill();
      });
    }
    this.clear();
    if (matchMedia2) {
      var i = _media.length;
      while (i--) {
        _media[i].id === this.id && _media.splice(i, 1);
      }
    }
  };
  _proto5.revert = function revert(config3) {
    this.kill(config3 || {});
  };
  return Context2;
})();
var MatchMedia = /* @__PURE__ */ (function() {
  function MatchMedia2(scope) {
    this.contexts = [];
    this.scope = scope;
    _context$2 && _context$2.data.push(this);
  }
  var _proto6 = MatchMedia2.prototype;
  _proto6.add = function add(conditions, func, scope) {
    _isObject$1(conditions) || (conditions = {
      matches: conditions
    });
    var context3 = new Context(0, scope || this.scope), cond = context3.conditions = {}, mq, p, active;
    _context$2 && !context3.selector && (context3.selector = _context$2.selector);
    this.contexts.push(context3);
    func = context3.add("onMatch", func);
    context3.queries = conditions;
    for (p in conditions) {
      if (p === "all") {
        active = 1;
      } else {
        mq = _win$3.matchMedia(conditions[p]);
        if (mq) {
          _media.indexOf(context3) < 0 && _media.push(context3);
          (cond[p] = mq.matches) && (active = 1);
          mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
        }
      }
    }
    active && func(context3, function(f) {
      return context3.add(null, f);
    });
    return this;
  };
  _proto6.revert = function revert(config3) {
    this.kill(config3 || {});
  };
  _proto6.kill = function kill(revert) {
    this.contexts.forEach(function(c) {
      return c.kill(revert, true);
    });
  };
  return MatchMedia2;
})();
var _gsap = {
  registerPlugin: function registerPlugin() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    args.forEach(function(config3) {
      return _createPlugin(config3);
    });
  },
  timeline: function timeline(vars) {
    return new Timeline(vars);
  },
  getTweensOf: function getTweensOf(targets, onlyActive) {
    return _globalTimeline.getTweensOf(targets, onlyActive);
  },
  getProperty: function getProperty(target, property, unit, uncache) {
    _isString$1(target) && (target = toArray(target)[0]);
    var getter = _getCache(target || {}).get, format = unit ? _passThrough$1 : _numericIfPossible;
    unit === "native" && (unit = "");
    return !target ? target : !property ? function(property2, unit2, uncache2) {
      return format((_plugins[property2] && _plugins[property2].get || getter)(target, property2, unit2, uncache2));
    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
  },
  quickSetter: function quickSetter(target, property, unit) {
    target = toArray(target);
    if (target.length > 1) {
      var setters = target.map(function(t) {
        return gsap$2.quickSetter(t, property, unit);
      }), l = setters.length;
      return function(value) {
        var i = l;
        while (i--) {
          setters[i](value);
        }
      };
    }
    target = target[0] || {};
    var Plugin = _plugins[property], cache2 = _getCache(target), p = cache2.harness && (cache2.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
      var p2 = new Plugin();
      _quickTween._pt = 0;
      p2.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
      p2.render(1, p2);
      _quickTween._pt && _renderPropTweens(1, _quickTween);
    } : cache2.set(target, p);
    return Plugin ? setter : function(value) {
      return setter(target, p, unit ? value + unit : value, cache2, 1);
    };
  },
  quickTo: function quickTo(target, property, vars) {
    var _setDefaults22;
    var tween = gsap$2.to(target, _setDefaults$1((_setDefaults22 = {}, _setDefaults22[property] = "+=0.1", _setDefaults22.paused = true, _setDefaults22.stagger = 0, _setDefaults22), vars || {})), func = function func2(value, start, startIsRelative) {
      return tween.resetTo(property, value, start, startIsRelative);
    };
    func.tween = tween;
    return func;
  },
  isTweening: function isTweening(targets) {
    return _globalTimeline.getTweensOf(targets, true).length > 0;
  },
  defaults: function defaults2(value) {
    value && value.ease && (value.ease = _parseEase(value.ease, _defaults$1.ease));
    return _mergeDeep(_defaults$1, value || {});
  },
  config: function config2(value) {
    return _mergeDeep(_config, value || {});
  },
  registerEffect: function registerEffect(_ref3) {
    var name = _ref3.name, effect = _ref3.effect, plugins = _ref3.plugins, defaults22 = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
    (plugins || "").split(",").forEach(function(pluginName) {
      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
    });
    _effects[name] = function(targets, vars, tl) {
      return effect(toArray(targets), _setDefaults$1(vars || {}, defaults22), tl);
    };
    if (extendTimeline) {
      Timeline.prototype[name] = function(targets, vars, position) {
        return this.add(_effects[name](targets, _isObject$1(vars) ? vars : (position = vars) && {}, this), position);
      };
    }
  },
  registerEase: function registerEase(name, ease) {
    _easeMap[name] = _parseEase(ease);
  },
  parseEase: function parseEase(ease, defaultEase) {
    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
  },
  getById: function getById(id) {
    return _globalTimeline.getById(id);
  },
  exportRoot: function exportRoot(vars, includeDelayedCalls) {
    if (vars === void 0) {
      vars = {};
    }
    var tl = new Timeline(vars), child, next;
    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
    _globalTimeline.remove(tl);
    tl._dp = 0;
    tl._time = tl._tTime = _globalTimeline._time;
    child = _globalTimeline._first;
    while (child) {
      next = child._next;
      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
        _addToTimeline(tl, child, child._start - child._delay);
      }
      child = next;
    }
    _addToTimeline(_globalTimeline, tl, 0);
    return tl;
  },
  context: function context(func, scope) {
    return func ? new Context(func, scope) : _context$2;
  },
  matchMedia: function matchMedia(scope) {
    return new MatchMedia(scope);
  },
  matchMediaRefresh: function matchMediaRefresh() {
    return _media.forEach(function(c) {
      var cond = c.conditions, found, p;
      for (p in cond) {
        if (cond[p]) {
          cond[p] = false;
          found = 1;
        }
      }
      found && c.revert();
    }) || _onMediaChange();
  },
  addEventListener: function addEventListener(type, callback) {
    var a = _listeners$1[type] || (_listeners$1[type] = []);
    ~a.indexOf(callback) || a.push(callback);
  },
  removeEventListener: function removeEventListener(type, callback) {
    var a = _listeners$1[type], i = a && a.indexOf(callback);
    i >= 0 && a.splice(i, 1);
  },
  utils: {
    wrap,
    wrapYoyo,
    distribute,
    random,
    snap,
    normalize,
    getUnit,
    clamp,
    splitColor,
    toArray,
    selector,
    mapRange,
    pipe,
    unitize,
    interpolate,
    shuffle
  },
  install: _install,
  effects: _effects,
  ticker: _ticker,
  updateRoot: Timeline.updateRoot,
  plugins: _plugins,
  globalTimeline: _globalTimeline,
  core: {
    PropTween,
    globals: _addGlobal,
    Tween,
    Timeline,
    Animation,
    getCache: _getCache,
    _removeLinkedListItem,
    reverting: function reverting() {
      return _reverting$1;
    },
    context: function context2(toAdd) {
      if (toAdd && _context$2) {
        _context$2.data.push(toAdd);
        toAdd._ctx = _context$2;
      }
      return _context$2;
    },
    suppressOverwrites: function suppressOverwrites(value) {
      return _suppressOverwrites$1 = value;
    }
  }
};
_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function(name) {
  return _gsap[name] = Tween[name];
});
_ticker.add(Timeline.updateRoot);
_quickTween = _gsap.to({}, {
  duration: 0
});
var _getPluginPropTween = function _getPluginPropTween2(plugin, prop) {
  var pt = plugin._pt;
  while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
    pt = pt._next;
  }
  return pt;
}, _addModifiers = function _addModifiers2(tween, modifiers) {
  var targets = tween._targets, p, i, pt;
  for (p in modifiers) {
    i = targets.length;
    while (i--) {
      pt = tween._ptLookup[i][p];
      if (pt && (pt = pt.d)) {
        if (pt._pt) {
          pt = _getPluginPropTween(pt, p);
        }
        pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
      }
    }
  }
}, _buildModifierPlugin = function _buildModifierPlugin2(name, modifier) {
  return {
    name,
    headless: 1,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function init32(target, vars, tween) {
      tween._onInit = function(tween2) {
        var temp, p;
        if (_isString$1(vars)) {
          temp = {};
          _forEachName(vars, function(name2) {
            return temp[name2] = 1;
          });
          vars = temp;
        }
        if (modifier) {
          temp = {};
          for (p in vars) {
            temp[p] = modifier(vars[p]);
          }
          vars = temp;
        }
        _addModifiers(tween2, vars);
      };
    }
  };
};
var gsap$2 = _gsap.registerPlugin({
  name: "attr",
  init: function init(target, vars, tween, index, targets) {
    var p, pt, v;
    this.tween = tween;
    for (p in vars) {
      v = target.getAttribute(p) || "";
      pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
      pt.op = p;
      pt.b = v;
      this._props.push(p);
    }
  },
  render: function render(ratio, data) {
    var pt = data._pt;
    while (pt) {
      _reverting$1 ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d);
      pt = pt._next;
    }
  }
}, {
  name: "endArray",
  headless: 1,
  init: function init2(target, value) {
    var i = value.length;
    while (i--) {
      this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
    }
  }
}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
Tween.version = Timeline.version = gsap$2.version = "3.14.1";
_coreReady = 1;
_windowExists$2() && _wake();
_easeMap.Power0;
_easeMap.Power1;
_easeMap.Power2;
_easeMap.Power3;
_easeMap.Power4;
_easeMap.Linear;
_easeMap.Quad;
_easeMap.Cubic;
_easeMap.Quart;
_easeMap.Quint;
_easeMap.Strong;
_easeMap.Elastic;
_easeMap.Back;
_easeMap.SteppedEase;
_easeMap.Bounce;
_easeMap.Sine;
_easeMap.Expo;
_easeMap.Circ;
var _win$2, _doc$2, _docElement, _pluginInitted, _tempDiv, _recentSetterPlugin, _reverting, _windowExists$1 = function _windowExists22() {
  return typeof window !== "undefined";
}, _transformProps = {}, _RAD2DEG = 180 / Math.PI, _DEG2RAD = Math.PI / 180, _atan2 = Math.atan2, _bigNum = 1e8, _capsExp$1 = /([A-Z])/g, _horizontalExp = /(left|right|width|margin|padding|x)/i, _complexExp = /[\s,\(]\S/, _propertyAliases = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
}, _renderCSSProp = function _renderCSSProp2(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
}, _renderPropWithEnd = function _renderPropWithEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
}, _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning2(ratio, data) {
  return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
}, _renderCSSPropWithBeginningAndEnd = function _renderCSSPropWithBeginningAndEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
}, _renderRoundedCSSProp = function _renderRoundedCSSProp2(ratio, data) {
  var value = data.s + data.c * ratio;
  data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : 0.5)) + data.u, data);
}, _renderNonTweeningValue = function _renderNonTweeningValue2(ratio, data) {
  return data.set(data.t, data.p, ratio ? data.e : data.b, data);
}, _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
}, _setterCSSStyle = function _setterCSSStyle2(target, property, value) {
  return target.style[property] = value;
}, _setterCSSProp = function _setterCSSProp2(target, property, value) {
  return target.style.setProperty(property, value);
}, _setterTransform = function _setterTransform2(target, property, value) {
  return target._gsap[property] = value;
}, _setterScale = function _setterScale2(target, property, value) {
  return target._gsap.scaleX = target._gsap.scaleY = value;
}, _setterScaleWithRender = function _setterScaleWithRender2(target, property, value, data, ratio) {
  var cache2 = target._gsap;
  cache2.scaleX = cache2.scaleY = value;
  cache2.renderTransform(ratio, cache2);
}, _setterTransformWithRender = function _setterTransformWithRender2(target, property, value, data, ratio) {
  var cache2 = target._gsap;
  cache2[property] = value;
  cache2.renderTransform(ratio, cache2);
}, _transformProp$1 = "transform", _transformOriginProp = _transformProp$1 + "Origin", _saveStyle = function _saveStyle2(property, isNotCSS) {
  var _this = this;
  var target = this.target, style = target.style, cache2 = target._gsap;
  if (property in _transformProps && style) {
    this.tfm = this.tfm || {};
    if (property !== "transform") {
      property = _propertyAliases[property] || property;
      ~property.indexOf(",") ? property.split(",").forEach(function(a) {
        return _this.tfm[a] = _get(target, a);
      }) : this.tfm[property] = cache2.x ? cache2[property] : _get(target, property);
      property === _transformOriginProp && (this.tfm.zOrigin = cache2.zOrigin);
    } else {
      return _propertyAliases.transform.split(",").forEach(function(p) {
        return _saveStyle2.call(_this, p, isNotCSS);
      });
    }
    if (this.props.indexOf(_transformProp$1) >= 0) {
      return;
    }
    if (cache2.svg) {
      this.svgo = target.getAttribute("data-svg-origin");
      this.props.push(_transformOriginProp, isNotCSS, "");
    }
    property = _transformProp$1;
  }
  (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
}, _removeIndependentTransforms = function _removeIndependentTransforms2(style) {
  if (style.translate) {
    style.removeProperty("translate");
    style.removeProperty("scale");
    style.removeProperty("rotate");
  }
}, _revertStyle = function _revertStyle2() {
  var props = this.props, target = this.target, style = target.style, cache2 = target._gsap, i, p;
  for (i = 0; i < props.length; i += 3) {
    if (!props[i + 1]) {
      props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].substr(0, 2) === "--" ? props[i] : props[i].replace(_capsExp$1, "-$1").toLowerCase());
    } else if (props[i + 1] === 2) {
      target[props[i]](props[i + 2]);
    } else {
      target[props[i]] = props[i + 2];
    }
  }
  if (this.tfm) {
    for (p in this.tfm) {
      cache2[p] = this.tfm[p];
    }
    if (cache2.svg) {
      cache2.renderTransform();
      target.setAttribute("data-svg-origin", this.svgo || "");
    }
    i = _reverting();
    if ((!i || !i.isStart) && !style[_transformProp$1]) {
      _removeIndependentTransforms(style);
      if (cache2.zOrigin && style[_transformOriginProp]) {
        style[_transformOriginProp] += " " + cache2.zOrigin + "px";
        cache2.zOrigin = 0;
        cache2.renderTransform();
      }
      cache2.uncache = 1;
    }
  }
}, _getStyleSaver = function _getStyleSaver2(target, properties) {
  var saver = {
    target,
    props: [],
    revert: _revertStyle,
    save: _saveStyle
  };
  target._gsap || gsap$2.core.getCache(target);
  properties && target.style && target.nodeType && properties.split(",").forEach(function(p) {
    return saver.save(p);
  });
  return saver;
}, _supports3D, _createElement = function _createElement2(type, ns) {
  var e = _doc$2.createElementNS ? _doc$2.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$2.createElement(type);
  return e && e.style ? e : _doc$2.createElement(type);
}, _getComputedProperty = function _getComputedProperty2(target, property, skipPrefixFallback) {
  var cs = getComputedStyle(target);
  return cs[property] || cs.getPropertyValue(property.replace(_capsExp$1, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty2(target, _checkPropPrefix(property) || property, 1) || "";
}, _prefixes = "O,Moz,ms,Ms,Webkit".split(","), _checkPropPrefix = function _checkPropPrefix2(property, element, preferPrefix) {
  var e = element || _tempDiv, s = e.style, i = 5;
  if (property in s && !preferPrefix) {
    return property;
  }
  property = property.charAt(0).toUpperCase() + property.substr(1);
  while (i-- && !(_prefixes[i] + property in s)) {
  }
  return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
}, _initCore$1 = function _initCore2() {
  if (_windowExists$1() && window.document) {
    _win$2 = window;
    _doc$2 = _win$2.document;
    _docElement = _doc$2.documentElement;
    _tempDiv = _createElement("div") || {
      style: {}
    };
    _createElement("div");
    _transformProp$1 = _checkPropPrefix(_transformProp$1);
    _transformOriginProp = _transformProp$1 + "Origin";
    _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
    _supports3D = !!_checkPropPrefix("perspective");
    _reverting = gsap$2.core.reverting;
    _pluginInitted = 1;
  }
}, _getReparentedCloneBBox = function _getReparentedCloneBBox2(target) {
  var owner = target.ownerSVGElement, svg = _createElement("svg", owner && owner.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), clone = target.cloneNode(true), bbox;
  clone.style.display = "block";
  svg.appendChild(clone);
  _docElement.appendChild(svg);
  try {
    bbox = clone.getBBox();
  } catch (e) {
  }
  svg.removeChild(clone);
  _docElement.removeChild(svg);
  return bbox;
}, _getAttributeFallbacks = function _getAttributeFallbacks2(target, attributesArray) {
  var i = attributesArray.length;
  while (i--) {
    if (target.hasAttribute(attributesArray[i])) {
      return target.getAttribute(attributesArray[i]);
    }
  }
}, _getBBox = function _getBBox2(target) {
  var bounds, cloned;
  try {
    bounds = target.getBBox();
  } catch (error) {
    bounds = _getReparentedCloneBBox(target);
    cloned = 1;
  }
  bounds && (bounds.width || bounds.height) || cloned || (bounds = _getReparentedCloneBBox(target));
  return bounds && !bounds.width && !bounds.x && !bounds.y ? {
    x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
    y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : bounds;
}, _isSVG = function _isSVG2(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
}, _removeProperty = function _removeProperty2(target, property) {
  if (property) {
    var style = target.style, first2Chars;
    if (property in _transformProps && property !== _transformOriginProp) {
      property = _transformProp$1;
    }
    if (style.removeProperty) {
      first2Chars = property.substr(0, 2);
      if (first2Chars === "ms" || property.substr(0, 6) === "webkit") {
        property = "-" + property;
      }
      style.removeProperty(first2Chars === "--" ? property : property.replace(_capsExp$1, "-$1").toLowerCase());
    } else {
      style.removeAttribute(property);
    }
  }
}, _addNonTweeningPT = function _addNonTweeningPT2(plugin, target, property, beginning, end, onlySetAtEnd) {
  var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
  plugin._pt = pt;
  pt.b = beginning;
  pt.e = end;
  plugin._props.push(property);
  return pt;
}, _nonConvertibleUnits = {
  deg: 1,
  rad: 1,
  turn: 1
}, _nonStandardLayouts = {
  grid: 1,
  flex: 1
}, _convertToUnit = function _convertToUnit2(target, property, value, unit) {
  var curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = target.tagName.toLowerCase() === "svg", measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = unit === "px", toPercent = unit === "%", px, parent, cache2, isSVG;
  if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
    return curValue;
  }
  curUnit !== "px" && !toPixels && (curValue = _convertToUnit2(target, property, value, "px"));
  isSVG = target.getCTM && _isSVG(target);
  if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
    px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
    return _round$1(toPercent ? curValue / px * amount : curValue / 100 * px);
  }
  style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
  parent = unit !== "rem" && ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
  if (isSVG) {
    parent = (target.ownerSVGElement || {}).parentNode;
  }
  if (!parent || parent === _doc$2 || !parent.appendChild) {
    parent = _doc$2.body;
  }
  cache2 = parent._gsap;
  if (cache2 && toPercent && cache2.width && horizontal && cache2.time === _ticker.time && !cache2.uncache) {
    return _round$1(curValue / cache2.width * amount);
  } else {
    if (toPercent && (property === "height" || property === "width")) {
      var v = target.style[property];
      target.style[property] = amount + unit;
      px = target[measureProperty];
      v ? target.style[property] = v : _removeProperty(target, property);
    } else {
      (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static");
      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";
    }
    if (horizontal && toPercent) {
      cache2 = _getCache(parent);
      cache2.time = _ticker.time;
      cache2.width = parent[measureProperty];
    }
  }
  return _round$1(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
}, _get = function _get2(target, property, unit, uncache) {
  var value;
  _pluginInitted || _initCore$1();
  if (property in _propertyAliases && property !== "transform") {
    property = _propertyAliases[property];
    if (~property.indexOf(",")) {
      property = property.split(",")[0];
    }
  }
  if (_transformProps[property] && property !== "transform") {
    value = _parseTransform(target, uncache);
    value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
  } else {
    value = target.style[property];
    if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
      value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
    }
  }
  return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
}, _tweenComplexCSSString = function _tweenComplexCSSString2(target, prop, start, end) {
  if (!start || start === "none") {
    var p = _checkPropPrefix(prop, target, 1), s = p && _getComputedProperty(target, p, 1);
    if (s && s !== start) {
      prop = p;
      start = s;
    } else if (prop === "borderColor") {
      start = _getComputedProperty(target, "borderTopColor");
    }
  }
  var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index = 0, matchIndex = 0, a, result, startValues, startNum, color, startValue, endValue, endNum, chunk, endUnit, startUnit, endValues;
  pt.b = start;
  pt.e = end;
  start += "";
  end += "";
  if (end.substring(0, 6) === "var(--") {
    end = _getComputedProperty(target, end.substring(4, end.indexOf(")")));
  }
  if (end === "auto") {
    startValue = target.style[prop];
    target.style[prop] = end;
    end = _getComputedProperty(target, prop) || end;
    startValue ? target.style[prop] = startValue : _removeProperty(target, prop);
  }
  a = [start, end];
  _colorStringFilter(a);
  start = a[0];
  end = a[1];
  startValues = start.match(_numWithUnitExp) || [];
  endValues = end.match(_numWithUnitExp) || [];
  if (endValues.length) {
    while (result = _numWithUnitExp.exec(end)) {
      endValue = result[0];
      chunk = end.substring(index, result.index);
      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
        color = 1;
      }
      if (endValue !== (startValue = startValues[matchIndex++] || "")) {
        startNum = parseFloat(startValue) || 0;
        startUnit = startValue.substr((startNum + "").length);
        endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
        endNum = parseFloat(endValue);
        endUnit = endValue.substr((endNum + "").length);
        index = _numWithUnitExp.lastIndex - endUnit.length;
        if (!endUnit) {
          endUnit = endUnit || _config.units[prop] || startUnit;
          if (index === end.length) {
            end += endUnit;
            pt.e += endUnit;
          }
        }
        if (startUnit !== endUnit) {
          startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
        }
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum - startNum,
          m: color && color < 4 || prop === "zIndex" ? Math.round : 0
        };
      }
    }
    pt.c = index < end.length ? end.substring(index, end.length) : "";
  } else {
    pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
  }
  _relExp.test(end) && (pt.e = 0);
  this._pt = pt;
  return pt;
}, _keywordToPercent = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, _convertKeywordsToPercentages = function _convertKeywordsToPercentages2(value) {
  var split2 = value.split(" "), x = split2[0], y = split2[1] || "50%";
  if (x === "top" || x === "bottom" || y === "left" || y === "right") {
    value = x;
    x = y;
    y = value;
  }
  split2[0] = _keywordToPercent[x] || x;
  split2[1] = _keywordToPercent[y] || y;
  return split2.join(" ");
}, _renderClearProps = function _renderClearProps2(ratio, data) {
  if (data.tween && data.tween._time === data.tween._dur) {
    var target = data.t, style = target.style, props = data.u, cache2 = target._gsap, prop, clearTransforms, i;
    if (props === "all" || props === true) {
      style.cssText = "";
      clearTransforms = 1;
    } else {
      props = props.split(",");
      i = props.length;
      while (--i > -1) {
        prop = props[i];
        if (_transformProps[prop]) {
          clearTransforms = 1;
          prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp$1;
        }
        _removeProperty(target, prop);
      }
    }
    if (clearTransforms) {
      _removeProperty(target, _transformProp$1);
      if (cache2) {
        cache2.svg && target.removeAttribute("transform");
        style.scale = style.rotate = style.translate = "none";
        _parseTransform(target, 1);
        cache2.uncache = 1;
        _removeIndependentTransforms(style);
      }
    }
  }
}, _specialProps = {
  clearProps: function clearProps(plugin, target, property, endValue, tween) {
    if (tween.data !== "isFromStart") {
      var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
      pt.u = endValue;
      pt.pr = -10;
      pt.tween = tween;
      plugin._props.push(property);
      return 1;
    }
  }
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */
}, _identity2DMatrix = [1, 0, 0, 1, 0, 0], _rotationalProperties = {}, _isNullTransform = function _isNullTransform2(value) {
  return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
}, _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray2(target) {
  var matrixString = _getComputedProperty(target, _transformProp$1);
  return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round$1);
}, _getMatrix = function _getMatrix2(target, force2D) {
  var cache2 = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target), parent, nextSibling, temp, addedToDOM;
  if (cache2.svg && target.getAttribute("transform")) {
    temp = target.transform.baseVal.consolidate().matrix;
    matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
    return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
  } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache2.svg) {
    temp = style.display;
    style.display = "block";
    parent = target.parentNode;
    if (!parent || !target.offsetParent && !target.getBoundingClientRect().width) {
      addedToDOM = 1;
      nextSibling = target.nextElementSibling;
      _docElement.appendChild(target);
    }
    matrix = _getComputedTransformMatrixAsArray(target);
    temp ? style.display = temp : _removeProperty(target, "display");
    if (addedToDOM) {
      nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
    }
  }
  return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
}, _applySVGOrigin = function _applySVGOrigin2(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
  var cache2 = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache2.xOrigin || 0, yOriginOld = cache2.yOrigin || 0, xOffsetOld = cache2.xOffset || 0, yOffsetOld = cache2.yOffset || 0, a = matrix[0], b = matrix[1], c = matrix[2], d = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0, bounds, determinant, x, y;
  if (!originIsAbsolute) {
    bounds = _getBBox(target);
    xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
    yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
  } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
    x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
    y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
    xOrigin = x;
    yOrigin = y;
  }
  if (smooth || smooth !== false && cache2.smooth) {
    tx = xOrigin - xOriginOld;
    ty = yOrigin - yOriginOld;
    cache2.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
    cache2.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
  } else {
    cache2.xOffset = cache2.yOffset = 0;
  }
  cache2.xOrigin = xOrigin;
  cache2.yOrigin = yOrigin;
  cache2.smooth = !!smooth;
  cache2.origin = origin;
  cache2.originIsAbsolute = !!originIsAbsolute;
  target.style[_transformOriginProp] = "0px 0px";
  if (pluginToAddPropTweensTo) {
    _addNonTweeningPT(pluginToAddPropTweensTo, cache2, "xOrigin", xOriginOld, xOrigin);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache2, "yOrigin", yOriginOld, yOrigin);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache2, "xOffset", xOffsetOld, cache2.xOffset);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache2, "yOffset", yOffsetOld, cache2.yOffset);
  }
  target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
}, _parseTransform = function _parseTransform2(target, uncache) {
  var cache2 = target._gsap || new GSCache(target);
  if ("x" in cache2 && !uncache && !cache2.uncache) {
    return cache2;
  }
  var style = target.style, invertedScaleX = cache2.scaleX < 0, px = "px", deg = "deg", cs = getComputedStyle(target), origin = _getComputedProperty(target, _transformOriginProp) || "0", x, y, z, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos, sin, a, b, c, d, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32;
  x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
  scaleX = scaleY = 1;
  cache2.svg = !!(target.getCTM && _isSVG(target));
  if (cs.translate) {
    if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
      style[_transformProp$1] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp$1] !== "none" ? cs[_transformProp$1] : "");
    }
    style.scale = style.rotate = style.translate = "none";
  }
  matrix = _getMatrix(target, cache2.svg);
  if (cache2.svg) {
    if (cache2.uncache) {
      t2 = target.getBBox();
      origin = cache2.xOrigin - t2.x + "px " + (cache2.yOrigin - t2.y) + "px";
      t1 = "";
    } else {
      t1 = !uncache && target.getAttribute("data-svg-origin");
    }
    _applySVGOrigin(target, t1 || origin, !!t1 || cache2.originIsAbsolute, cache2.smooth !== false, matrix);
  }
  xOrigin = cache2.xOrigin || 0;
  yOrigin = cache2.yOrigin || 0;
  if (matrix !== _identity2DMatrix) {
    a = matrix[0];
    b = matrix[1];
    c = matrix[2];
    d = matrix[3];
    x = a12 = matrix[4];
    y = a22 = matrix[5];
    if (matrix.length === 6) {
      scaleX = Math.sqrt(a * a + b * b);
      scaleY = Math.sqrt(d * d + c * c);
      rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
      skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
      skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
      if (cache2.svg) {
        x -= xOrigin - (xOrigin * a + yOrigin * c);
        y -= yOrigin - (xOrigin * b + yOrigin * d);
      }
    } else {
      a32 = matrix[6];
      a42 = matrix[7];
      a13 = matrix[8];
      a23 = matrix[9];
      a33 = matrix[10];
      a43 = matrix[11];
      x = matrix[12];
      y = matrix[13];
      z = matrix[14];
      angle = _atan2(a32, a33);
      rotationX = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a12 * cos + a13 * sin;
        t2 = a22 * cos + a23 * sin;
        t3 = a32 * cos + a33 * sin;
        a13 = a12 * -sin + a13 * cos;
        a23 = a22 * -sin + a23 * cos;
        a33 = a32 * -sin + a33 * cos;
        a43 = a42 * -sin + a43 * cos;
        a12 = t1;
        a22 = t2;
        a32 = t3;
      }
      angle = _atan2(-c, a33);
      rotationY = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a * cos - a13 * sin;
        t2 = b * cos - a23 * sin;
        t3 = c * cos - a33 * sin;
        a43 = d * sin + a43 * cos;
        a = t1;
        b = t2;
        c = t3;
      }
      angle = _atan2(b, a);
      rotation = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        t1 = a * cos + b * sin;
        t2 = a12 * cos + a22 * sin;
        b = b * cos - a * sin;
        a22 = a22 * cos - a12 * sin;
        a = t1;
        a12 = t2;
      }
      if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
        rotationX = rotation = 0;
        rotationY = 180 - rotationY;
      }
      scaleX = _round$1(Math.sqrt(a * a + b * b + c * c));
      scaleY = _round$1(Math.sqrt(a22 * a22 + a32 * a32));
      angle = _atan2(a12, a22);
      skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
      perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
    }
    if (cache2.svg) {
      t1 = target.getAttribute("transform");
      cache2.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp$1));
      t1 && target.setAttribute("transform", t1);
    }
  }
  if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
    if (invertedScaleX) {
      scaleX *= -1;
      skewX += rotation <= 0 ? 180 : -180;
      rotation += rotation <= 0 ? 180 : -180;
    } else {
      scaleY *= -1;
      skewX += skewX <= 0 ? 180 : -180;
    }
  }
  uncache = uncache || cache2.uncache;
  cache2.x = x - ((cache2.xPercent = x && (!uncache && cache2.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache2.xPercent / 100 : 0) + px;
  cache2.y = y - ((cache2.yPercent = y && (!uncache && cache2.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache2.yPercent / 100 : 0) + px;
  cache2.z = z + px;
  cache2.scaleX = _round$1(scaleX);
  cache2.scaleY = _round$1(scaleY);
  cache2.rotation = _round$1(rotation) + deg;
  cache2.rotationX = _round$1(rotationX) + deg;
  cache2.rotationY = _round$1(rotationY) + deg;
  cache2.skewX = skewX + deg;
  cache2.skewY = skewY + deg;
  cache2.transformPerspective = perspective + px;
  if (cache2.zOrigin = parseFloat(origin.split(" ")[2]) || !uncache && cache2.zOrigin || 0) {
    style[_transformOriginProp] = _firstTwoOnly(origin);
  }
  cache2.xOffset = cache2.yOffset = 0;
  cache2.force3D = _config.force3D;
  cache2.renderTransform = cache2.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
  cache2.uncache = 0;
  return cache2;
}, _firstTwoOnly = function _firstTwoOnly2(value) {
  return (value = value.split(" "))[0] + " " + value[1];
}, _addPxTranslate = function _addPxTranslate2(target, start, value) {
  var unit = getUnit(start);
  return _round$1(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
}, _renderNon3DTransforms = function _renderNon3DTransforms2(ratio, cache2) {
  cache2.z = "0px";
  cache2.rotationY = cache2.rotationX = "0deg";
  cache2.force3D = 0;
  _renderCSSTransforms(ratio, cache2);
}, _zeroDeg = "0deg", _zeroPx = "0px", _endParenthesis = ") ", _renderCSSTransforms = function _renderCSSTransforms2(ratio, cache2) {
  var _ref = cache2 || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x = _ref.x, y = _ref.y, z = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;
  if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
    var angle = parseFloat(rotationY) * _DEG2RAD, a13 = Math.sin(angle), a33 = Math.cos(angle), cos;
    angle = parseFloat(rotationX) * _DEG2RAD;
    cos = Math.cos(angle);
    x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
    y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
    z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
  }
  if (transformPerspective !== _zeroPx) {
    transforms += "perspective(" + transformPerspective + _endParenthesis;
  }
  if (xPercent || yPercent) {
    transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
  }
  if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
    transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
  }
  if (rotation !== _zeroDeg) {
    transforms += "rotate(" + rotation + _endParenthesis;
  }
  if (rotationY !== _zeroDeg) {
    transforms += "rotateY(" + rotationY + _endParenthesis;
  }
  if (rotationX !== _zeroDeg) {
    transforms += "rotateX(" + rotationX + _endParenthesis;
  }
  if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
    transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
  }
  if (scaleX !== 1 || scaleY !== 1) {
    transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
  }
  target.style[_transformProp$1] = transforms || "translate(0, 0)";
}, _renderSVGTransforms = function _renderSVGTransforms2(ratio, cache2) {
  var _ref2 = cache2 || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x = _ref2.x, y = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x), ty = parseFloat(y), a11, a21, a12, a22, temp;
  rotation = parseFloat(rotation);
  skewX = parseFloat(skewX);
  skewY = parseFloat(skewY);
  if (skewY) {
    skewY = parseFloat(skewY);
    skewX += skewY;
    rotation += skewY;
  }
  if (rotation || skewX) {
    rotation *= _DEG2RAD;
    skewX *= _DEG2RAD;
    a11 = Math.cos(rotation) * scaleX;
    a21 = Math.sin(rotation) * scaleX;
    a12 = Math.sin(rotation - skewX) * -scaleY;
    a22 = Math.cos(rotation - skewX) * scaleY;
    if (skewX) {
      skewY *= _DEG2RAD;
      temp = Math.tan(skewX - skewY);
      temp = Math.sqrt(1 + temp * temp);
      a12 *= temp;
      a22 *= temp;
      if (skewY) {
        temp = Math.tan(skewY);
        temp = Math.sqrt(1 + temp * temp);
        a11 *= temp;
        a21 *= temp;
      }
    }
    a11 = _round$1(a11);
    a21 = _round$1(a21);
    a12 = _round$1(a12);
    a22 = _round$1(a22);
  } else {
    a11 = scaleX;
    a22 = scaleY;
    a21 = a12 = 0;
  }
  if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
    tx = _convertToUnit(target, "x", x, "px");
    ty = _convertToUnit(target, "y", y, "px");
  }
  if (xOrigin || yOrigin || xOffset || yOffset) {
    tx = _round$1(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
    ty = _round$1(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
  }
  if (xPercent || yPercent) {
    temp = target.getBBox();
    tx = _round$1(tx + xPercent / 100 * temp.width);
    ty = _round$1(ty + yPercent / 100 * temp.height);
  }
  temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
  target.setAttribute("transform", temp);
  forceCSS && (target.style[_transformProp$1] = temp);
}, _addRotationalPropTween = function _addRotationalPropTween2(plugin, target, property, startNum, endValue) {
  var cap = 360, isString2 = _isString$1(endValue), endNum = parseFloat(endValue) * (isString2 && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = endNum - startNum, finalValue = startNum + change + "deg", direction, pt;
  if (isString2) {
    direction = endValue.split("_")[1];
    if (direction === "short") {
      change %= cap;
      if (change !== change % (cap / 2)) {
        change += change < 0 ? cap : -cap;
      }
    }
    if (direction === "cw" && change < 0) {
      change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
    } else if (direction === "ccw" && change > 0) {
      change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
    }
  }
  plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
  pt.e = finalValue;
  pt.u = "deg";
  plugin._props.push(property);
  return pt;
}, _assign = function _assign2(target, source) {
  for (var p in source) {
    target[p] = source[p];
  }
  return target;
}, _addRawTransformPTs = function _addRawTransformPTs2(plugin, transforms, target) {
  var startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style, endCache, p, startValue, endValue, startNum, endNum, startUnit, endUnit;
  if (startCache.svg) {
    startValue = target.getAttribute("transform");
    target.setAttribute("transform", "");
    style[_transformProp$1] = transforms;
    endCache = _parseTransform(target, 1);
    _removeProperty(target, _transformProp$1);
    target.setAttribute("transform", startValue);
  } else {
    startValue = getComputedStyle(target)[_transformProp$1];
    style[_transformProp$1] = transforms;
    endCache = _parseTransform(target, 1);
    style[_transformProp$1] = startValue;
  }
  for (p in _transformProps) {
    startValue = startCache[p];
    endValue = endCache[p];
    if (startValue !== endValue && exclude.indexOf(p) < 0) {
      startUnit = getUnit(startValue);
      endUnit = getUnit(endValue);
      startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
      endNum = parseFloat(endValue);
      plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
      plugin._pt.u = endUnit || 0;
      plugin._props.push(p);
    }
  }
  _assign(endCache, startCache);
};
_forEachName("padding,margin,Width,Radius", function(name, index) {
  var t = "Top", r = "Right", b = "Bottom", l = "Left", props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function(side) {
    return index < 2 ? name + side : "border" + side + name;
  });
  _specialProps[index > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
    var a, vars;
    if (arguments.length < 4) {
      a = props.map(function(prop) {
        return _get(plugin, prop, property);
      });
      vars = a.join(" ");
      return vars.split(a[0]).length === 5 ? a[0] : vars;
    }
    a = (endValue + "").split(" ");
    vars = {};
    props.forEach(function(prop, i) {
      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
    });
    plugin.init(target, vars, tween);
  };
});
var CSSPlugin = {
  name: "css",
  register: _initCore$1,
  targetTest: function targetTest(target) {
    return target.style && target.nodeType;
  },
  init: function init3(target, vars, tween, index, targets) {
    var props = this._props, style = target.style, startAt = tween.vars.startAt, startValue, endValue, endNum, startNum, type, specialProp, p, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache2, smooth, hasPriority, inlineProps, finalTransformValue;
    _pluginInitted || _initCore$1();
    this.styles = this.styles || _getStyleSaver(target);
    inlineProps = this.styles.props;
    this.tween = tween;
    for (p in vars) {
      if (p === "autoRound") {
        continue;
      }
      endValue = vars[p];
      if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
        continue;
      }
      type = typeof endValue;
      specialProp = _specialProps[p];
      if (type === "function") {
        endValue = endValue.call(tween, index, target, targets);
        type = typeof endValue;
      }
      if (type === "string" && ~endValue.indexOf("random(")) {
        endValue = _replaceRandom(endValue);
      }
      if (specialProp) {
        specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
      } else if (p.substr(0, 2) === "--") {
        startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
        endValue += "";
        _colorExp.lastIndex = 0;
        if (!_colorExp.test(startValue)) {
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
          endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
        }
        this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
        props.push(p);
        inlineProps.push(p, 0, style[p]);
      } else if (type !== "undefined") {
        if (startAt && p in startAt) {
          startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
          _isString$1(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
          getUnit(startValue + "") || startValue === "auto" || (startValue += _config.units[p] || getUnit(_get(target, p)) || "");
          (startValue + "").charAt(1) === "=" && (startValue = _get(target, p));
        } else {
          startValue = _get(target, p);
        }
        startNum = parseFloat(startValue);
        relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
        relative && (endValue = endValue.substr(2));
        endNum = parseFloat(endValue);
        if (p in _propertyAliases) {
          if (p === "autoAlpha") {
            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
              startNum = 0;
            }
            inlineProps.push("visibility", 0, style.visibility);
            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
          }
          if (p !== "scale" && p !== "transform") {
            p = _propertyAliases[p];
            ~p.indexOf(",") && (p = p.split(",")[0]);
          }
        }
        isTransformRelated = p in _transformProps;
        if (isTransformRelated) {
          this.styles.save(p);
          finalTransformValue = endValue;
          if (type === "string" && endValue.substring(0, 6) === "var(--") {
            endValue = _getComputedProperty(target, endValue.substring(4, endValue.indexOf(")")));
            if (endValue.substring(0, 5) === "calc(") {
              var origPerspective = target.style.perspective;
              target.style.perspective = endValue;
              endValue = _getComputedProperty(target, "perspective");
              origPerspective ? target.style.perspective = origPerspective : _removeProperty(target, "perspective");
            }
            endNum = parseFloat(endValue);
          }
          if (!transformPropTween) {
            cache2 = target._gsap;
            cache2.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
            smooth = vars.smoothOrigin !== false && cache2.smooth;
            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp$1, 0, 1, cache2.renderTransform, cache2, 0, -1);
            transformPropTween.dep = 1;
          }
          if (p === "scale") {
            this._pt = new PropTween(this._pt, cache2, "scaleY", cache2.scaleY, (relative ? _parseRelative(cache2.scaleY, relative + endNum) : endNum) - cache2.scaleY || 0, _renderCSSProp);
            this._pt.u = 0;
            props.push("scaleY", p);
            p += "X";
          } else if (p === "transformOrigin") {
            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
            endValue = _convertKeywordsToPercentages(endValue);
            if (cache2.svg) {
              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
            } else {
              endUnit = parseFloat(endValue.split(" ")[2]) || 0;
              endUnit !== cache2.zOrigin && _addNonTweeningPT(this, cache2, "zOrigin", cache2.zOrigin, endUnit);
              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
            }
            continue;
          } else if (p === "svgOrigin") {
            _applySVGOrigin(target, endValue, 1, smooth, 0, this);
            continue;
          } else if (p in _rotationalProperties) {
            _addRotationalPropTween(this, cache2, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
            continue;
          } else if (p === "smoothOrigin") {
            _addNonTweeningPT(this, cache2, "smooth", cache2.smooth, endValue);
            continue;
          } else if (p === "force3D") {
            cache2[p] = endValue;
            continue;
          } else if (p === "transform") {
            _addRawTransformPTs(this, endValue, target);
            continue;
          }
        } else if (!(p in style)) {
          p = _checkPropPrefix(p) || p;
        }
        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
          startUnit = (startValue + "").substr((startNum + "").length);
          endNum || (endNum = 0);
          endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
          this._pt = new PropTween(this._pt, isTransformRelated ? cache2 : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
          this._pt.u = endUnit || 0;
          if (isTransformRelated && finalTransformValue !== endValue) {
            this._pt.b = startValue;
            this._pt.e = finalTransformValue;
            this._pt.r = _renderCSSPropWithBeginningAndEnd;
          } else if (startUnit !== endUnit && endUnit !== "%") {
            this._pt.b = startValue;
            this._pt.r = _renderCSSPropWithBeginning;
          }
        } else if (!(p in style)) {
          if (p in target) {
            this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
          } else if (p !== "parseTransform") {
            _missingPlugin(p, endValue);
            continue;
          }
        } else {
          _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
        }
        isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : typeof target[p] === "function" ? inlineProps.push(p, 2, target[p]()) : inlineProps.push(p, 1, startValue || target[p]));
        props.push(p);
      }
    }
    hasPriority && _sortPropTweensByPriority(this);
  },
  render: function render2(ratio, data) {
    if (data.tween._time || !_reverting()) {
      var pt = data._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    } else {
      data.styles.revert();
    }
  },
  get: _get,
  aliases: _propertyAliases,
  getSetter: function getSetter(target, property, plugin) {
    var p = _propertyAliases[property];
    p && p.indexOf(",") < 0 && (property = p);
    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
  },
  core: {
    _removeProperty,
    _getMatrix
  }
};
gsap$2.utils.checkPrefix = _checkPropPrefix;
gsap$2.core.getStyleSaver = _getStyleSaver;
(function(positionAndScale, rotation, others, aliases) {
  var all = _forEachName(positionAndScale + "," + rotation + "," + others, function(name) {
    _transformProps[name] = 1;
  });
  _forEachName(rotation, function(name) {
    _config.units[name] = "deg";
    _rotationalProperties[name] = 1;
  });
  _propertyAliases[all[13]] = positionAndScale + "," + rotation;
  _forEachName(aliases, function(name) {
    var split2 = name.split(":");
    _propertyAliases[split2[1]] = all[split2[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
_forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(name) {
  _config.units[name] = "px";
});
gsap$2.registerPlugin(CSSPlugin);
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  return Constructor;
}
var gsap$1, _coreInitted$1, _win$1, _doc$1, _docEl$1, _body$1, _isTouch, _pointerType, ScrollTrigger$1, _root$1, _normalizer$1, _eventTypes, _context$1, _getGSAP$1 = function _getGSAP() {
  return gsap$1 || typeof window !== "undefined" && (gsap$1 = window.gsap) && gsap$1.registerPlugin && gsap$1;
}, _startup$1 = 1, _observers = [], _scrollers = [], _proxies = [], _getTime$1 = Date.now, _bridge = function _bridge2(name, value) {
  return value;
}, _integrate = function _integrate2() {
  var core = ScrollTrigger$1.core, data = core.bridge || {}, scrollers = core._scrollers, proxies = core._proxies;
  scrollers.push.apply(scrollers, _scrollers);
  proxies.push.apply(proxies, _proxies);
  _scrollers = scrollers;
  _proxies = proxies;
  _bridge = function _bridge3(name, value) {
    return data[name](value);
  };
}, _getProxyProp = function _getProxyProp2(element, property) {
  return ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property];
}, _isViewport$1 = function _isViewport(el) {
  return !!~_root$1.indexOf(el);
}, _addListener$1 = function _addListener(element, type, func, passive, capture) {
  return element.addEventListener(type, func, {
    passive: passive !== false,
    capture: !!capture
  });
}, _removeListener$1 = function _removeListener(element, type, func, capture) {
  return element.removeEventListener(type, func, !!capture);
}, _scrollLeft = "scrollLeft", _scrollTop = "scrollTop", _onScroll$1 = function _onScroll() {
  return _normalizer$1 && _normalizer$1.isPressed || _scrollers.cache++;
}, _scrollCacheFunc = function _scrollCacheFunc2(f, doNotCache) {
  var cachingFunc = function cachingFunc2(value) {
    if (value || value === 0) {
      _startup$1 && (_win$1.history.scrollRestoration = "manual");
      var isNormalizing = _normalizer$1 && _normalizer$1.isPressed;
      value = cachingFunc2.v = Math.round(value) || (_normalizer$1 && _normalizer$1.iOS ? 1 : 0);
      f(value);
      cachingFunc2.cacheID = _scrollers.cache;
      isNormalizing && _bridge("ss", value);
    } else if (doNotCache || _scrollers.cache !== cachingFunc2.cacheID || _bridge("ref")) {
      cachingFunc2.cacheID = _scrollers.cache;
      cachingFunc2.v = f();
    }
    return cachingFunc2.v + cachingFunc2.offset;
  };
  cachingFunc.offset = 0;
  return f && cachingFunc;
}, _horizontal = {
  s: _scrollLeft,
  p: "left",
  p2: "Left",
  os: "right",
  os2: "Right",
  d: "width",
  d2: "Width",
  a: "x",
  sc: _scrollCacheFunc(function(value) {
    return arguments.length ? _win$1.scrollTo(value, _vertical.sc()) : _win$1.pageXOffset || _doc$1[_scrollLeft] || _docEl$1[_scrollLeft] || _body$1[_scrollLeft] || 0;
  })
}, _vertical = {
  s: _scrollTop,
  p: "top",
  p2: "Top",
  os: "bottom",
  os2: "Bottom",
  d: "height",
  d2: "Height",
  a: "y",
  op: _horizontal,
  sc: _scrollCacheFunc(function(value) {
    return arguments.length ? _win$1.scrollTo(_horizontal.sc(), value) : _win$1.pageYOffset || _doc$1[_scrollTop] || _docEl$1[_scrollTop] || _body$1[_scrollTop] || 0;
  })
}, _getTarget = function _getTarget2(t, self2) {
  return (self2 && self2._ctx && self2._ctx.selector || gsap$1.utils.toArray)(t)[0] || (typeof t === "string" && gsap$1.config().nullTargetWarn !== false ? console.warn("Element not found:", t) : null);
}, _isWithin = function _isWithin2(element, list) {
  var i = list.length;
  while (i--) {
    if (list[i] === element || list[i].contains(element)) {
      return true;
    }
  }
  return false;
}, _getScrollFunc = function _getScrollFunc2(element, _ref) {
  var s = _ref.s, sc = _ref.sc;
  _isViewport$1(element) && (element = _doc$1.scrollingElement || _docEl$1);
  var i = _scrollers.indexOf(element), offset = sc === _vertical.sc ? 1 : 2;
  !~i && (i = _scrollers.push(element) - 1);
  _scrollers[i + offset] || _addListener$1(element, "scroll", _onScroll$1);
  var prev = _scrollers[i + offset], func = prev || (_scrollers[i + offset] = _scrollCacheFunc(_getProxyProp(element, s), true) || (_isViewport$1(element) ? sc : _scrollCacheFunc(function(value) {
    return arguments.length ? element[s] = value : element[s];
  })));
  func.target = element;
  prev || (func.smooth = gsap$1.getProperty(element, "scrollBehavior") === "smooth");
  return func;
}, _getVelocityProp = function _getVelocityProp2(value, minTimeRefresh, useDelta) {
  var v1 = value, v2 = value, t1 = _getTime$1(), t2 = t1, min = minTimeRefresh || 50, dropToZeroTime = Math.max(500, min * 3), update = function update2(value2, force) {
    var t = _getTime$1();
    if (force || t - t1 > min) {
      v2 = v1;
      v1 = value2;
      t2 = t1;
      t1 = t;
    } else if (useDelta) {
      v1 += value2;
    } else {
      v1 = v2 + (value2 - v2) / (t - t2) * (t1 - t2);
    }
  }, reset = function reset2() {
    v2 = v1 = useDelta ? 0 : v1;
    t2 = t1 = 0;
  }, getVelocity = function getVelocity2(latestValue) {
    var tOld = t2, vOld = v2, t = _getTime$1();
    (latestValue || latestValue === 0) && latestValue !== v1 && update(latestValue);
    return t1 === t2 || t - t2 > dropToZeroTime ? 0 : (v1 + (useDelta ? vOld : -vOld)) / ((useDelta ? t : t1) - tOld) * 1e3;
  };
  return {
    update,
    reset,
    getVelocity
  };
}, _getEvent = function _getEvent2(e, preventDefault) {
  preventDefault && !e._gsapAllow && e.preventDefault();
  return e.changedTouches ? e.changedTouches[0] : e;
}, _getAbsoluteMax = function _getAbsoluteMax2(a) {
  var max = Math.max.apply(Math, a), min = Math.min.apply(Math, a);
  return Math.abs(max) >= Math.abs(min) ? max : min;
}, _setScrollTrigger = function _setScrollTrigger2() {
  ScrollTrigger$1 = gsap$1.core.globals().ScrollTrigger;
  ScrollTrigger$1 && ScrollTrigger$1.core && _integrate();
}, _initCore = function _initCore3(core) {
  gsap$1 = core || _getGSAP$1();
  if (!_coreInitted$1 && gsap$1 && typeof document !== "undefined" && document.body) {
    _win$1 = window;
    _doc$1 = document;
    _docEl$1 = _doc$1.documentElement;
    _body$1 = _doc$1.body;
    _root$1 = [_win$1, _doc$1, _docEl$1, _body$1];
    gsap$1.utils.clamp;
    _context$1 = gsap$1.core.context || function() {
    };
    _pointerType = "onpointerenter" in _body$1 ? "pointer" : "mouse";
    _isTouch = Observer.isTouch = _win$1.matchMedia && _win$1.matchMedia("(hover: none), (pointer: coarse)").matches ? 1 : "ontouchstart" in _win$1 || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 ? 2 : 0;
    _eventTypes = Observer.eventTypes = ("ontouchstart" in _docEl$1 ? "touchstart,touchmove,touchcancel,touchend" : !("onpointerdown" in _docEl$1) ? "mousedown,mousemove,mouseup,mouseup" : "pointerdown,pointermove,pointercancel,pointerup").split(",");
    setTimeout(function() {
      return _startup$1 = 0;
    }, 500);
    _setScrollTrigger();
    _coreInitted$1 = 1;
  }
  return _coreInitted$1;
};
_horizontal.op = _vertical;
_scrollers.cache = 0;
var Observer = /* @__PURE__ */ (function() {
  function Observer2(vars) {
    this.init(vars);
  }
  var _proto = Observer2.prototype;
  _proto.init = function init4(vars) {
    _coreInitted$1 || _initCore(gsap$1) || console.warn("Please gsap.registerPlugin(Observer)");
    ScrollTrigger$1 || _setScrollTrigger();
    var tolerance = vars.tolerance, dragMinimum = vars.dragMinimum, type = vars.type, target = vars.target, lineHeight = vars.lineHeight, debounce = vars.debounce, preventDefault = vars.preventDefault, onStop = vars.onStop, onStopDelay = vars.onStopDelay, ignore = vars.ignore, wheelSpeed = vars.wheelSpeed, event = vars.event, onDragStart = vars.onDragStart, onDragEnd = vars.onDragEnd, onDrag = vars.onDrag, onPress = vars.onPress, onRelease = vars.onRelease, onRight = vars.onRight, onLeft = vars.onLeft, onUp = vars.onUp, onDown = vars.onDown, onChangeX = vars.onChangeX, onChangeY = vars.onChangeY, onChange = vars.onChange, onToggleX = vars.onToggleX, onToggleY = vars.onToggleY, onHover = vars.onHover, onHoverEnd = vars.onHoverEnd, onMove = vars.onMove, ignoreCheck = vars.ignoreCheck, isNormalizer = vars.isNormalizer, onGestureStart = vars.onGestureStart, onGestureEnd = vars.onGestureEnd, onWheel = vars.onWheel, onEnable = vars.onEnable, onDisable = vars.onDisable, onClick = vars.onClick, scrollSpeed = vars.scrollSpeed, capture = vars.capture, allowClicks = vars.allowClicks, lockAxis = vars.lockAxis, onLockAxis = vars.onLockAxis;
    this.target = target = _getTarget(target) || _docEl$1;
    this.vars = vars;
    ignore && (ignore = gsap$1.utils.toArray(ignore));
    tolerance = tolerance || 1e-9;
    dragMinimum = dragMinimum || 0;
    wheelSpeed = wheelSpeed || 1;
    scrollSpeed = scrollSpeed || 1;
    type = type || "wheel,touch,pointer";
    debounce = debounce !== false;
    lineHeight || (lineHeight = parseFloat(_win$1.getComputedStyle(_body$1).lineHeight) || 22);
    var id, onStopDelayedCall, dragged, moved, wheeled, locked, axis, self2 = this, prevDeltaX = 0, prevDeltaY = 0, passive = vars.passive || !preventDefault && vars.passive !== false, scrollFuncX = _getScrollFunc(target, _horizontal), scrollFuncY = _getScrollFunc(target, _vertical), scrollX = scrollFuncX(), scrollY = scrollFuncY(), limitToTouch = ~type.indexOf("touch") && !~type.indexOf("pointer") && _eventTypes[0] === "pointerdown", isViewport = _isViewport$1(target), ownerDoc = target.ownerDocument || _doc$1, deltaX = [0, 0, 0], deltaY = [0, 0, 0], onClickTime = 0, clickCapture = function clickCapture2() {
      return onClickTime = _getTime$1();
    }, _ignoreCheck = function _ignoreCheck2(e, isPointerOrTouch) {
      return (self2.event = e) && ignore && _isWithin(e.target, ignore) || isPointerOrTouch && limitToTouch && e.pointerType !== "touch" || ignoreCheck && ignoreCheck(e, isPointerOrTouch);
    }, onStopFunc = function onStopFunc2() {
      self2._vx.reset();
      self2._vy.reset();
      onStopDelayedCall.pause();
      onStop && onStop(self2);
    }, update = function update2() {
      var dx = self2.deltaX = _getAbsoluteMax(deltaX), dy = self2.deltaY = _getAbsoluteMax(deltaY), changedX = Math.abs(dx) >= tolerance, changedY = Math.abs(dy) >= tolerance;
      onChange && (changedX || changedY) && onChange(self2, dx, dy, deltaX, deltaY);
      if (changedX) {
        onRight && self2.deltaX > 0 && onRight(self2);
        onLeft && self2.deltaX < 0 && onLeft(self2);
        onChangeX && onChangeX(self2);
        onToggleX && self2.deltaX < 0 !== prevDeltaX < 0 && onToggleX(self2);
        prevDeltaX = self2.deltaX;
        deltaX[0] = deltaX[1] = deltaX[2] = 0;
      }
      if (changedY) {
        onDown && self2.deltaY > 0 && onDown(self2);
        onUp && self2.deltaY < 0 && onUp(self2);
        onChangeY && onChangeY(self2);
        onToggleY && self2.deltaY < 0 !== prevDeltaY < 0 && onToggleY(self2);
        prevDeltaY = self2.deltaY;
        deltaY[0] = deltaY[1] = deltaY[2] = 0;
      }
      if (moved || dragged) {
        onMove && onMove(self2);
        if (dragged) {
          onDragStart && dragged === 1 && onDragStart(self2);
          onDrag && onDrag(self2);
          dragged = 0;
        }
        moved = false;
      }
      locked && !(locked = false) && onLockAxis && onLockAxis(self2);
      if (wheeled) {
        onWheel(self2);
        wheeled = false;
      }
      id = 0;
    }, onDelta = function onDelta2(x, y, index) {
      deltaX[index] += x;
      deltaY[index] += y;
      self2._vx.update(x);
      self2._vy.update(y);
      debounce ? id || (id = requestAnimationFrame(update)) : update();
    }, onTouchOrPointerDelta = function onTouchOrPointerDelta2(x, y) {
      if (lockAxis && !axis) {
        self2.axis = axis = Math.abs(x) > Math.abs(y) ? "x" : "y";
        locked = true;
      }
      if (axis !== "y") {
        deltaX[2] += x;
        self2._vx.update(x, true);
      }
      if (axis !== "x") {
        deltaY[2] += y;
        self2._vy.update(y, true);
      }
      debounce ? id || (id = requestAnimationFrame(update)) : update();
    }, _onDrag = function _onDrag2(e) {
      if (_ignoreCheck(e, 1)) {
        return;
      }
      e = _getEvent(e, preventDefault);
      var x = e.clientX, y = e.clientY, dx = x - self2.x, dy = y - self2.y, isDragging = self2.isDragging;
      self2.x = x;
      self2.y = y;
      if (isDragging || (dx || dy) && (Math.abs(self2.startX - x) >= dragMinimum || Math.abs(self2.startY - y) >= dragMinimum)) {
        dragged || (dragged = isDragging ? 2 : 1);
        isDragging || (self2.isDragging = true);
        onTouchOrPointerDelta(dx, dy);
      }
    }, _onPress = self2.onPress = function(e) {
      if (_ignoreCheck(e, 1) || e && e.button) {
        return;
      }
      self2.axis = axis = null;
      onStopDelayedCall.pause();
      self2.isPressed = true;
      e = _getEvent(e);
      prevDeltaX = prevDeltaY = 0;
      self2.startX = self2.x = e.clientX;
      self2.startY = self2.y = e.clientY;
      self2._vx.reset();
      self2._vy.reset();
      _addListener$1(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, passive, true);
      self2.deltaX = self2.deltaY = 0;
      onPress && onPress(self2);
    }, _onRelease = self2.onRelease = function(e) {
      if (_ignoreCheck(e, 1)) {
        return;
      }
      _removeListener$1(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, true);
      var isTrackingDrag = !isNaN(self2.y - self2.startY), wasDragging = self2.isDragging, isDragNotClick = wasDragging && (Math.abs(self2.x - self2.startX) > 3 || Math.abs(self2.y - self2.startY) > 3), eventData = _getEvent(e);
      if (!isDragNotClick && isTrackingDrag) {
        self2._vx.reset();
        self2._vy.reset();
        if (preventDefault && allowClicks) {
          gsap$1.delayedCall(0.08, function() {
            if (_getTime$1() - onClickTime > 300 && !e.defaultPrevented) {
              if (e.target.click) {
                e.target.click();
              } else if (ownerDoc.createEvent) {
                var syntheticEvent = ownerDoc.createEvent("MouseEvents");
                syntheticEvent.initMouseEvent("click", true, true, _win$1, 1, eventData.screenX, eventData.screenY, eventData.clientX, eventData.clientY, false, false, false, false, 0, null);
                e.target.dispatchEvent(syntheticEvent);
              }
            }
          });
        }
      }
      self2.isDragging = self2.isGesturing = self2.isPressed = false;
      onStop && wasDragging && !isNormalizer && onStopDelayedCall.restart(true);
      dragged && update();
      onDragEnd && wasDragging && onDragEnd(self2);
      onRelease && onRelease(self2, isDragNotClick);
    }, _onGestureStart = function _onGestureStart2(e) {
      return e.touches && e.touches.length > 1 && (self2.isGesturing = true) && onGestureStart(e, self2.isDragging);
    }, _onGestureEnd = function _onGestureEnd2() {
      return (self2.isGesturing = false) || onGestureEnd(self2);
    }, onScroll = function onScroll2(e) {
      if (_ignoreCheck(e)) {
        return;
      }
      var x = scrollFuncX(), y = scrollFuncY();
      onDelta((x - scrollX) * scrollSpeed, (y - scrollY) * scrollSpeed, 1);
      scrollX = x;
      scrollY = y;
      onStop && onStopDelayedCall.restart(true);
    }, _onWheel = function _onWheel2(e) {
      if (_ignoreCheck(e)) {
        return;
      }
      e = _getEvent(e, preventDefault);
      onWheel && (wheeled = true);
      var multiplier = (e.deltaMode === 1 ? lineHeight : e.deltaMode === 2 ? _win$1.innerHeight : 1) * wheelSpeed;
      onDelta(e.deltaX * multiplier, e.deltaY * multiplier, 0);
      onStop && !isNormalizer && onStopDelayedCall.restart(true);
    }, _onMove = function _onMove2(e) {
      if (_ignoreCheck(e)) {
        return;
      }
      var x = e.clientX, y = e.clientY, dx = x - self2.x, dy = y - self2.y;
      self2.x = x;
      self2.y = y;
      moved = true;
      onStop && onStopDelayedCall.restart(true);
      (dx || dy) && onTouchOrPointerDelta(dx, dy);
    }, _onHover = function _onHover2(e) {
      self2.event = e;
      onHover(self2);
    }, _onHoverEnd = function _onHoverEnd2(e) {
      self2.event = e;
      onHoverEnd(self2);
    }, _onClick = function _onClick2(e) {
      return _ignoreCheck(e) || _getEvent(e, preventDefault) && onClick(self2);
    };
    onStopDelayedCall = self2._dc = gsap$1.delayedCall(onStopDelay || 0.25, onStopFunc).pause();
    self2.deltaX = self2.deltaY = 0;
    self2._vx = _getVelocityProp(0, 50, true);
    self2._vy = _getVelocityProp(0, 50, true);
    self2.scrollX = scrollFuncX;
    self2.scrollY = scrollFuncY;
    self2.isDragging = self2.isGesturing = self2.isPressed = false;
    _context$1(this);
    self2.enable = function(e) {
      if (!self2.isEnabled) {
        _addListener$1(isViewport ? ownerDoc : target, "scroll", _onScroll$1);
        type.indexOf("scroll") >= 0 && _addListener$1(isViewport ? ownerDoc : target, "scroll", onScroll, passive, capture);
        type.indexOf("wheel") >= 0 && _addListener$1(target, "wheel", _onWheel, passive, capture);
        if (type.indexOf("touch") >= 0 && _isTouch || type.indexOf("pointer") >= 0) {
          _addListener$1(target, _eventTypes[0], _onPress, passive, capture);
          _addListener$1(ownerDoc, _eventTypes[2], _onRelease);
          _addListener$1(ownerDoc, _eventTypes[3], _onRelease);
          allowClicks && _addListener$1(target, "click", clickCapture, true, true);
          onClick && _addListener$1(target, "click", _onClick);
          onGestureStart && _addListener$1(ownerDoc, "gesturestart", _onGestureStart);
          onGestureEnd && _addListener$1(ownerDoc, "gestureend", _onGestureEnd);
          onHover && _addListener$1(target, _pointerType + "enter", _onHover);
          onHoverEnd && _addListener$1(target, _pointerType + "leave", _onHoverEnd);
          onMove && _addListener$1(target, _pointerType + "move", _onMove);
        }
        self2.isEnabled = true;
        self2.isDragging = self2.isGesturing = self2.isPressed = moved = dragged = false;
        self2._vx.reset();
        self2._vy.reset();
        scrollX = scrollFuncX();
        scrollY = scrollFuncY();
        e && e.type && _onPress(e);
        onEnable && onEnable(self2);
      }
      return self2;
    };
    self2.disable = function() {
      if (self2.isEnabled) {
        _observers.filter(function(o) {
          return o !== self2 && _isViewport$1(o.target);
        }).length || _removeListener$1(isViewport ? ownerDoc : target, "scroll", _onScroll$1);
        if (self2.isPressed) {
          self2._vx.reset();
          self2._vy.reset();
          _removeListener$1(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, true);
        }
        _removeListener$1(isViewport ? ownerDoc : target, "scroll", onScroll, capture);
        _removeListener$1(target, "wheel", _onWheel, capture);
        _removeListener$1(target, _eventTypes[0], _onPress, capture);
        _removeListener$1(ownerDoc, _eventTypes[2], _onRelease);
        _removeListener$1(ownerDoc, _eventTypes[3], _onRelease);
        _removeListener$1(target, "click", clickCapture, true);
        _removeListener$1(target, "click", _onClick);
        _removeListener$1(ownerDoc, "gesturestart", _onGestureStart);
        _removeListener$1(ownerDoc, "gestureend", _onGestureEnd);
        _removeListener$1(target, _pointerType + "enter", _onHover);
        _removeListener$1(target, _pointerType + "leave", _onHoverEnd);
        _removeListener$1(target, _pointerType + "move", _onMove);
        self2.isEnabled = self2.isPressed = self2.isDragging = false;
        onDisable && onDisable(self2);
      }
    };
    self2.kill = self2.revert = function() {
      self2.disable();
      var i = _observers.indexOf(self2);
      i >= 0 && _observers.splice(i, 1);
      _normalizer$1 === self2 && (_normalizer$1 = 0);
    };
    _observers.push(self2);
    isNormalizer && _isViewport$1(target) && (_normalizer$1 = self2);
    self2.enable(event);
  };
  _createClass(Observer2, [{
    key: "velocityX",
    get: function get2() {
      return this._vx.getVelocity();
    }
  }, {
    key: "velocityY",
    get: function get2() {
      return this._vy.getVelocity();
    }
  }]);
  return Observer2;
})();
Observer.version = "3.14.1";
Observer.create = function(vars) {
  return new Observer(vars);
};
Observer.register = _initCore;
Observer.getAll = function() {
  return _observers.slice();
};
Observer.getById = function(id) {
  return _observers.filter(function(o) {
    return o.vars.id === id;
  })[0];
};
_getGSAP$1() && gsap$1.registerPlugin(Observer);
var gsap, _coreInitted, _win, _doc, _docEl, _body, _root, _resizeDelay, _toArray, _clamp, _time2, _syncInterval, _refreshing, _pointerIsDown, _transformProp, _i, _prevWidth, _prevHeight, _autoRefresh, _sort, _suppressOverwrites, _ignoreResize, _normalizer, _ignoreMobileResize, _baseScreenHeight, _baseScreenWidth, _fixIOSBug, _context, _scrollRestoration, _div100vh, _100vh, _isReverted, _clampingMax, _limitCallbacks, _startup = 1, _getTime = Date.now, _time1 = _getTime(), _lastScrollTime = 0, _enabled = 0, _parseClamp = function _parseClamp2(value, type, self2) {
  var clamp3 = _isString(value) && (value.substr(0, 6) === "clamp(" || value.indexOf("max") > -1);
  self2["_" + type + "Clamp"] = clamp3;
  return clamp3 ? value.substr(6, value.length - 7) : value;
}, _keepClamp = function _keepClamp2(value, clamp3) {
  return clamp3 && (!_isString(value) || value.substr(0, 6) !== "clamp(") ? "clamp(" + value + ")" : value;
}, _rafBugFix = function _rafBugFix2() {
  return _enabled && requestAnimationFrame(_rafBugFix2);
}, _pointerDownHandler = function _pointerDownHandler2() {
  return _pointerIsDown = 1;
}, _pointerUpHandler = function _pointerUpHandler2() {
  return _pointerIsDown = 0;
}, _passThrough = function _passThrough3(v) {
  return v;
}, _round = function _round3(value) {
  return Math.round(value * 1e5) / 1e5 || 0;
}, _windowExists = function _windowExists3() {
  return typeof window !== "undefined";
}, _getGSAP2 = function _getGSAP3() {
  return gsap || _windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap;
}, _isViewport2 = function _isViewport3(e) {
  return !!~_root.indexOf(e);
}, _getViewportDimension = function _getViewportDimension2(dimensionProperty) {
  return (dimensionProperty === "Height" ? _100vh : _win["inner" + dimensionProperty]) || _docEl["client" + dimensionProperty] || _body["client" + dimensionProperty];
}, _getBoundsFunc = function _getBoundsFunc2(element) {
  return _getProxyProp(element, "getBoundingClientRect") || (_isViewport2(element) ? function() {
    _winOffsets.width = _win.innerWidth;
    _winOffsets.height = _100vh;
    return _winOffsets;
  } : function() {
    return _getBounds(element);
  });
}, _getSizeFunc = function _getSizeFunc2(scroller, isViewport, _ref) {
  var d = _ref.d, d2 = _ref.d2, a = _ref.a;
  return (a = _getProxyProp(scroller, "getBoundingClientRect")) ? function() {
    return a()[d];
  } : function() {
    return (isViewport ? _getViewportDimension(d2) : scroller["client" + d2]) || 0;
  };
}, _getOffsetsFunc = function _getOffsetsFunc2(element, isViewport) {
  return !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : function() {
    return _winOffsets;
  };
}, _maxScroll = function _maxScroll2(element, _ref2) {
  var s = _ref2.s, d2 = _ref2.d2, d = _ref2.d, a = _ref2.a;
  return Math.max(0, (s = "scroll" + d2) && (a = _getProxyProp(element, s)) ? a() - _getBoundsFunc(element)()[d] : _isViewport2(element) ? (_docEl[s] || _body[s]) - _getViewportDimension(d2) : element[s] - element["offset" + d2]);
}, _iterateAutoRefresh = function _iterateAutoRefresh2(func, events) {
  for (var i = 0; i < _autoRefresh.length; i += 3) {
    (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
  }
}, _isString = function _isString3(value) {
  return typeof value === "string";
}, _isFunction = function _isFunction3(value) {
  return typeof value === "function";
}, _isNumber = function _isNumber3(value) {
  return typeof value === "number";
}, _isObject = function _isObject3(value) {
  return typeof value === "object";
}, _endAnimation = function _endAnimation2(animation, reversed, pause) {
  return animation && animation.progress(reversed ? 0 : 1) && pause && animation.pause();
}, _callback = function _callback3(self2, func) {
  if (self2.enabled) {
    var result = self2._ctx ? self2._ctx.add(function() {
      return func(self2);
    }) : func(self2);
    result && result.totalTime && (self2.callbackAnimation = result);
  }
}, _abs = Math.abs, _left = "left", _top = "top", _right = "right", _bottom = "bottom", _width = "width", _height = "height", _Right = "Right", _Left = "Left", _Top = "Top", _Bottom = "Bottom", _padding = "padding", _margin = "margin", _Width = "Width", _Height = "Height", _px = "px", _getComputedStyle = function _getComputedStyle2(element) {
  return _win.getComputedStyle(element);
}, _makePositionable = function _makePositionable2(element) {
  var position = _getComputedStyle(element).position;
  element.style.position = position === "absolute" || position === "fixed" ? position : "relative";
}, _setDefaults = function _setDefaults3(obj, defaults3) {
  for (var p in defaults3) {
    p in obj || (obj[p] = defaults3[p]);
  }
  return obj;
}, _getBounds = function _getBounds2(element, withoutTransforms) {
  var tween = withoutTransforms && _getComputedStyle(element)[_transformProp] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap.to(element, {
    x: 0,
    y: 0,
    xPercent: 0,
    yPercent: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    scale: 1,
    skewX: 0,
    skewY: 0
  }).progress(1), bounds = element.getBoundingClientRect();
  tween && tween.progress(0).kill();
  return bounds;
}, _getSize = function _getSize2(element, _ref3) {
  var d2 = _ref3.d2;
  return element["offset" + d2] || element["client" + d2] || 0;
}, _getLabelRatioArray = function _getLabelRatioArray2(timeline2) {
  var a = [], labels = timeline2.labels, duration = timeline2.duration(), p;
  for (p in labels) {
    a.push(labels[p] / duration);
  }
  return a;
}, _getClosestLabel = function _getClosestLabel2(animation) {
  return function(value) {
    return gsap.utils.snap(_getLabelRatioArray(animation), value);
  };
}, _snapDirectional = function _snapDirectional2(snapIncrementOrArray) {
  var snap3 = gsap.utils.snap(snapIncrementOrArray), a = Array.isArray(snapIncrementOrArray) && snapIncrementOrArray.slice(0).sort(function(a2, b) {
    return a2 - b;
  });
  return a ? function(value, direction, threshold) {
    if (threshold === void 0) {
      threshold = 1e-3;
    }
    var i;
    if (!direction) {
      return snap3(value);
    }
    if (direction > 0) {
      value -= threshold;
      for (i = 0; i < a.length; i++) {
        if (a[i] >= value) {
          return a[i];
        }
      }
      return a[i - 1];
    } else {
      i = a.length;
      value += threshold;
      while (i--) {
        if (a[i] <= value) {
          return a[i];
        }
      }
    }
    return a[0];
  } : function(value, direction, threshold) {
    if (threshold === void 0) {
      threshold = 1e-3;
    }
    var snapped = snap3(value);
    return !direction || Math.abs(snapped - value) < threshold || snapped - value < 0 === direction < 0 ? snapped : snap3(direction < 0 ? value - snapIncrementOrArray : value + snapIncrementOrArray);
  };
}, _getLabelAtDirection = function _getLabelAtDirection2(timeline2) {
  return function(value, st) {
    return _snapDirectional(_getLabelRatioArray(timeline2))(value, st.direction);
  };
}, _multiListener = function _multiListener2(func, element, types, callback) {
  return types.split(",").forEach(function(type) {
    return func(element, type, callback);
  });
}, _addListener2 = function _addListener3(element, type, func, nonPassive, capture) {
  return element.addEventListener(type, func, {
    passive: !nonPassive,
    capture: !!capture
  });
}, _removeListener2 = function _removeListener3(element, type, func, capture) {
  return element.removeEventListener(type, func, !!capture);
}, _wheelListener = function _wheelListener2(func, el, scrollFunc) {
  scrollFunc = scrollFunc && scrollFunc.wheelHandler;
  if (scrollFunc) {
    func(el, "wheel", scrollFunc);
    func(el, "touchmove", scrollFunc);
  }
}, _markerDefaults = {
  startColor: "green",
  endColor: "red",
  indent: 0,
  fontSize: "16px",
  fontWeight: "normal"
}, _defaults = {
  toggleActions: "play",
  anticipatePin: 0
}, _keywords = {
  top: 0,
  left: 0,
  center: 0.5,
  bottom: 1,
  right: 1
}, _offsetToPx = function _offsetToPx2(value, size) {
  if (_isString(value)) {
    var eqIndex = value.indexOf("="), relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;
    if (~eqIndex) {
      value.indexOf("%") > eqIndex && (relative *= size / 100);
      value = value.substr(0, eqIndex - 1);
    }
    value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
  }
  return value;
}, _createMarker = function _createMarker2(type, name, container, direction, _ref4, offset, matchWidthEl, containerAnimation) {
  var startColor = _ref4.startColor, endColor = _ref4.endColor, fontSize = _ref4.fontSize, indent = _ref4.indent, fontWeight = _ref4.fontWeight;
  var e = _doc.createElement("div"), useFixedPosition = _isViewport2(container) || _getProxyProp(container, "pinType") === "fixed", isScroller = type.indexOf("scroller") !== -1, parent = useFixedPosition ? _body : container, isStart = type.indexOf("start") !== -1, color = isStart ? startColor : endColor, css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
  css += "position:" + ((isScroller || containerAnimation) && useFixedPosition ? "fixed;" : "absolute;");
  (isScroller || containerAnimation || !useFixedPosition) && (css += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
  matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
  e._isStart = isStart;
  e.setAttribute("class", "gsap-marker-" + type + (name ? " marker-" + name : ""));
  e.style.cssText = css;
  e.innerText = name || name === 0 ? type + "-" + name : type;
  parent.children[0] ? parent.insertBefore(e, parent.children[0]) : parent.appendChild(e);
  e._offset = e["offset" + direction.op.d2];
  _positionMarker(e, 0, direction, isStart);
  return e;
}, _positionMarker = function _positionMarker2(marker, start, direction, flipped) {
  var vars = {
    display: "block"
  }, side = direction[flipped ? "os2" : "p2"], oppositeSide = direction[flipped ? "p2" : "os2"];
  marker._isFlipped = flipped;
  vars[direction.a + "Percent"] = flipped ? -100 : 0;
  vars[direction.a] = flipped ? "1px" : 0;
  vars["border" + side + _Width] = 1;
  vars["border" + oppositeSide + _Width] = 0;
  vars[direction.p] = start + "px";
  gsap.set(marker, vars);
}, _triggers = [], _ids = {}, _rafID, _sync = function _sync2() {
  return _getTime() - _lastScrollTime > 34 && (_rafID || (_rafID = requestAnimationFrame(_updateAll)));
}, _onScroll2 = function _onScroll3() {
  if (!_normalizer || !_normalizer.isPressed || _normalizer.startX > _body.clientWidth) {
    _scrollers.cache++;
    if (_normalizer) {
      _rafID || (_rafID = requestAnimationFrame(_updateAll));
    } else {
      _updateAll();
    }
    _lastScrollTime || _dispatch("scrollStart");
    _lastScrollTime = _getTime();
  }
}, _setBaseDimensions = function _setBaseDimensions2() {
  _baseScreenWidth = _win.innerWidth;
  _baseScreenHeight = _win.innerHeight;
}, _onResize = function _onResize2(force) {
  _scrollers.cache++;
  (force === true || !_refreshing && !_ignoreResize && !_doc.fullscreenElement && !_doc.webkitFullscreenElement && (!_ignoreMobileResize || _baseScreenWidth !== _win.innerWidth || Math.abs(_win.innerHeight - _baseScreenHeight) > _win.innerHeight * 0.25)) && _resizeDelay.restart(true);
}, _listeners = {}, _emptyArray = [], _softRefresh = function _softRefresh2() {
  return _removeListener2(ScrollTrigger, "scrollEnd", _softRefresh2) || _refreshAll(true);
}, _dispatch = function _dispatch3(type) {
  return _listeners[type] && _listeners[type].map(function(f) {
    return f();
  }) || _emptyArray;
}, _savedStyles = [], _revertRecorded = function _revertRecorded2(media) {
  for (var i = 0; i < _savedStyles.length; i += 5) {
    if (!media || _savedStyles[i + 4] && _savedStyles[i + 4].query === media) {
      _savedStyles[i].style.cssText = _savedStyles[i + 1];
      _savedStyles[i].getBBox && _savedStyles[i].setAttribute("transform", _savedStyles[i + 2] || "");
      _savedStyles[i + 3].uncache = 1;
    }
  }
}, _recordScrollPositions = function _recordScrollPositions2() {
  return _scrollers.forEach(function(obj) {
    return _isFunction(obj) && ++obj.cacheID && (obj.rec = obj());
  });
}, _revertAll = function _revertAll2(kill, media) {
  var trigger;
  for (_i = 0; _i < _triggers.length; _i++) {
    trigger = _triggers[_i];
    if (trigger && (!media || trigger._ctx === media)) {
      if (kill) {
        trigger.kill(1);
      } else {
        trigger.revert(true, true);
      }
    }
  }
  _isReverted = true;
  media && _revertRecorded(media);
  media || _dispatch("revert");
}, _clearScrollMemory = function _clearScrollMemory2(scrollRestoration, force) {
  _scrollers.cache++;
  (force || !_refreshingAll) && _scrollers.forEach(function(obj) {
    return _isFunction(obj) && obj.cacheID++ && (obj.rec = 0);
  });
  _isString(scrollRestoration) && (_win.history.scrollRestoration = _scrollRestoration = scrollRestoration);
}, _refreshingAll, _refreshID = 0, _queueRefreshID, _queueRefreshAll = function _queueRefreshAll2() {
  if (_queueRefreshID !== _refreshID) {
    var id = _queueRefreshID = _refreshID;
    requestAnimationFrame(function() {
      return id === _refreshID && _refreshAll(true);
    });
  }
}, _refresh100vh = function _refresh100vh2() {
  _body.appendChild(_div100vh);
  _100vh = !_normalizer && _div100vh.offsetHeight || _win.innerHeight;
  _body.removeChild(_div100vh);
}, _hideAllMarkers = function _hideAllMarkers2(hide) {
  return _toArray(".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end").forEach(function(el) {
    return el.style.display = hide ? "none" : "block";
  });
}, _refreshAll = function _refreshAll2(force, skipRevert) {
  _docEl = _doc.documentElement;
  _body = _doc.body;
  _root = [_win, _doc, _docEl, _body];
  if (_lastScrollTime && !force && !_isReverted) {
    _addListener2(ScrollTrigger, "scrollEnd", _softRefresh);
    return;
  }
  _refresh100vh();
  _refreshingAll = ScrollTrigger.isRefreshing = true;
  _isReverted || _recordScrollPositions();
  var refreshInits = _dispatch("refreshInit");
  _sort && ScrollTrigger.sort();
  skipRevert || _revertAll();
  _scrollers.forEach(function(obj) {
    if (_isFunction(obj)) {
      obj.smooth && (obj.target.style.scrollBehavior = "auto");
      obj(0);
    }
  });
  _triggers.slice(0).forEach(function(t) {
    return t.refresh();
  });
  _isReverted = false;
  _triggers.forEach(function(t) {
    if (t._subPinOffset && t.pin) {
      var prop = t.vars.horizontal ? "offsetWidth" : "offsetHeight", original = t.pin[prop];
      t.revert(true, 1);
      t.adjustPinSpacing(t.pin[prop] - original);
      t.refresh();
    }
  });
  _clampingMax = 1;
  _hideAllMarkers(true);
  _triggers.forEach(function(t) {
    var max = _maxScroll(t.scroller, t._dir), endClamp = t.vars.end === "max" || t._endClamp && t.end > max, startClamp = t._startClamp && t.start >= max;
    (endClamp || startClamp) && t.setPositions(startClamp ? max - 1 : t.start, endClamp ? Math.max(startClamp ? max : t.start + 1, max) : t.end, true);
  });
  _hideAllMarkers(false);
  _clampingMax = 0;
  refreshInits.forEach(function(result) {
    return result && result.render && result.render(-1);
  });
  _scrollers.forEach(function(obj) {
    if (_isFunction(obj)) {
      obj.smooth && requestAnimationFrame(function() {
        return obj.target.style.scrollBehavior = "smooth";
      });
      obj.rec && obj(obj.rec);
    }
  });
  _clearScrollMemory(_scrollRestoration, 1);
  _resizeDelay.pause();
  _refreshID++;
  _refreshingAll = 2;
  _updateAll(2);
  _triggers.forEach(function(t) {
    return _isFunction(t.vars.onRefresh) && t.vars.onRefresh(t);
  });
  _refreshingAll = ScrollTrigger.isRefreshing = false;
  _dispatch("refresh");
}, _lastScroll = 0, _direction = 1, _primary, _updateAll = function _updateAll2(force) {
  if (force === 2 || !_refreshingAll && !_isReverted) {
    ScrollTrigger.isUpdating = true;
    _primary && _primary.update(0);
    var l = _triggers.length, time = _getTime(), recordVelocity = time - _time1 >= 50, scroll = l && _triggers[0].scroll();
    _direction = _lastScroll > scroll ? -1 : 1;
    _refreshingAll || (_lastScroll = scroll);
    if (recordVelocity) {
      if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
        _lastScrollTime = 0;
        _dispatch("scrollEnd");
      }
      _time2 = _time1;
      _time1 = time;
    }
    if (_direction < 0) {
      _i = l;
      while (_i-- > 0) {
        _triggers[_i] && _triggers[_i].update(0, recordVelocity);
      }
      _direction = 1;
    } else {
      for (_i = 0; _i < l; _i++) {
        _triggers[_i] && _triggers[_i].update(0, recordVelocity);
      }
    }
    ScrollTrigger.isUpdating = false;
  }
  _rafID = 0;
}, _propNamesToCopy = [_left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink", "float", "zIndex", "gridColumnStart", "gridColumnEnd", "gridRowStart", "gridRowEnd", "gridArea", "justifySelf", "alignSelf", "placeSelf", "order"], _stateProps = _propNamesToCopy.concat([_width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left]), _swapPinOut = function _swapPinOut2(pin, spacer, state) {
  _setState(state);
  var cache2 = pin._gsap;
  if (cache2.spacerIsNative) {
    _setState(cache2.spacerState);
  } else if (pin._gsap.swappedIn) {
    var parent = spacer.parentNode;
    if (parent) {
      parent.insertBefore(pin, spacer);
      parent.removeChild(spacer);
    }
  }
  pin._gsap.swappedIn = false;
}, _swapPinIn = function _swapPinIn2(pin, spacer, cs, spacerState) {
  if (!pin._gsap.swappedIn) {
    var i = _propNamesToCopy.length, spacerStyle = spacer.style, pinStyle = pin.style, p;
    while (i--) {
      p = _propNamesToCopy[i];
      spacerStyle[p] = cs[p];
    }
    spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
    cs.display === "inline" && (spacerStyle.display = "inline-block");
    pinStyle[_bottom] = pinStyle[_right] = "auto";
    spacerStyle.flexBasis = cs.flexBasis || "auto";
    spacerStyle.overflow = "visible";
    spacerStyle.boxSizing = "border-box";
    spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
    spacerStyle[_height] = _getSize(pin, _vertical) + _px;
    spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";
    _setState(spacerState);
    pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
    pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
    pinStyle[_padding] = cs[_padding];
    if (pin.parentNode !== spacer) {
      pin.parentNode.insertBefore(spacer, pin);
      spacer.appendChild(pin);
    }
    pin._gsap.swappedIn = true;
  }
}, _capsExp = /([A-Z])/g, _setState = function _setState2(state) {
  if (state) {
    var style = state.t.style, l = state.length, i = 0, p, value;
    (state.t._gsap || gsap.core.getCache(state.t)).uncache = 1;
    for (; i < l; i += 2) {
      value = state[i + 1];
      p = state[i];
      if (value) {
        style[p] = value;
      } else if (style[p]) {
        style.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
      }
    }
  }
}, _getState = function _getState2(element) {
  var l = _stateProps.length, style = element.style, state = [], i = 0;
  for (; i < l; i++) {
    state.push(_stateProps[i], style[_stateProps[i]]);
  }
  state.t = element;
  return state;
}, _copyState = function _copyState2(state, override, omitOffsets) {
  var result = [], l = state.length, i = omitOffsets ? 8 : 0, p;
  for (; i < l; i += 2) {
    p = state[i];
    result.push(p, p in override ? override[p] : state[i + 1]);
  }
  result.t = state.t;
  return result;
}, _winOffsets = {
  left: 0,
  top: 0
}, _parsePosition = function _parsePosition3(value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self2, scrollerBounds, borderWidth, useFixedPosition, scrollerMax, containerAnimation, clampZeroProp) {
  _isFunction(value) && (value = value(self2));
  if (_isString(value) && value.substr(0, 3) === "max") {
    value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
  }
  var time = containerAnimation ? containerAnimation.time() : 0, p1, p2, element;
  containerAnimation && containerAnimation.seek(0);
  isNaN(value) || (value = +value);
  if (!_isNumber(value)) {
    _isFunction(trigger) && (trigger = trigger(self2));
    var offsets = (value || "0").split(" "), bounds, localOffset, globalOffset, display;
    element = _getTarget(trigger, self2) || _body;
    bounds = _getBounds(element) || {};
    if ((!bounds || !bounds.left && !bounds.top) && _getComputedStyle(element).display === "none") {
      display = element.style.display;
      element.style.display = "block";
      bounds = _getBounds(element);
      display ? element.style.display = display : element.style.removeProperty("display");
    }
    localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
    globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
    value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
    markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
    scrollerSize -= scrollerSize - globalOffset;
  } else {
    containerAnimation && (value = gsap.utils.mapRange(containerAnimation.scrollTrigger.start, containerAnimation.scrollTrigger.end, 0, scrollerMax, value));
    markerScroller && _positionMarker(markerScroller, scrollerSize, direction, true);
  }
  if (clampZeroProp) {
    self2[clampZeroProp] = value || -1e-3;
    value < 0 && (value = 0);
  }
  if (marker) {
    var position = value + scrollerSize, isStart = marker._isStart;
    p1 = "scroll" + direction.d2;
    _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(_body[p1], _docEl[p1]) : marker.parentNode[p1]) <= position + 1);
    if (useFixedPosition) {
      scrollerBounds = _getBounds(markerScroller);
      useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
    }
  }
  if (containerAnimation && element) {
    p1 = _getBounds(element);
    containerAnimation.seek(scrollerMax);
    p2 = _getBounds(element);
    containerAnimation._caScrollDist = p1[direction.p] - p2[direction.p];
    value = value / containerAnimation._caScrollDist * scrollerMax;
  }
  containerAnimation && containerAnimation.seek(time);
  return containerAnimation ? value : Math.round(value);
}, _prefixExp = /(webkit|moz|length|cssText|inset)/i, _reparent = function _reparent2(element, parent, top, left) {
  if (element.parentNode !== parent) {
    var style = element.style, p, cs;
    if (parent === _body) {
      element._stOrig = style.cssText;
      cs = _getComputedStyle(element);
      for (p in cs) {
        if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
          style[p] = cs[p];
        }
      }
      style.top = top;
      style.left = left;
    } else {
      style.cssText = element._stOrig;
    }
    gsap.core.getCache(element).uncache = 1;
    parent.appendChild(element);
  }
}, _interruptionTracker = function _interruptionTracker2(getValueFunc, initialValue, onInterrupt) {
  var last1 = initialValue, last2 = last1;
  return function(value) {
    var current = Math.round(getValueFunc());
    if (current !== last1 && current !== last2 && Math.abs(current - last1) > 3 && Math.abs(current - last2) > 3) {
      value = current;
      onInterrupt && onInterrupt();
    }
    last2 = last1;
    last1 = Math.round(value);
    return last1;
  };
}, _shiftMarker = function _shiftMarker2(marker, direction, value) {
  var vars = {};
  vars[direction.p] = "+=" + value;
  gsap.set(marker, vars);
}, _getTweenCreator = function _getTweenCreator2(scroller, direction) {
  var getScroll = _getScrollFunc(scroller, direction), prop = "_scroll" + direction.p2, getTween = function getTween2(scrollTo, vars, initialValue, change1, change2) {
    var tween = getTween2.tween, onComplete = vars.onComplete, modifiers = {};
    initialValue = initialValue || getScroll();
    var checkForInterruption = _interruptionTracker(getScroll, initialValue, function() {
      tween.kill();
      getTween2.tween = 0;
    });
    change2 = change1 && change2 || 0;
    change1 = change1 || scrollTo - initialValue;
    tween && tween.kill();
    vars[prop] = scrollTo;
    vars.inherit = false;
    vars.modifiers = modifiers;
    modifiers[prop] = function() {
      return checkForInterruption(initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio);
    };
    vars.onUpdate = function() {
      _scrollers.cache++;
      getTween2.tween && _updateAll();
    };
    vars.onComplete = function() {
      getTween2.tween = 0;
      onComplete && onComplete.call(tween);
    };
    tween = getTween2.tween = gsap.to(scroller, vars);
    return tween;
  };
  scroller[prop] = getScroll;
  getScroll.wheelHandler = function() {
    return getTween.tween && getTween.tween.kill() && (getTween.tween = 0);
  };
  _addListener2(scroller, "wheel", getScroll.wheelHandler);
  ScrollTrigger.isTouch && _addListener2(scroller, "touchmove", getScroll.wheelHandler);
  return getTween;
};
var ScrollTrigger = /* @__PURE__ */ (function() {
  function ScrollTrigger2(vars, animation) {
    _coreInitted || ScrollTrigger2.register(gsap) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
    _context(this);
    this.init(vars, animation);
  }
  var _proto = ScrollTrigger2.prototype;
  _proto.init = function init4(vars, animation) {
    this.progress = this.start = 0;
    this.vars && this.kill(true, true);
    if (!_enabled) {
      this.update = this.refresh = this.kill = _passThrough;
      return;
    }
    vars = _setDefaults(_isString(vars) || _isNumber(vars) || vars.nodeType ? {
      trigger: vars
    } : vars, _defaults);
    var _vars = vars, onUpdate = _vars.onUpdate, toggleClass = _vars.toggleClass, id = _vars.id, onToggle = _vars.onToggle, onRefresh = _vars.onRefresh, scrub = _vars.scrub, trigger = _vars.trigger, pin = _vars.pin, pinSpacing = _vars.pinSpacing, invalidateOnRefresh = _vars.invalidateOnRefresh, anticipatePin = _vars.anticipatePin, onScrubComplete = _vars.onScrubComplete, onSnapComplete = _vars.onSnapComplete, once = _vars.once, snap3 = _vars.snap, pinReparent = _vars.pinReparent, pinSpacer = _vars.pinSpacer, containerAnimation = _vars.containerAnimation, fastScrollEnd = _vars.fastScrollEnd, preventOverlaps = _vars.preventOverlaps, direction = vars.horizontal || vars.containerAnimation && vars.horizontal !== false ? _horizontal : _vertical, isToggle = !scrub && scrub !== 0, scroller = _getTarget(vars.scroller || _win), scrollerCache = gsap.core.getCache(scroller), isViewport = _isViewport2(scroller), useFixedPosition = ("pinType" in vars ? vars.pinType : _getProxyProp(scroller, "pinType") || isViewport && "fixed") === "fixed", callbacks = [vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack], toggleActions = isToggle && vars.toggleActions.split(" "), markers = "markers" in vars ? vars.markers : _defaults.markers, borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0, self2 = this, onRefreshInit = vars.onRefreshInit && function() {
      return vars.onRefreshInit(self2);
    }, getScrollerSize = _getSizeFunc(scroller, isViewport, direction), getScrollerOffsets = _getOffsetsFunc(scroller, isViewport), lastSnap = 0, lastRefresh = 0, prevProgress = 0, scrollFunc = _getScrollFunc(scroller, direction), tweenTo, pinCache, snapFunc, scroll1, scroll2, start, end, markerStart, markerEnd, markerStartTrigger, markerEndTrigger, markerVars, executingOnRefresh, change, pinOriginalState, pinActiveState, pinState, spacer, offset, pinGetter, pinSetter, pinStart, pinChange, spacingStart, spacerState, markerStartSetter, pinMoves, markerEndSetter, cs, snap1, snap22, scrubTween, scrubSmooth, snapDurClamp, snapDelayedCall, prevScroll, prevAnimProgress, caMarkerSetter, customRevertReturn;
    self2._startClamp = self2._endClamp = false;
    self2._dir = direction;
    anticipatePin *= 45;
    self2.scroller = scroller;
    self2.scroll = containerAnimation ? containerAnimation.time.bind(containerAnimation) : scrollFunc;
    scroll1 = scrollFunc();
    self2.vars = vars;
    animation = animation || vars.animation;
    if ("refreshPriority" in vars) {
      _sort = 1;
      vars.refreshPriority === -9999 && (_primary = self2);
    }
    scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
      top: _getTweenCreator(scroller, _vertical),
      left: _getTweenCreator(scroller, _horizontal)
    };
    self2.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];
    self2.scrubDuration = function(value) {
      scrubSmooth = _isNumber(value) && value;
      if (!scrubSmooth) {
        scrubTween && scrubTween.progress(1).kill();
        scrubTween = 0;
      } else {
        scrubTween ? scrubTween.duration(value) : scrubTween = gsap.to(animation, {
          ease: "expo",
          totalProgress: "+=0",
          inherit: false,
          duration: scrubSmooth,
          paused: true,
          onComplete: function onComplete() {
            return onScrubComplete && onScrubComplete(self2);
          }
        });
      }
    };
    if (animation) {
      animation.vars.lazy = false;
      animation._initted && !self2.isReverted || animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.duration() && animation.render(0, true, true);
      self2.animation = animation.pause();
      animation.scrollTrigger = self2;
      self2.scrubDuration(scrub);
      snap1 = 0;
      id || (id = animation.vars.id);
    }
    if (snap3) {
      if (!_isObject(snap3) || snap3.push) {
        snap3 = {
          snapTo: snap3
        };
      }
      "scrollBehavior" in _body.style && gsap.set(isViewport ? [_body, _docEl] : scroller, {
        scrollBehavior: "auto"
      });
      _scrollers.forEach(function(o) {
        return _isFunction(o) && o.target === (isViewport ? _doc.scrollingElement || _docEl : scroller) && (o.smooth = false);
      });
      snapFunc = _isFunction(snap3.snapTo) ? snap3.snapTo : snap3.snapTo === "labels" ? _getClosestLabel(animation) : snap3.snapTo === "labelsDirectional" ? _getLabelAtDirection(animation) : snap3.directional !== false ? function(value, st) {
        return _snapDirectional(snap3.snapTo)(value, _getTime() - lastRefresh < 500 ? 0 : st.direction);
      } : gsap.utils.snap(snap3.snapTo);
      snapDurClamp = snap3.duration || {
        min: 0.1,
        max: 2
      };
      snapDurClamp = _isObject(snapDurClamp) ? _clamp(snapDurClamp.min, snapDurClamp.max) : _clamp(snapDurClamp, snapDurClamp);
      snapDelayedCall = gsap.delayedCall(snap3.delay || scrubSmooth / 2 || 0.1, function() {
        var scroll = scrollFunc(), refreshedRecently = _getTime() - lastRefresh < 500, tween = tweenTo.tween;
        if ((refreshedRecently || Math.abs(self2.getVelocity()) < 10) && !tween && !_pointerIsDown && lastSnap !== scroll) {
          var progress = (scroll - start) / change, totalProgress = animation && !isToggle ? animation.totalProgress() : progress, velocity = refreshedRecently ? 0 : (totalProgress - snap22) / (_getTime() - _time2) * 1e3 || 0, change1 = gsap.utils.clamp(-progress, 1 - progress, _abs(velocity / 2) * velocity / 0.185), naturalEnd = progress + (snap3.inertia === false ? 0 : change1), endValue, endScroll, _snap = snap3, onStart = _snap.onStart, _onInterrupt = _snap.onInterrupt, _onComplete = _snap.onComplete;
          endValue = snapFunc(naturalEnd, self2);
          _isNumber(endValue) || (endValue = naturalEnd);
          endScroll = Math.max(0, Math.round(start + endValue * change));
          if (scroll <= end && scroll >= start && endScroll !== scroll) {
            if (tween && !tween._initted && tween.data <= _abs(endScroll - scroll)) {
              return;
            }
            if (snap3.inertia === false) {
              change1 = endValue - progress;
            }
            tweenTo(endScroll, {
              duration: snapDurClamp(_abs(Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05 || 0)),
              ease: snap3.ease || "power3",
              data: _abs(endScroll - scroll),
              // record the distance so that if another snap tween occurs (conflict) we can prioritize the closest snap.
              onInterrupt: function onInterrupt() {
                return snapDelayedCall.restart(true) && _onInterrupt && _onInterrupt(self2);
              },
              onComplete: function onComplete() {
                self2.update();
                lastSnap = scrollFunc();
                if (animation && !isToggle) {
                  scrubTween ? scrubTween.resetTo("totalProgress", endValue, animation._tTime / animation._tDur) : animation.progress(endValue);
                }
                snap1 = snap22 = animation && !isToggle ? animation.totalProgress() : self2.progress;
                onSnapComplete && onSnapComplete(self2);
                _onComplete && _onComplete(self2);
              }
            }, scroll, change1 * change, endScroll - scroll - change1 * change);
            onStart && onStart(self2, tweenTo.tween);
          }
        } else if (self2.isActive && lastSnap !== scroll) {
          snapDelayedCall.restart(true);
        }
      }).pause();
    }
    id && (_ids[id] = self2);
    trigger = self2.trigger = _getTarget(trigger || pin !== true && pin);
    customRevertReturn = trigger && trigger._gsap && trigger._gsap.stRevert;
    customRevertReturn && (customRevertReturn = customRevertReturn(self2));
    pin = pin === true ? trigger : _getTarget(pin);
    _isString(toggleClass) && (toggleClass = {
      targets: trigger,
      className: toggleClass
    });
    if (pin) {
      pinSpacing === false || pinSpacing === _margin || (pinSpacing = !pinSpacing && pin.parentNode && pin.parentNode.style && _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding);
      self2.pin = pin;
      pinCache = gsap.core.getCache(pin);
      if (!pinCache.spacer) {
        if (pinSpacer) {
          pinSpacer = _getTarget(pinSpacer);
          pinSpacer && !pinSpacer.nodeType && (pinSpacer = pinSpacer.current || pinSpacer.nativeElement);
          pinCache.spacerIsNative = !!pinSpacer;
          pinSpacer && (pinCache.spacerState = _getState(pinSpacer));
        }
        pinCache.spacer = spacer = pinSpacer || _doc.createElement("div");
        spacer.classList.add("pin-spacer");
        id && spacer.classList.add("pin-spacer-" + id);
        pinCache.pinState = pinOriginalState = _getState(pin);
      } else {
        pinOriginalState = pinCache.pinState;
      }
      vars.force3D !== false && gsap.set(pin, {
        force3D: true
      });
      self2.spacer = spacer = pinCache.spacer;
      cs = _getComputedStyle(pin);
      spacingStart = cs[pinSpacing + direction.os2];
      pinGetter = gsap.getProperty(pin);
      pinSetter = gsap.quickSetter(pin, direction.a, _px);
      _swapPinIn(pin, spacer, cs);
      pinState = _getState(pin);
    }
    if (markers) {
      markerVars = _isObject(markers) ? _setDefaults(markers, _markerDefaults) : _markerDefaults;
      markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
      markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
      offset = markerStartTrigger["offset" + direction.op.d2];
      var content = _getTarget(_getProxyProp(scroller, "content") || scroller);
      markerStart = this.markerStart = _createMarker("start", id, content, direction, markerVars, offset, 0, containerAnimation);
      markerEnd = this.markerEnd = _createMarker("end", id, content, direction, markerVars, offset, 0, containerAnimation);
      containerAnimation && (caMarkerSetter = gsap.quickSetter([markerStart, markerEnd], direction.a, _px));
      if (!useFixedPosition && !(_proxies.length && _getProxyProp(scroller, "fixedMarkers") === true)) {
        _makePositionable(isViewport ? _body : scroller);
        gsap.set([markerStartTrigger, markerEndTrigger], {
          force3D: true
        });
        markerStartSetter = gsap.quickSetter(markerStartTrigger, direction.a, _px);
        markerEndSetter = gsap.quickSetter(markerEndTrigger, direction.a, _px);
      }
    }
    if (containerAnimation) {
      var oldOnUpdate = containerAnimation.vars.onUpdate, oldParams = containerAnimation.vars.onUpdateParams;
      containerAnimation.eventCallback("onUpdate", function() {
        self2.update(0, 0, 1);
        oldOnUpdate && oldOnUpdate.apply(containerAnimation, oldParams || []);
      });
    }
    self2.previous = function() {
      return _triggers[_triggers.indexOf(self2) - 1];
    };
    self2.next = function() {
      return _triggers[_triggers.indexOf(self2) + 1];
    };
    self2.revert = function(revert, temp) {
      if (!temp) {
        return self2.kill(true);
      }
      var r = revert !== false || !self2.enabled, prevRefreshing = _refreshing;
      if (r !== self2.isReverted) {
        if (r) {
          prevScroll = Math.max(scrollFunc(), self2.scroll.rec || 0);
          prevProgress = self2.progress;
          prevAnimProgress = animation && animation.progress();
        }
        markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function(m) {
          return m.style.display = r ? "none" : "block";
        });
        if (r) {
          _refreshing = self2;
          self2.update(r);
        }
        if (pin && (!pinReparent || !self2.isActive)) {
          if (r) {
            _swapPinOut(pin, spacer, pinOriginalState);
          } else {
            _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState);
          }
        }
        r || self2.update(r);
        _refreshing = prevRefreshing;
        self2.isReverted = r;
      }
    };
    self2.refresh = function(soft, force, position, pinOffset) {
      if ((_refreshing || !self2.enabled) && !force) {
        return;
      }
      if (pin && soft && _lastScrollTime) {
        _addListener2(ScrollTrigger2, "scrollEnd", _softRefresh);
        return;
      }
      !_refreshingAll && onRefreshInit && onRefreshInit(self2);
      _refreshing = self2;
      if (tweenTo.tween && !position) {
        tweenTo.tween.kill();
        tweenTo.tween = 0;
      }
      scrubTween && scrubTween.pause();
      if (invalidateOnRefresh && animation) {
        animation.revert({
          kill: false
        }).invalidate();
        animation.getChildren ? animation.getChildren(true, true, false).forEach(function(t) {
          return t.vars.immediateRender && t.render(0, true, true);
        }) : animation.vars.immediateRender && animation.render(0, true, true);
      }
      self2.isReverted || self2.revert(true, true);
      self2._subPinOffset = false;
      var size = getScrollerSize(), scrollerBounds = getScrollerOffsets(), max = containerAnimation ? containerAnimation.duration() : _maxScroll(scroller, direction), isFirstRefresh = change <= 0.01 || !change, offset2 = 0, otherPinOffset = pinOffset || 0, parsedEnd = _isObject(position) ? position.end : vars.end, parsedEndTrigger = vars.endTrigger || trigger, parsedStart = _isObject(position) ? position.start : vars.start || (vars.start === 0 || !trigger ? 0 : pin ? "0 0" : "0 100%"), pinnedContainer = self2.pinnedContainer = vars.pinnedContainer && _getTarget(vars.pinnedContainer, self2), triggerIndex = trigger && Math.max(0, _triggers.indexOf(self2)) || 0, i = triggerIndex, cs2, bounds, scroll, isVertical, override, curTrigger, curPin, oppositeScroll, initted, revertedPins, forcedOverflow, markerStartOffset, markerEndOffset;
      if (markers && _isObject(position)) {
        markerStartOffset = gsap.getProperty(markerStartTrigger, direction.p);
        markerEndOffset = gsap.getProperty(markerEndTrigger, direction.p);
      }
      while (i-- > 0) {
        curTrigger = _triggers[i];
        curTrigger.end || curTrigger.refresh(0, 1) || (_refreshing = self2);
        curPin = curTrigger.pin;
        if (curPin && (curPin === trigger || curPin === pin || curPin === pinnedContainer) && !curTrigger.isReverted) {
          revertedPins || (revertedPins = []);
          revertedPins.unshift(curTrigger);
          curTrigger.revert(true, true);
        }
        if (curTrigger !== _triggers[i]) {
          triggerIndex--;
          i--;
        }
      }
      _isFunction(parsedStart) && (parsedStart = parsedStart(self2));
      parsedStart = _parseClamp(parsedStart, "start", self2);
      start = _parsePosition(parsedStart, trigger, size, direction, scrollFunc(), markerStart, markerStartTrigger, self2, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation, self2._startClamp && "_startClamp") || (pin ? -1e-3 : 0);
      _isFunction(parsedEnd) && (parsedEnd = parsedEnd(self2));
      if (_isString(parsedEnd) && !parsedEnd.indexOf("+=")) {
        if (~parsedEnd.indexOf(" ")) {
          parsedEnd = (_isString(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
        } else {
          offset2 = _offsetToPx(parsedEnd.substr(2), size);
          parsedEnd = _isString(parsedStart) ? parsedStart : (containerAnimation ? gsap.utils.mapRange(0, containerAnimation.duration(), containerAnimation.scrollTrigger.start, containerAnimation.scrollTrigger.end, start) : start) + offset2;
          parsedEndTrigger = trigger;
        }
      }
      parsedEnd = _parseClamp(parsedEnd, "end", self2);
      end = Math.max(start, _parsePosition(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, scrollFunc() + offset2, markerEnd, markerEndTrigger, self2, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation, self2._endClamp && "_endClamp")) || -1e-3;
      offset2 = 0;
      i = triggerIndex;
      while (i--) {
        curTrigger = _triggers[i] || {};
        curPin = curTrigger.pin;
        if (curPin && curTrigger.start - curTrigger._pinPush <= start && !containerAnimation && curTrigger.end > 0) {
          cs2 = curTrigger.end - (self2._startClamp ? Math.max(0, curTrigger.start) : curTrigger.start);
          if ((curPin === trigger && curTrigger.start - curTrigger._pinPush < start || curPin === pinnedContainer) && isNaN(parsedStart)) {
            offset2 += cs2 * (1 - curTrigger.progress);
          }
          curPin === pin && (otherPinOffset += cs2);
        }
      }
      start += offset2;
      end += offset2;
      self2._startClamp && (self2._startClamp += offset2);
      if (self2._endClamp && !_refreshingAll) {
        self2._endClamp = end || -1e-3;
        end = Math.min(end, _maxScroll(scroller, direction));
      }
      change = end - start || (start -= 0.01) && 1e-3;
      if (isFirstRefresh) {
        prevProgress = gsap.utils.clamp(0, 1, gsap.utils.normalize(start, end, prevScroll));
      }
      self2._pinPush = otherPinOffset;
      if (markerStart && offset2) {
        cs2 = {};
        cs2[direction.a] = "+=" + offset2;
        pinnedContainer && (cs2[direction.p] = "-=" + scrollFunc());
        gsap.set([markerStart, markerEnd], cs2);
      }
      if (pin && !(_clampingMax && self2.end >= _maxScroll(scroller, direction))) {
        cs2 = _getComputedStyle(pin);
        isVertical = direction === _vertical;
        scroll = scrollFunc();
        pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
        if (!max && end > 1) {
          forcedOverflow = (isViewport ? _doc.scrollingElement || _docEl : scroller).style;
          forcedOverflow = {
            style: forcedOverflow,
            value: forcedOverflow["overflow" + direction.a.toUpperCase()]
          };
          if (isViewport && _getComputedStyle(_body)["overflow" + direction.a.toUpperCase()] !== "scroll") {
            forcedOverflow.style["overflow" + direction.a.toUpperCase()] = "scroll";
          }
        }
        _swapPinIn(pin, spacer, cs2);
        pinState = _getState(pin);
        bounds = _getBounds(pin, true);
        oppositeScroll = useFixedPosition && _getScrollFunc(scroller, isVertical ? _horizontal : _vertical)();
        if (pinSpacing) {
          spacerState = [pinSpacing + direction.os2, change + otherPinOffset + _px];
          spacerState.t = spacer;
          i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
          if (i) {
            spacerState.push(direction.d, i + _px);
            spacer.style.flexBasis !== "auto" && (spacer.style.flexBasis = i + _px);
          }
          _setState(spacerState);
          if (pinnedContainer) {
            _triggers.forEach(function(t) {
              if (t.pin === pinnedContainer && t.vars.pinSpacing !== false) {
                t._subPinOffset = true;
              }
            });
          }
          useFixedPosition && scrollFunc(prevScroll);
        } else {
          i = _getSize(pin, direction);
          i && spacer.style.flexBasis !== "auto" && (spacer.style.flexBasis = i + _px);
        }
        if (useFixedPosition) {
          override = {
            top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
            left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
            boxSizing: "border-box",
            position: "fixed"
          };
          override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
          override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
          override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
          override[_padding] = cs2[_padding];
          override[_padding + _Top] = cs2[_padding + _Top];
          override[_padding + _Right] = cs2[_padding + _Right];
          override[_padding + _Bottom] = cs2[_padding + _Bottom];
          override[_padding + _Left] = cs2[_padding + _Left];
          pinActiveState = _copyState(pinOriginalState, override, pinReparent);
          _refreshingAll && scrollFunc(0);
        }
        if (animation) {
          initted = animation._initted;
          _suppressOverwrites(1);
          animation.render(animation.duration(), true, true);
          pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
          pinMoves = Math.abs(change - pinChange) > 1;
          useFixedPosition && pinMoves && pinActiveState.splice(pinActiveState.length - 2, 2);
          animation.render(0, true, true);
          initted || animation.invalidate(true);
          animation.parent || animation.totalTime(animation.totalTime());
          _suppressOverwrites(0);
        } else {
          pinChange = change;
        }
        forcedOverflow && (forcedOverflow.value ? forcedOverflow.style["overflow" + direction.a.toUpperCase()] = forcedOverflow.value : forcedOverflow.style.removeProperty("overflow-" + direction.a));
      } else if (trigger && scrollFunc() && !containerAnimation) {
        bounds = trigger.parentNode;
        while (bounds && bounds !== _body) {
          if (bounds._pinOffset) {
            start -= bounds._pinOffset;
            end -= bounds._pinOffset;
          }
          bounds = bounds.parentNode;
        }
      }
      revertedPins && revertedPins.forEach(function(t) {
        return t.revert(false, true);
      });
      self2.start = start;
      self2.end = end;
      scroll1 = scroll2 = _refreshingAll ? prevScroll : scrollFunc();
      if (!containerAnimation && !_refreshingAll) {
        scroll1 < prevScroll && scrollFunc(prevScroll);
        self2.scroll.rec = 0;
      }
      self2.revert(false, true);
      lastRefresh = _getTime();
      if (snapDelayedCall) {
        lastSnap = -1;
        snapDelayedCall.restart(true);
      }
      _refreshing = 0;
      animation && isToggle && (animation._initted || prevAnimProgress) && animation.progress() !== prevAnimProgress && animation.progress(prevAnimProgress || 0, true).render(animation.time(), true, true);
      if (isFirstRefresh || prevProgress !== self2.progress || containerAnimation || invalidateOnRefresh || animation && !animation._initted) {
        animation && !isToggle && (animation._initted || prevProgress || animation.vars.immediateRender !== false) && animation.totalProgress(containerAnimation && start < -1e-3 && !prevProgress ? gsap.utils.normalize(start, end, 0) : prevProgress, true);
        self2.progress = isFirstRefresh || (scroll1 - start) / change === prevProgress ? 0 : prevProgress;
      }
      pin && pinSpacing && (spacer._pinOffset = Math.round(self2.progress * pinChange));
      scrubTween && scrubTween.invalidate();
      if (!isNaN(markerStartOffset)) {
        markerStartOffset -= gsap.getProperty(markerStartTrigger, direction.p);
        markerEndOffset -= gsap.getProperty(markerEndTrigger, direction.p);
        _shiftMarker(markerStartTrigger, direction, markerStartOffset);
        _shiftMarker(markerStart, direction, markerStartOffset - (pinOffset || 0));
        _shiftMarker(markerEndTrigger, direction, markerEndOffset);
        _shiftMarker(markerEnd, direction, markerEndOffset - (pinOffset || 0));
      }
      isFirstRefresh && !_refreshingAll && self2.update();
      if (onRefresh && !_refreshingAll && !executingOnRefresh) {
        executingOnRefresh = true;
        onRefresh(self2);
        executingOnRefresh = false;
      }
    };
    self2.getVelocity = function() {
      return (scrollFunc() - scroll2) / (_getTime() - _time2) * 1e3 || 0;
    };
    self2.endAnimation = function() {
      _endAnimation(self2.callbackAnimation);
      if (animation) {
        scrubTween ? scrubTween.progress(1) : !animation.paused() ? _endAnimation(animation, animation.reversed()) : isToggle || _endAnimation(animation, self2.direction < 0, 1);
      }
    };
    self2.labelToScroll = function(label) {
      return animation && animation.labels && (start || self2.refresh() || start) + animation.labels[label] / animation.duration() * change || 0;
    };
    self2.getTrailing = function(name) {
      var i = _triggers.indexOf(self2), a = self2.direction > 0 ? _triggers.slice(0, i).reverse() : _triggers.slice(i + 1);
      return (_isString(name) ? a.filter(function(t) {
        return t.vars.preventOverlaps === name;
      }) : a).filter(function(t) {
        return self2.direction > 0 ? t.end <= start : t.start >= end;
      });
    };
    self2.update = function(reset, recordVelocity, forceFake) {
      if (containerAnimation && !forceFake && !reset) {
        return;
      }
      var scroll = _refreshingAll === true ? prevScroll : self2.scroll(), p = reset ? 0 : (scroll - start) / change, clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0, prevProgress2 = self2.progress, isActive, wasActive, toggleState, action, stateChanged, toggled, isAtMax, isTakingAction;
      if (recordVelocity) {
        scroll2 = scroll1;
        scroll1 = containerAnimation ? scrollFunc() : scroll;
        if (snap3) {
          snap22 = snap1;
          snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
        }
      }
      if (anticipatePin && pin && !_refreshing && !_startup && _lastScrollTime) {
        if (!clipped && start < scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin) {
          clipped = 1e-4;
        } else if (clipped === 1 && end > scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin) {
          clipped = 0.9999;
        }
      }
      if (clipped !== prevProgress2 && self2.enabled) {
        isActive = self2.isActive = !!clipped && clipped < 1;
        wasActive = !!prevProgress2 && prevProgress2 < 1;
        toggled = isActive !== wasActive;
        stateChanged = toggled || !!clipped !== !!prevProgress2;
        self2.direction = clipped > prevProgress2 ? 1 : -1;
        self2.progress = clipped;
        if (stateChanged && !_refreshing) {
          toggleState = clipped && !prevProgress2 ? 0 : clipped === 1 ? 1 : prevProgress2 === 1 ? 2 : 3;
          if (isToggle) {
            action = !toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1] || toggleActions[toggleState];
            isTakingAction = animation && (action === "complete" || action === "reset" || action in animation);
          }
        }
        preventOverlaps && (toggled || isTakingAction) && (isTakingAction || scrub || !animation) && (_isFunction(preventOverlaps) ? preventOverlaps(self2) : self2.getTrailing(preventOverlaps).forEach(function(t) {
          return t.endAnimation();
        }));
        if (!isToggle) {
          if (scrubTween && !_refreshing && !_startup) {
            scrubTween._dp._time - scrubTween._start !== scrubTween._time && scrubTween.render(scrubTween._dp._time - scrubTween._start);
            if (scrubTween.resetTo) {
              scrubTween.resetTo("totalProgress", clipped, animation._tTime / animation._tDur);
            } else {
              scrubTween.vars.totalProgress = clipped;
              scrubTween.invalidate().restart();
            }
          } else if (animation) {
            animation.totalProgress(clipped, !!(_refreshing && (lastRefresh || reset)));
          }
        }
        if (pin) {
          reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);
          if (!useFixedPosition) {
            pinSetter(_round(pinStart + pinChange * clipped));
          } else if (stateChanged) {
            isAtMax = !reset && clipped > prevProgress2 && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction);
            if (pinReparent) {
              if (!reset && (isActive || isAtMax)) {
                var bounds = _getBounds(pin, true), _offset = scroll - start;
                _reparent(pin, _body, bounds.top + (direction === _vertical ? _offset : 0) + _px, bounds.left + (direction === _vertical ? 0 : _offset) + _px);
              } else {
                _reparent(pin, spacer);
              }
            }
            _setState(isActive || isAtMax ? pinActiveState : pinState);
            pinMoves && clipped < 1 && isActive || pinSetter(pinStart + (clipped === 1 && !isAtMax ? pinChange : 0));
          }
        }
        snap3 && !tweenTo.tween && !_refreshing && !_startup && snapDelayedCall.restart(true);
        toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach(function(el) {
          return el.classList[isActive || once ? "add" : "remove"](toggleClass.className);
        });
        onUpdate && !isToggle && !reset && onUpdate(self2);
        if (stateChanged && !_refreshing) {
          if (isToggle) {
            if (isTakingAction) {
              if (action === "complete") {
                animation.pause().totalProgress(1);
              } else if (action === "reset") {
                animation.restart(true).pause();
              } else if (action === "restart") {
                animation.restart(true);
              } else {
                animation[action]();
              }
            }
            onUpdate && onUpdate(self2);
          }
          if (toggled || !_limitCallbacks) {
            onToggle && toggled && _callback(self2, onToggle);
            callbacks[toggleState] && _callback(self2, callbacks[toggleState]);
            once && (clipped === 1 ? self2.kill(false, 1) : callbacks[toggleState] = 0);
            if (!toggled) {
              toggleState = clipped === 1 ? 1 : 3;
              callbacks[toggleState] && _callback(self2, callbacks[toggleState]);
            }
          }
          if (fastScrollEnd && !isActive && Math.abs(self2.getVelocity()) > (_isNumber(fastScrollEnd) ? fastScrollEnd : 2500)) {
            _endAnimation(self2.callbackAnimation);
            scrubTween ? scrubTween.progress(1) : _endAnimation(animation, action === "reverse" ? 1 : !clipped, 1);
          }
        } else if (isToggle && onUpdate && !_refreshing) {
          onUpdate(self2);
        }
      }
      if (markerEndSetter) {
        var n = containerAnimation ? scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0) : scroll;
        markerStartSetter(n + (markerStartTrigger._isFlipped ? 1 : 0));
        markerEndSetter(n);
      }
      caMarkerSetter && caMarkerSetter(-scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0));
    };
    self2.enable = function(reset, refresh) {
      if (!self2.enabled) {
        self2.enabled = true;
        _addListener2(scroller, "resize", _onResize);
        isViewport || _addListener2(scroller, "scroll", _onScroll2);
        onRefreshInit && _addListener2(ScrollTrigger2, "refreshInit", onRefreshInit);
        if (reset !== false) {
          self2.progress = prevProgress = 0;
          scroll1 = scroll2 = lastSnap = scrollFunc();
        }
        refresh !== false && self2.refresh();
      }
    };
    self2.getTween = function(snap4) {
      return snap4 && tweenTo ? tweenTo.tween : scrubTween;
    };
    self2.setPositions = function(newStart, newEnd, keepClamp, pinOffset) {
      if (containerAnimation) {
        var st = containerAnimation.scrollTrigger, duration = containerAnimation.duration(), _change = st.end - st.start;
        newStart = st.start + _change * newStart / duration;
        newEnd = st.start + _change * newEnd / duration;
      }
      self2.refresh(false, false, {
        start: _keepClamp(newStart, keepClamp && !!self2._startClamp),
        end: _keepClamp(newEnd, keepClamp && !!self2._endClamp)
      }, pinOffset);
      self2.update();
    };
    self2.adjustPinSpacing = function(amount) {
      if (spacerState && amount) {
        var i = spacerState.indexOf(direction.d) + 1;
        spacerState[i] = parseFloat(spacerState[i]) + amount + _px;
        spacerState[1] = parseFloat(spacerState[1]) + amount + _px;
        _setState(spacerState);
      }
    };
    self2.disable = function(reset, allowAnimation) {
      reset !== false && self2.revert(true, true);
      if (self2.enabled) {
        self2.enabled = self2.isActive = false;
        allowAnimation || scrubTween && scrubTween.pause();
        prevScroll = 0;
        pinCache && (pinCache.uncache = 1);
        onRefreshInit && _removeListener2(ScrollTrigger2, "refreshInit", onRefreshInit);
        if (snapDelayedCall) {
          snapDelayedCall.pause();
          tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
        }
        if (!isViewport) {
          var i = _triggers.length;
          while (i--) {
            if (_triggers[i].scroller === scroller && _triggers[i] !== self2) {
              return;
            }
          }
          _removeListener2(scroller, "resize", _onResize);
          isViewport || _removeListener2(scroller, "scroll", _onScroll2);
        }
      }
    };
    self2.kill = function(revert, allowAnimation) {
      self2.disable(revert, allowAnimation);
      scrubTween && !allowAnimation && scrubTween.kill();
      id && delete _ids[id];
      var i = _triggers.indexOf(self2);
      i >= 0 && _triggers.splice(i, 1);
      i === _i && _direction > 0 && _i--;
      i = 0;
      _triggers.forEach(function(t) {
        return t.scroller === self2.scroller && (i = 1);
      });
      i || _refreshingAll || (self2.scroll.rec = 0);
      if (animation) {
        animation.scrollTrigger = null;
        revert && animation.revert({
          kill: false
        });
        allowAnimation || animation.kill();
      }
      markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function(m) {
        return m.parentNode && m.parentNode.removeChild(m);
      });
      _primary === self2 && (_primary = 0);
      if (pin) {
        pinCache && (pinCache.uncache = 1);
        i = 0;
        _triggers.forEach(function(t) {
          return t.pin === pin && i++;
        });
        i || (pinCache.spacer = 0);
      }
      vars.onKill && vars.onKill(self2);
    };
    _triggers.push(self2);
    self2.enable(false, false);
    customRevertReturn && customRevertReturn(self2);
    if (animation && animation.add && !change) {
      var updateFunc = self2.update;
      self2.update = function() {
        self2.update = updateFunc;
        _scrollers.cache++;
        start || end || self2.refresh();
      };
      gsap.delayedCall(0.01, self2.update);
      change = 0.01;
      start = end = 0;
    } else {
      self2.refresh();
    }
    pin && _queueRefreshAll();
  };
  ScrollTrigger2.register = function register(core) {
    if (!_coreInitted) {
      gsap = core || _getGSAP2();
      _windowExists() && window.document && ScrollTrigger2.enable();
      _coreInitted = _enabled;
    }
    return _coreInitted;
  };
  ScrollTrigger2.defaults = function defaults3(config3) {
    if (config3) {
      for (var p in config3) {
        _defaults[p] = config3[p];
      }
    }
    return _defaults;
  };
  ScrollTrigger2.disable = function disable(reset, kill) {
    _enabled = 0;
    _triggers.forEach(function(trigger) {
      return trigger[kill ? "kill" : "disable"](reset);
    });
    _removeListener2(_win, "wheel", _onScroll2);
    _removeListener2(_doc, "scroll", _onScroll2);
    clearInterval(_syncInterval);
    _removeListener2(_doc, "touchcancel", _passThrough);
    _removeListener2(_body, "touchstart", _passThrough);
    _multiListener(_removeListener2, _doc, "pointerdown,touchstart,mousedown", _pointerDownHandler);
    _multiListener(_removeListener2, _doc, "pointerup,touchend,mouseup", _pointerUpHandler);
    _resizeDelay.kill();
    _iterateAutoRefresh(_removeListener2);
    for (var i = 0; i < _scrollers.length; i += 3) {
      _wheelListener(_removeListener2, _scrollers[i], _scrollers[i + 1]);
      _wheelListener(_removeListener2, _scrollers[i], _scrollers[i + 2]);
    }
  };
  ScrollTrigger2.enable = function enable() {
    _win = window;
    _doc = document;
    _docEl = _doc.documentElement;
    _body = _doc.body;
    if (gsap) {
      _toArray = gsap.utils.toArray;
      _clamp = gsap.utils.clamp;
      _context = gsap.core.context || _passThrough;
      _suppressOverwrites = gsap.core.suppressOverwrites || _passThrough;
      _scrollRestoration = _win.history.scrollRestoration || "auto";
      _lastScroll = _win.pageYOffset || 0;
      gsap.core.globals("ScrollTrigger", ScrollTrigger2);
      if (_body) {
        _enabled = 1;
        _div100vh = document.createElement("div");
        _div100vh.style.height = "100vh";
        _div100vh.style.position = "absolute";
        _refresh100vh();
        _rafBugFix();
        Observer.register(gsap);
        ScrollTrigger2.isTouch = Observer.isTouch;
        _fixIOSBug = Observer.isTouch && /(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent);
        _ignoreMobileResize = Observer.isTouch === 1;
        _addListener2(_win, "wheel", _onScroll2);
        _root = [_win, _doc, _docEl, _body];
        if (gsap.matchMedia) {
          ScrollTrigger2.matchMedia = function(vars) {
            var mm = gsap.matchMedia(), p;
            for (p in vars) {
              mm.add(p, vars[p]);
            }
            return mm;
          };
          gsap.addEventListener("matchMediaInit", function() {
            _recordScrollPositions();
            _revertAll();
          });
          gsap.addEventListener("matchMediaRevert", function() {
            return _revertRecorded();
          });
          gsap.addEventListener("matchMedia", function() {
            _refreshAll(0, 1);
            _dispatch("matchMedia");
          });
          gsap.matchMedia().add("(orientation: portrait)", function() {
            _setBaseDimensions();
            return _setBaseDimensions;
          });
        } else {
          console.warn("Requires GSAP 3.11.0 or later");
        }
        _setBaseDimensions();
        _addListener2(_doc, "scroll", _onScroll2);
        var bodyHasStyle = _body.hasAttribute("style"), bodyStyle = _body.style, border = bodyStyle.borderTopStyle, AnimationProto = gsap.core.Animation.prototype, bounds, i;
        AnimationProto.revert || Object.defineProperty(AnimationProto, "revert", {
          value: function value() {
            return this.time(-0.01, true);
          }
        });
        bodyStyle.borderTopStyle = "solid";
        bounds = _getBounds(_body);
        _vertical.m = Math.round(bounds.top + _vertical.sc()) || 0;
        _horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
        border ? bodyStyle.borderTopStyle = border : bodyStyle.removeProperty("border-top-style");
        if (!bodyHasStyle) {
          _body.setAttribute("style", "");
          _body.removeAttribute("style");
        }
        _syncInterval = setInterval(_sync, 250);
        gsap.delayedCall(0.5, function() {
          return _startup = 0;
        });
        _addListener2(_doc, "touchcancel", _passThrough);
        _addListener2(_body, "touchstart", _passThrough);
        _multiListener(_addListener2, _doc, "pointerdown,touchstart,mousedown", _pointerDownHandler);
        _multiListener(_addListener2, _doc, "pointerup,touchend,mouseup", _pointerUpHandler);
        _transformProp = gsap.utils.checkPrefix("transform");
        _stateProps.push(_transformProp);
        _coreInitted = _getTime();
        _resizeDelay = gsap.delayedCall(0.2, _refreshAll).pause();
        _autoRefresh = [_doc, "visibilitychange", function() {
          var w = _win.innerWidth, h = _win.innerHeight;
          if (_doc.hidden) {
            _prevWidth = w;
            _prevHeight = h;
          } else if (_prevWidth !== w || _prevHeight !== h) {
            _onResize();
          }
        }, _doc, "DOMContentLoaded", _refreshAll, _win, "load", _refreshAll, _win, "resize", _onResize];
        _iterateAutoRefresh(_addListener2);
        _triggers.forEach(function(trigger) {
          return trigger.enable(0, 1);
        });
        for (i = 0; i < _scrollers.length; i += 3) {
          _wheelListener(_removeListener2, _scrollers[i], _scrollers[i + 1]);
          _wheelListener(_removeListener2, _scrollers[i], _scrollers[i + 2]);
        }
      }
    }
  };
  ScrollTrigger2.config = function config3(vars) {
    "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
    var ms = vars.syncInterval;
    ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);
    "ignoreMobileResize" in vars && (_ignoreMobileResize = ScrollTrigger2.isTouch === 1 && vars.ignoreMobileResize);
    if ("autoRefreshEvents" in vars) {
      _iterateAutoRefresh(_removeListener2) || _iterateAutoRefresh(_addListener2, vars.autoRefreshEvents || "none");
      _ignoreResize = (vars.autoRefreshEvents + "").indexOf("resize") === -1;
    }
  };
  ScrollTrigger2.scrollerProxy = function scrollerProxy(target, vars) {
    var t = _getTarget(target), i = _scrollers.indexOf(t), isViewport = _isViewport2(t);
    if (~i) {
      _scrollers.splice(i, isViewport ? 6 : 2);
    }
    if (vars) {
      isViewport ? _proxies.unshift(_win, vars, _body, vars, _docEl, vars) : _proxies.unshift(t, vars);
    }
  };
  ScrollTrigger2.clearMatchMedia = function clearMatchMedia(query) {
    _triggers.forEach(function(t) {
      return t._ctx && t._ctx.query === query && t._ctx.kill(true, true);
    });
  };
  ScrollTrigger2.isInViewport = function isInViewport(element, ratio, horizontal) {
    var bounds = (_isString(element) ? _getTarget(element) : element).getBoundingClientRect(), offset = bounds[horizontal ? _width : _height] * ratio || 0;
    return horizontal ? bounds.right - offset > 0 && bounds.left + offset < _win.innerWidth : bounds.bottom - offset > 0 && bounds.top + offset < _win.innerHeight;
  };
  ScrollTrigger2.positionInViewport = function positionInViewport(element, referencePoint, horizontal) {
    _isString(element) && (element = _getTarget(element));
    var bounds = element.getBoundingClientRect(), size = bounds[horizontal ? _width : _height], offset = referencePoint == null ? size / 2 : referencePoint in _keywords ? _keywords[referencePoint] * size : ~referencePoint.indexOf("%") ? parseFloat(referencePoint) * size / 100 : parseFloat(referencePoint) || 0;
    return horizontal ? (bounds.left + offset) / _win.innerWidth : (bounds.top + offset) / _win.innerHeight;
  };
  ScrollTrigger2.killAll = function killAll(allowListeners) {
    _triggers.slice(0).forEach(function(t) {
      return t.vars.id !== "ScrollSmoother" && t.kill();
    });
    if (allowListeners !== true) {
      var listeners = _listeners.killAll || [];
      _listeners = {};
      listeners.forEach(function(f) {
        return f();
      });
    }
  };
  return ScrollTrigger2;
})();
ScrollTrigger.version = "3.14.1";
ScrollTrigger.saveStyles = function(targets) {
  return targets ? _toArray(targets).forEach(function(target) {
    if (target && target.style) {
      var i = _savedStyles.indexOf(target);
      i >= 0 && _savedStyles.splice(i, 5);
      _savedStyles.push(target, target.style.cssText, target.getBBox && target.getAttribute("transform"), gsap.core.getCache(target), _context());
    }
  }) : _savedStyles;
};
ScrollTrigger.revert = function(soft, media) {
  return _revertAll(!soft, media);
};
ScrollTrigger.create = function(vars, animation) {
  return new ScrollTrigger(vars, animation);
};
ScrollTrigger.refresh = function(safe) {
  return safe ? _onResize(true) : (_coreInitted || ScrollTrigger.register()) && _refreshAll(true);
};
ScrollTrigger.update = function(force) {
  return ++_scrollers.cache && _updateAll(force === true ? 2 : 0);
};
ScrollTrigger.clearScrollMemory = _clearScrollMemory;
ScrollTrigger.maxScroll = function(element, horizontal) {
  return _maxScroll(element, horizontal ? _horizontal : _vertical);
};
ScrollTrigger.getScrollFunc = function(element, horizontal) {
  return _getScrollFunc(_getTarget(element), horizontal ? _horizontal : _vertical);
};
ScrollTrigger.getById = function(id) {
  return _ids[id];
};
ScrollTrigger.getAll = function() {
  return _triggers.filter(function(t) {
    return t.vars.id !== "ScrollSmoother";
  });
};
ScrollTrigger.isScrolling = function() {
  return !!_lastScrollTime;
};
ScrollTrigger.snapDirectional = _snapDirectional;
ScrollTrigger.addEventListener = function(type, callback) {
  var a = _listeners[type] || (_listeners[type] = []);
  ~a.indexOf(callback) || a.push(callback);
};
ScrollTrigger.removeEventListener = function(type, callback) {
  var a = _listeners[type], i = a && a.indexOf(callback);
  i >= 0 && a.splice(i, 1);
};
ScrollTrigger.batch = function(targets, vars) {
  var result = [], varsCopy = {}, interval = vars.interval || 0.016, batchMax = vars.batchMax || 1e9, proxyCallback = function proxyCallback2(type, callback) {
    var elements = [], triggers = [], delay = gsap.delayedCall(interval, function() {
      callback(elements, triggers);
      elements = [];
      triggers = [];
    }).pause();
    return function(self2) {
      elements.length || delay.restart(true);
      elements.push(self2.trigger);
      triggers.push(self2);
      batchMax <= elements.length && delay.progress(1);
    };
  }, p;
  for (p in vars) {
    varsCopy[p] = p.substr(0, 2) === "on" && _isFunction(vars[p]) && p !== "onRefreshInit" ? proxyCallback(p, vars[p]) : vars[p];
  }
  if (_isFunction(batchMax)) {
    batchMax = batchMax();
    _addListener2(ScrollTrigger, "refresh", function() {
      return batchMax = vars.batchMax();
    });
  }
  _toArray(targets).forEach(function(target) {
    var config3 = {};
    for (p in varsCopy) {
      config3[p] = varsCopy[p];
    }
    config3.trigger = target;
    result.push(ScrollTrigger.create(config3));
  });
  return result;
};
var _clampScrollAndGetDurationMultiplier = function _clampScrollAndGetDurationMultiplier2(scrollFunc, current, end, max) {
  current > max ? scrollFunc(max) : current < 0 && scrollFunc(0);
  return end > max ? (max - current) / (end - current) : end < 0 ? current / (current - end) : 1;
}, _allowNativePanning = function _allowNativePanning2(target, direction) {
  if (direction === true) {
    target.style.removeProperty("touch-action");
  } else {
    target.style.touchAction = direction === true ? "auto" : direction ? "pan-" + direction + (Observer.isTouch ? " pinch-zoom" : "") : "none";
  }
  target === _docEl && _allowNativePanning2(_body, direction);
}, _overflow = {
  auto: 1,
  scroll: 1
}, _nestedScroll = function _nestedScroll2(_ref5) {
  var event = _ref5.event, target = _ref5.target, axis = _ref5.axis;
  var node = (event.changedTouches ? event.changedTouches[0] : event).target, cache2 = node._gsap || gsap.core.getCache(node), time = _getTime(), cs;
  if (!cache2._isScrollT || time - cache2._isScrollT > 2e3) {
    while (node && node !== _body && (node.scrollHeight <= node.clientHeight && node.scrollWidth <= node.clientWidth || !(_overflow[(cs = _getComputedStyle(node)).overflowY] || _overflow[cs.overflowX]))) {
      node = node.parentNode;
    }
    cache2._isScroll = node && node !== target && !_isViewport2(node) && (_overflow[(cs = _getComputedStyle(node)).overflowY] || _overflow[cs.overflowX]);
    cache2._isScrollT = time;
  }
  if (cache2._isScroll || axis === "x") {
    event.stopPropagation();
    event._gsapAllow = true;
  }
}, _inputObserver = function _inputObserver2(target, type, inputs, nested) {
  return Observer.create({
    target,
    capture: true,
    debounce: false,
    lockAxis: true,
    type,
    onWheel: nested = nested && _nestedScroll,
    onPress: nested,
    onDrag: nested,
    onScroll: nested,
    onEnable: function onEnable() {
      return inputs && _addListener2(_doc, Observer.eventTypes[0], _captureInputs, false, true);
    },
    onDisable: function onDisable() {
      return _removeListener2(_doc, Observer.eventTypes[0], _captureInputs, true);
    }
  });
}, _inputExp = /(input|label|select|textarea)/i, _inputIsFocused, _captureInputs = function _captureInputs2(e) {
  var isInput = _inputExp.test(e.target.tagName);
  if (isInput || _inputIsFocused) {
    e._gsapAllow = true;
    _inputIsFocused = isInput;
  }
}, _getScrollNormalizer = function _getScrollNormalizer2(vars) {
  _isObject(vars) || (vars = {});
  vars.preventDefault = vars.isNormalizer = vars.allowClicks = true;
  vars.type || (vars.type = "wheel,touch");
  vars.debounce = !!vars.debounce;
  vars.id = vars.id || "normalizer";
  var _vars2 = vars, normalizeScrollX = _vars2.normalizeScrollX, momentum = _vars2.momentum, allowNestedScroll = _vars2.allowNestedScroll, onRelease = _vars2.onRelease, self2, maxY, target = _getTarget(vars.target) || _docEl, smoother = gsap.core.globals().ScrollSmoother, smootherInstance = smoother && smoother.get(), content = _fixIOSBug && (vars.content && _getTarget(vars.content) || smootherInstance && vars.content !== false && !smootherInstance.smooth() && smootherInstance.content()), scrollFuncY = _getScrollFunc(target, _vertical), scrollFuncX = _getScrollFunc(target, _horizontal), scale = 1, initialScale = (Observer.isTouch && _win.visualViewport ? _win.visualViewport.scale * _win.visualViewport.width : _win.outerWidth) / _win.innerWidth, wheelRefresh = 0, resolveMomentumDuration = _isFunction(momentum) ? function() {
    return momentum(self2);
  } : function() {
    return momentum || 2.8;
  }, lastRefreshID, skipTouchMove, inputObserver = _inputObserver(target, vars.type, true, allowNestedScroll), resumeTouchMove = function resumeTouchMove2() {
    return skipTouchMove = false;
  }, scrollClampX = _passThrough, scrollClampY = _passThrough, updateClamps = function updateClamps2() {
    maxY = _maxScroll(target, _vertical);
    scrollClampY = _clamp(_fixIOSBug ? 1 : 0, maxY);
    normalizeScrollX && (scrollClampX = _clamp(0, _maxScroll(target, _horizontal)));
    lastRefreshID = _refreshID;
  }, removeContentOffset = function removeContentOffset2() {
    content._gsap.y = _round(parseFloat(content._gsap.y) + scrollFuncY.offset) + "px";
    content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + parseFloat(content._gsap.y) + ", 0, 1)";
    scrollFuncY.offset = scrollFuncY.cacheID = 0;
  }, ignoreDrag = function ignoreDrag2() {
    if (skipTouchMove) {
      requestAnimationFrame(resumeTouchMove);
      var offset = _round(self2.deltaY / 2), scroll = scrollClampY(scrollFuncY.v - offset);
      if (content && scroll !== scrollFuncY.v + scrollFuncY.offset) {
        scrollFuncY.offset = scroll - scrollFuncY.v;
        var y = _round((parseFloat(content && content._gsap.y) || 0) - scrollFuncY.offset);
        content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + y + ", 0, 1)";
        content._gsap.y = y + "px";
        scrollFuncY.cacheID = _scrollers.cache;
        _updateAll();
      }
      return true;
    }
    scrollFuncY.offset && removeContentOffset();
    skipTouchMove = true;
  }, tween, startScrollX, startScrollY, onStopDelayedCall, onResize = function onResize2() {
    updateClamps();
    if (tween.isActive() && tween.vars.scrollY > maxY) {
      scrollFuncY() > maxY ? tween.progress(1) && scrollFuncY(maxY) : tween.resetTo("scrollY", maxY);
    }
  };
  content && gsap.set(content, {
    y: "+=0"
  });
  vars.ignoreCheck = function(e) {
    return _fixIOSBug && e.type === "touchmove" && ignoreDrag() || scale > 1.05 && e.type !== "touchstart" || self2.isGesturing || e.touches && e.touches.length > 1;
  };
  vars.onPress = function() {
    skipTouchMove = false;
    var prevScale = scale;
    scale = _round((_win.visualViewport && _win.visualViewport.scale || 1) / initialScale);
    tween.pause();
    prevScale !== scale && _allowNativePanning(target, scale > 1.01 ? true : normalizeScrollX ? false : "x");
    startScrollX = scrollFuncX();
    startScrollY = scrollFuncY();
    updateClamps();
    lastRefreshID = _refreshID;
  };
  vars.onRelease = vars.onGestureStart = function(self3, wasDragging) {
    scrollFuncY.offset && removeContentOffset();
    if (!wasDragging) {
      onStopDelayedCall.restart(true);
    } else {
      _scrollers.cache++;
      var dur = resolveMomentumDuration(), currentScroll, endScroll;
      if (normalizeScrollX) {
        currentScroll = scrollFuncX();
        endScroll = currentScroll + dur * 0.05 * -self3.velocityX / 0.227;
        dur *= _clampScrollAndGetDurationMultiplier(scrollFuncX, currentScroll, endScroll, _maxScroll(target, _horizontal));
        tween.vars.scrollX = scrollClampX(endScroll);
      }
      currentScroll = scrollFuncY();
      endScroll = currentScroll + dur * 0.05 * -self3.velocityY / 0.227;
      dur *= _clampScrollAndGetDurationMultiplier(scrollFuncY, currentScroll, endScroll, _maxScroll(target, _vertical));
      tween.vars.scrollY = scrollClampY(endScroll);
      tween.invalidate().duration(dur).play(0.01);
      if (_fixIOSBug && tween.vars.scrollY >= maxY || currentScroll >= maxY - 1) {
        gsap.to({}, {
          onUpdate: onResize,
          duration: dur
        });
      }
    }
    onRelease && onRelease(self3);
  };
  vars.onWheel = function() {
    tween._ts && tween.pause();
    if (_getTime() - wheelRefresh > 1e3) {
      lastRefreshID = 0;
      wheelRefresh = _getTime();
    }
  };
  vars.onChange = function(self3, dx, dy, xArray, yArray) {
    _refreshID !== lastRefreshID && updateClamps();
    dx && normalizeScrollX && scrollFuncX(scrollClampX(xArray[2] === dx ? startScrollX + (self3.startX - self3.x) : scrollFuncX() + dx - xArray[1]));
    if (dy) {
      scrollFuncY.offset && removeContentOffset();
      var isTouch = yArray[2] === dy, y = isTouch ? startScrollY + self3.startY - self3.y : scrollFuncY() + dy - yArray[1], yClamped = scrollClampY(y);
      isTouch && y !== yClamped && (startScrollY += yClamped - y);
      scrollFuncY(yClamped);
    }
    (dy || dx) && _updateAll();
  };
  vars.onEnable = function() {
    _allowNativePanning(target, normalizeScrollX ? false : "x");
    ScrollTrigger.addEventListener("refresh", onResize);
    _addListener2(_win, "resize", onResize);
    if (scrollFuncY.smooth) {
      scrollFuncY.target.style.scrollBehavior = "auto";
      scrollFuncY.smooth = scrollFuncX.smooth = false;
    }
    inputObserver.enable();
  };
  vars.onDisable = function() {
    _allowNativePanning(target, true);
    _removeListener2(_win, "resize", onResize);
    ScrollTrigger.removeEventListener("refresh", onResize);
    inputObserver.kill();
  };
  vars.lockAxis = vars.lockAxis !== false;
  self2 = new Observer(vars);
  self2.iOS = _fixIOSBug;
  _fixIOSBug && !scrollFuncY() && scrollFuncY(1);
  _fixIOSBug && gsap.ticker.add(_passThrough);
  onStopDelayedCall = self2._dc;
  tween = gsap.to(self2, {
    ease: "power4",
    paused: true,
    inherit: false,
    scrollX: normalizeScrollX ? "+=0.1" : "+=0",
    scrollY: "+=0.1",
    modifiers: {
      scrollY: _interruptionTracker(scrollFuncY, scrollFuncY(), function() {
        return tween.pause();
      })
    },
    onUpdate: _updateAll,
    onComplete: onStopDelayedCall.vars.onComplete
  });
  return self2;
};
ScrollTrigger.sort = function(func) {
  if (_isFunction(func)) {
    return _triggers.sort(func);
  }
  var scroll = _win.pageYOffset || 0;
  ScrollTrigger.getAll().forEach(function(t) {
    return t._sortY = t.trigger ? scroll + t.trigger.getBoundingClientRect().top : t.start + _win.innerHeight;
  });
  return _triggers.sort(func || function(a, b) {
    return (a.vars.refreshPriority || 0) * -1e6 + (a.vars.containerAnimation ? 1e6 : a._sortY) - ((b.vars.containerAnimation ? 1e6 : b._sortY) + (b.vars.refreshPriority || 0) * -1e6);
  });
};
ScrollTrigger.observe = function(vars) {
  return new Observer(vars);
};
ScrollTrigger.normalizeScroll = function(vars) {
  if (typeof vars === "undefined") {
    return _normalizer;
  }
  if (vars === true && _normalizer) {
    return _normalizer.enable();
  }
  if (vars === false) {
    _normalizer && _normalizer.kill();
    _normalizer = vars;
    return;
  }
  var normalizer = vars instanceof Observer ? vars : _getScrollNormalizer(vars);
  _normalizer && _normalizer.target === normalizer.target && _normalizer.kill();
  _isViewport2(normalizer.target) && (_normalizer = normalizer);
  return normalizer;
};
ScrollTrigger.core = {
  // smaller file size way to leverage in ScrollSmoother and Observer
  _getVelocityProp,
  _inputObserver,
  _scrollers,
  _proxies,
  bridge: {
    // when normalizeScroll sets the scroll position (ss = setScroll)
    ss: function ss() {
      _lastScrollTime || _dispatch("scrollStart");
      _lastScrollTime = _getTime();
    },
    // a way to get the _refreshing value in Observer
    ref: function ref() {
      return _refreshing;
    }
  }
};
_getGSAP2() && gsap.registerPlugin(ScrollTrigger);
var gsapWithCSS = gsap$2.registerPlugin(CSSPlugin) || gsap$2;
gsapWithCSS.core.Tween;
gsapWithCSS.registerPlugin(ScrollTrigger);
function gsapInit() {
  const gsapElements = document.querySelectorAll("[data-fls-splittype][data-fls-gsap]");
  if (gsapElements.length) {
    gsapElements.forEach((element) => {
      const chars = element.querySelectorAll(".char");
      const words = element.querySelectorAll(".word");
      if (chars.length) {
        gsapWithCSS.from(chars, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: {
            amount: 0.6,
            from: "start"
          },
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });
      } else if (words.length) {
        gsapWithCSS.from(words, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: {
            amount: 0.4,
            from: "start"
          },
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });
      }
    });
  }
  document.addEventListener("watcherCallback", (e) => {
    if (e.detail && e.detail.entry) {
      const entry = e.detail.entry;
      const target = entry.target;
      if (entry.isIntersecting && target.classList.contains("section")) {
        const content = target.querySelector(".section__content");
        if (content && !content.classList.contains("--animated")) {
          content.classList.add("--animated");
          gsapWithCSS.from(content, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out"
          });
        }
      }
    }
  });
}
document.querySelector("[data-fls-gsap]") ? window.addEventListener("load", gsapInit) : null;
document.addEventListener("DOMContentLoaded", () => {
  const countdowns = document.querySelectorAll("[data-countdown]");
  if (!countdowns.length) return;
  countdowns.forEach((block) => {
    const daysEl = block.querySelector("[data-countdown-days]");
    const hoursEl = block.querySelector("[data-countdown-hours]");
    const minutesEl = block.querySelector("[data-countdown-minutes]");
    const secondsEl = block.querySelector("[data-countdown-seconds]");
    const baseSeconds = parseInt(block.dataset.countdownSeconds, 10) || 86400;
    const timerId = block.dataset.countdownId || "countdown-" + Date.now();
    const storageKey = `countdown_${timerId}`;
    let endTimestamp = parseInt(localStorage.getItem(storageKey), 10);
    if (!endTimestamp || endTimestamp <= Date.now()) {
      endTimestamp = Date.now() + baseSeconds * 1e3;
      localStorage.setItem(storageKey, endTimestamp.toString());
    }
    let timerIdInterval;
    const pad = (n) => String(n).padStart(2, "0");
    const update = () => {
      const now = Date.now();
      let remaining = Math.max(0, Math.floor((endTimestamp - now) / 1e3));
      if (remaining <= 0) {
        endTimestamp = Date.now() + baseSeconds * 1e3;
        localStorage.setItem(storageKey, endTimestamp.toString());
        remaining = baseSeconds;
      }
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor(remaining % 86400 / 3600);
      const minutes = Math.floor(remaining % 3600 / 60);
      const seconds = remaining % 60;
      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    };
    update();
    timerIdInterval = setInterval(update, 1e3);
    block.addEventListener("removed", () => {
      clearInterval(timerIdInterval);
    });
  });
});
function initPricingForm() {
  const pricingForm = document.querySelector('[data-fls-popup="pricing-form"]');
  if (!pricingForm) return;
  let lastService = null;
  let lastPrice = null;
  let select = pricingForm.querySelector("select#service-select");
  const totalPriceElement = pricingForm.querySelector("#total-price");
  if (!select || !totalPriceElement) return;
  function updatePrice() {
    select = pricingForm.querySelector('select[name="service_plan"]');
    if (!select) return;
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.dataset.price) {
      const price = parseInt(selectedOption.dataset.price);
      totalPriceElement.textContent = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    } else {
      totalPriceElement.textContent = "0 руб.";
    }
  }
  document.addEventListener("selectCallback", function(e) {
    if (e.detail && e.detail.select) {
      const changedSelect = e.detail.select;
      if ((changedSelect.name === "service_plan" || changedSelect.id === "service-select") && changedSelect.closest('[data-fls-popup="pricing-form"]')) {
        updatePrice();
      }
    }
  });
  select.addEventListener("change", updatePrice);
  const handlePopupOpen = function(e) {
    const openedPopup = document.querySelector('[data-fls-popup="pricing-form"][aria-hidden="false"]');
    if (openedPopup && openedPopup === pricingForm) {
      setTimeout(() => {
        select = pricingForm.querySelector('select[name="service_plan"]');
        if (select) {
          if (lastService) {
            const optionToSelect = Array.from(select.options).find(
              (opt) => opt.value === lastService || opt.dataset.price === lastPrice
            );
            if (optionToSelect) {
              optionToSelect.selected = true;
            }
          }
          updatePrice();
        }
      }, 200);
    }
  };
  document.addEventListener("afterPopupOpen", handlePopupOpen);
  document.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-fls-popup-link="pricing-form"][data-service][data-price]');
    if (!btn) return;
    lastService = btn.dataset.service || null;
    lastPrice = btn.dataset.price || null;
  });
  updatePrice();
}
if (document.querySelector('[data-fls-popup="pricing-form"]')) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPricingForm);
  } else {
    initPricingForm();
  }
}
function initPopupFormReset() {
  if (!window.flsPopup) {
    setTimeout(initPopupFormReset, 100);
    return;
  }
  const handlePopupOpen = function() {
    setTimeout(() => {
      const openedPopup = window.flsPopup?.previousOpen?.element;
      if (openedPopup) {
        const forms = openedPopup.querySelectorAll("form[data-fls-form]");
        forms.forEach((form) => {
          formValidate.formClean(form);
        });
      }
    }, 150);
  };
  const handlePopupClose = function() {
    setTimeout(() => {
      const closedPopup = window.flsPopup?.lastClosed?.element || window.flsPopup?.previousOpen?.element;
      if (closedPopup) {
        const forms = closedPopup.querySelectorAll("form[data-fls-form]");
        forms.forEach((form) => {
          formValidate.formClean(form);
        });
      }
    }, 150);
  };
  document.addEventListener("afterPopupOpen", handlePopupOpen);
  document.addEventListener("afterPopupClose", handlePopupClose);
}
if (document.querySelector("[data-fls-popup]")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initPopupFormReset, 500);
    });
  } else {
    setTimeout(initPopupFormReset, 500);
  }
}
