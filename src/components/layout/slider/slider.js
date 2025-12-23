/*
Документация по работе в шаблоне: 
Документация слайдера: https://swiperjs.com/
Сниппет(HTML): swiper
*/

// Подключаем слайдер Swiper из node_modules
// При необходимости подключаем дополнительные модули слайдера, указывая их в {} через запятую
// Пример: { Navigation, Autoplay }
import Swiper from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
/*
Основные модули слайдера:
Navigation, Pagination, Autoplay, 
EffectFade, Lazy, Manipulation
Подробнее смотри https://swiperjs.com/
*/

// Стили Swiper
// Подключение базовых стилей
import "./slider.scss";
// Полный набор стилей из node_modules
// import 'swiper/css/bundle';

// Инициализация слайдеров
function initSliders() {
	// Список слайдеров
	// Проверяем, есть ли слайдер на странице
	if (document.querySelector('.swiper')) { // <- Указываем класс нужного слайдера
		// Создаем слайдер
		new Swiper('.gallery__slider', { // <- Указываем класс нужного слайдера
			// Подключаем модули слайдера
			// для конкретного случая
			modules: [Navigation, Autoplay],
			observer: true,
			observeParents: true,
			slidesPerView: 1.6,
			spaceBetween: 20,
			//autoHeight: true,
			speed: 800,
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			//touchRatio: 0,
			//simulateTouch: false,
			loop: true,
			//preloadImages: false,
			//lazy: true,

			/*
			// Эффекты
			effect: 'fade',
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			*/

			// Пагинация
			/*
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
			*/

			// Скроллбар
			/*
			scrollbar: {
				el: '.swiper-scrollbar',
				draggable: true,
			},
			*/

			// Кнопки "влево/вправо"
			navigation: {
				prevEl: '.swiper-button-prev',
				nextEl: '.swiper-button-next',
			},
			// Брейкпоинты
			breakpoints: {
				0: {
					slidesPerView: 1,
					spaceBetween: 20,
				},
				768: {
					slidesPerView: 1.6,
					spaceBetween: 20,
				},
				992: {
					slidesPerView: 1.6,
					spaceBetween: 20,
				},
				1268: {
					slidesPerView: 1.6,
					spaceBetween: 20,
				},
			},
			// События
			on: {

			}
		});
	}
}
document.querySelector('[data-fls-slider]') ?
	window.addEventListener("load", initSliders) : null
