// Подключение функционала " Чертоги фрилансера"
import { isMobile, gotoBlock, getHash, FLS, bodyUnlock } from "@js/common/functions.js";

// Плавная навигация по странице
export function pageNavigation() {
	// Работаем при нажатии на пункт
	document.addEventListener("click", pageNavigationAction);
	// Если подключен scrollWatcher, подсвечиваем текущий пункт меню
	document.addEventListener("watcherCallback", pageNavigationAction);
	// Основная функция
	function pageNavigationAction(e) {
		if (e.type === "click") {
			const targetElement = e.target;
			if (targetElement.closest('[data-fls-scrollto]')) {
				const gotoLink = targetElement.closest('[data-fls-scrollto]');
				const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : '';
				const noHeader = gotoLink.hasAttribute('data-fls-scrollto-header') ? true : false;
				const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
				const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
				if (window.fullpage) {
					const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest('[data-fls-fullpage-section]');
					const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
					if (fullpageSectionId !== null) {
						window.fullpage.switchingSection(fullpageSectionId);
						// Закрываем меню, если оно открыто
						if (document.documentElement.hasAttribute("data-fls-menu-open")) {
							bodyUnlock()
							document.documentElement.removeAttribute("data-fls-menu-open")
						}
					}
				} else {
					gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
					// Закрываем меню, если оно открыто (мобильная версия)
					if (document.documentElement.hasAttribute("data-fls-menu-open")) {
						bodyUnlock()
						document.documentElement.removeAttribute("data-fls-menu-open")
					}
				}
				e.preventDefault();
			}
		} else if (e.type === "watcherCallback" && e.detail) {
			const entry = e.detail.entry;
			const targetElement = entry.target;
			// Обработка пунктов навигации: если указано значение navigator — подсвечиваем текущий пункт меню
			if (targetElement.dataset.flsWatcher === 'navigator') {
				const navigatorActiveItem = document.querySelector(`[data-fls-scrollto].--navigator-active`);
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
					// Видим объект
					// navigatorActiveItem ? navigatorActiveItem.classList.remove('--navigator-active') : null;
					navigatorCurrentItem ? navigatorCurrentItem.classList.add('--navigator-active') : null;
					//const activeItems = document.querySelectorAll('.--navigator-active');
					//activeItems.length > 1 ? chooseOne(activeItems) : null
				} else {
					// Не видим объект
					navigatorCurrentItem ? navigatorCurrentItem.classList.remove('--navigator-active') : null;
				}
			}
		}
	}
	function chooseOne(activeItems) { }
	
	// Предотвращаем автоматический скролл браузера к якорю при загрузке
	if (location.hash) {
		// Временно убираем хэш из URL
		const hash = location.hash;
		history.replaceState(null, null, ' ');
		// Возвращаем хэш после небольшой задержки
		setTimeout(() => {
			history.replaceState(null, null, hash);
		}, 0);
	}
	
	// Прокрутка по хэшу только если он явно указан в URL
	// Ждем полной загрузки страницы перед проверкой хэша
	window.addEventListener('load', () => {
		const hash = getHash();
		if (hash && hash !== 'hero') {
			// Если есть хэш в URL (и это не hero), делаем плавный переход
			let goToHash;
			if (document.querySelector(`#${hash}`)) {
				goToHash = `#${hash}`;
			} else if (document.querySelector(`.${hash}`)) {
				goToHash = `.${hash}`;
			}
			if (goToHash) {
				// Небольшая задержка для корректной работы
				setTimeout(() => {
					gotoBlock(goToHash, false, 500, 0);
				}, 100);
			}
		} else {
			// Если нет хэша или хэш = hero, остаемся на hero и активируем "Главная"
			// Прокручиваем наверх, если нужно
			if (window.scrollY > 100) {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
			const heroLink = document.querySelector('[data-fls-scrollto="#hero"]');
			if (heroLink) {
				// Убираем активность у всех пунктов меню
				document.querySelectorAll('[data-fls-scrollto].--navigator-active').forEach(item => {
					item.classList.remove('--navigator-active');
				});
				// Активируем "Главная"
				heroLink.classList.add('--navigator-active');
			}
		}
	});
}

document.querySelector('[data-fls-scrollto]') ?
	window.addEventListener('load', pageNavigation) : null
