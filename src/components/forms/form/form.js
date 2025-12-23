// Подключение функционала "Чертоги фрилансера
import { gotoBlock, FLS } from "@js/common/functions.js";
// Подключение функционала модуля форм
import { formValidate } from "../_functions.js";

import './form.scss'

function formInit() {
	// Отправка форм
	function formSubmit() {
		const forms = document.forms;
		if (forms.length) {
			for (const form of forms) {
				// Убираем встроенную валидацию
				!form.hasAttribute('data-fls-form-novalidate') ? form.setAttribute('novalidate', true) : null
				// Событие отправки
				form.addEventListener('submit', function (e) {
					const form = e.target;
					formSubmitAction(form, e);
				});
				// Событие очистки
				form.addEventListener('reset', function (e) {
					const form = e.target;
					formValidate.formClean(form);
				});
			}
		}
		async function formSubmitAction(form, e) {
			const error = formValidate.getErrors(form)
			if (error === 0) {
				if (form.dataset.flsForm === 'ajax') { // Если режим ajax
					e.preventDefault();
					const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
					const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
					const formData = new FormData(form);
					form.classList.add('--sending');
					const response = await fetch(formAction, {
						method: formMethod,
						body: formData
					});
					if (response.ok) {
						let responseResult = await response.json()
						form.classList.remove('--sending')
						formSent(form, responseResult)
					} else {
						FLS("_FLS_FORM_AJAX_ERR")
						form.classList.remove('--sending')
					}
				} else if (form.dataset.flsForm === 'dev') {	// Если режим разработки
					e.preventDefault()
					formSent(form)
				}
			} else {
				e.preventDefault();
				if (form.querySelector('.--form-error') && form.hasAttribute('data-fls-form-gotoerr')) {
					const formGoToErrorClass = form.dataset.flsFormGotoerr ? form.dataset.flsFormGotoerr : '.--form-error';
					gotoBlock(formGoToErrorClass);
				}
			}
		}
		// Действия после отправки формы
		function formSent(form, responseResult = ``) {
			// Создаем событие отправки формы
			document.dispatchEvent(new CustomEvent("formSent", {
				detail: {
					form: form
				}
			}));
			// Если режим разработки и форма находится в модалке
			if (form.dataset.flsForm === 'dev' && form.closest('[data-fls-popup]')) {
				// Закрываем текущую модалку и открываем модалку успеха
				if (window.flsPopup && window.flsPopup.isOpen) {
					// Закрываем текущую модалку
					window.flsPopup.close();
					
					// Просто открываем success попап через небольшую задержку
					// Используем несколько механизмов для надежности
					let opened = false;
					
					const openSuccessPopup = function() {
						if (!opened && window.flsPopup) {
							opened = true;
							window.flsPopup.open('success');
						}
					};
					
					// Способ 1: через событие
					document.addEventListener("afterPopupClose", function handler() {
						document.removeEventListener("afterPopupClose", handler);
						setTimeout(openSuccessPopup, 400);
					}, { once: true });
					
					// Способ 2: через таймер (на случай если событие не сработает)
					setTimeout(function() {
						if (!opened) {
							openSuccessPopup();
						}
					}, 800);
				} else {
					// Если попап не открыт, сразу открываем success
					setTimeout(() => {
						if (window.flsPopup) {
							window.flsPopup.open('success');
						}
					}, 100);
				}
			} else if (form.dataset.flsFormCta === 'true') {
				// Если это CTA форма на странице (cta-form или signup-form), показываем сообщение об успехе
				const ctaSuccessMessage = form.querySelector('.cta-form__success');
				const signupSuccessMessage = form.querySelector('.signup-form__success');
				const successMessage = ctaSuccessMessage || signupSuccessMessage;
				
				if (successMessage) {
					successMessage.classList.add('--active');
					// Скрываем сообщение через 4 секунды
					setTimeout(() => {
						successMessage.classList.remove('--active');
					}, 4000);
				}
			} else {
				// Показываем попап, если подключен модуль попапов 
				// и для формы указана настройка
				setTimeout(() => {
					if (window.flsPopup) {
						const popup = form.dataset.flsFormPopup;
						popup ? window.flsPopup.open(popup) : null;
					}
				}, 0);
			}
			// Очищаем форму
			formValidate.formClean(form);
			// Сообщаем в консоль
			FLS(`_FLS_FORM_SEND`);
		}
	}
	// Работа с полями формы.
	function formFieldsInit() {
		document.body.addEventListener("focusin", function (e) {
			const targetElement = e.target;
			if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
				if (!targetElement.hasAttribute('data-fls-form-nofocus')) {
					targetElement.classList.add('--form-focus');
					targetElement.parentElement.classList.add('--form-focus');
				}
				targetElement.hasAttribute('data-fls-form-validatenow') ? formValidate.removeError(targetElement) : null;
			}
		});
		document.body.addEventListener("focusout", function (e) {
			const targetElement = e.target;
			if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
				if (!targetElement.hasAttribute('data-fls-form-nofocus')) {
					targetElement.classList.remove('--form-focus');
					targetElement.parentElement.classList.remove('--form-focus');
				}
				// Мгновенная валидация
				targetElement.hasAttribute('data-fls-form-validatenow') ? formValidate.validateInput(targetElement) : null;
			}
		});
	}
	formSubmit()
	formFieldsInit()
}
document.querySelector('[data-fls-form]') ?
	window.addEventListener('load', formInit) : null
