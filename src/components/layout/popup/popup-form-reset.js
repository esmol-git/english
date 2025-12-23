// Сброс состояния форм при открытии и закрытии попапов
import { formValidate } from '../../forms/_functions.js';

function initPopupFormReset() {
	if (!window.flsPopup) {
		// Ждем инициализации попапа
		setTimeout(initPopupFormReset, 100);
		return;
	}

	// Обработчик открытия попапа - очищаем формы
	const handlePopupOpen = function() {
		setTimeout(() => {
			const openedPopup = window.flsPopup?.previousOpen?.element;
			if (openedPopup) {
				// Находим все формы в попапе
				const forms = openedPopup.querySelectorAll('form[data-fls-form]');
				forms.forEach(form => {
					// Очищаем форму при открытии
					formValidate.formClean(form);
				});
			}
		}, 150);
	};

	// Обработчик закрытия попапа - очищаем формы
	const handlePopupClose = function() {
		setTimeout(() => {
			const closedPopup = window.flsPopup?.lastClosed?.element || window.flsPopup?.previousOpen?.element;
			if (closedPopup) {
				// Находим все формы в попапе
				const forms = closedPopup.querySelectorAll('form[data-fls-form]');
				forms.forEach(form => {
					// Очищаем форму при закрытии
					formValidate.formClean(form);
				});
			}
		}, 150);
	};

	// Подписываемся на события
	document.addEventListener('afterPopupOpen', handlePopupOpen);
	document.addEventListener('afterPopupClose', handlePopupClose);
}

// Инициализация после загрузки попапа
if (document.querySelector('[data-fls-popup]')) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			setTimeout(initPopupFormReset, 500);
		});
	} else {
		setTimeout(initPopupFormReset, 500);
	}
}

