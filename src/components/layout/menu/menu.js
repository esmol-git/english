// Подключение функционала "Чертоги Фрилансера"
import { addTouchAttr, bodyLockStatus, bodyLockToggle, FLS } from "@js/common/functions.js"

import './menu.scss'

export function menuInit() {
	document.addEventListener("click", function (e) {
		if (bodyLockStatus && e.target.closest('[data-fls-menu]')) {
			bodyLockToggle()
			document.documentElement.toggleAttribute("data-fls-menu-open")
		}
	})
	
	// Закрытие меню при клике на кнопку закрытия
	const closeButtons = document.querySelectorAll('.menu__close');
	closeButtons.forEach(btn => {
		btn.addEventListener('click', function() {
			if (document.documentElement.hasAttribute("data-fls-menu-open")) {
				bodyLockToggle()
				document.documentElement.removeAttribute("data-fls-menu-open")
			}
		})
	})
}

document.querySelector('[data-fls-menu]') ?
	window.addEventListener('load', menuInit) : null
