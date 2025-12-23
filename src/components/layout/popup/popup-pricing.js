// Обработка изменения цены в форме записи на занятие
function initPricingForm() {
	const pricingForm = document.querySelector('[data-fls-popup="pricing-form"]');
	if (!pricingForm) return;

	let lastService = null;
	let lastPrice = null;

	// Находим оригинальный select (может быть внутри обертки кастомного селекта)
	let select = pricingForm.querySelector('select#service-select');
	const totalPriceElement = pricingForm.querySelector('#total-price');

	if (!select || !totalPriceElement) return;

	// Функция обновления цены
	function updatePrice() {
		// Находим select каждый раз, так как он может быть пересоздан
		select = pricingForm.querySelector('select[name="service_plan"]');
		if (!select) return;

		const selectedOption = select.options[select.selectedIndex];
		if (selectedOption && selectedOption.dataset.price) {
			const price = parseInt(selectedOption.dataset.price);
			totalPriceElement.textContent = new Intl.NumberFormat('ru-RU', {
				style: 'currency',
				currency: 'RUB',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(price);
		} else {
			totalPriceElement.textContent = '0 руб.';
		}
	}

	// Слушаем изменения в селекте через событие selectCallback
	document.addEventListener('selectCallback', function(e) {
		if (e.detail && e.detail.select) {
			const changedSelect = e.detail.select;
			// Проверяем по name или id
			if ((changedSelect.name === 'service_plan' || changedSelect.id === 'service-select') && 
				changedSelect.closest('[data-fls-popup="pricing-form"]')) {
				updatePrice();
			}
		}
	});

	// Также слушаем прямое изменение select
	select.addEventListener('change', updatePrice);

	// Обновляем при открытии модалки
	const handlePopupOpen = function(e) {
		const openedPopup = document.querySelector('[data-fls-popup="pricing-form"][aria-hidden="false"]');
		if (openedPopup && openedPopup === pricingForm) {
			setTimeout(() => {
				// Переинициализируем при открытии
				select = pricingForm.querySelector('select[name="service_plan"]');
				if (select) {
					// Проставляем выбранную услугу и цену, если они пришли с карточки
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

	// Подписываемся на открытие попапа
	document.addEventListener('afterPopupOpen', handlePopupOpen);

	// Слушаем клики по кнопкам "Записаться" в карточках
	document.addEventListener('click', (e) => {
		const btn = e.target.closest('[data-fls-popup-link="pricing-form"][data-service][data-price]');
		if (!btn) return;
		lastService = btn.dataset.service || null;
		lastPrice = btn.dataset.price || null;
	});

	// Инициализация при загрузке
	updatePrice(); // Обновляем сумму сразу при инициализации
}

// Инициализация при загрузке страницы
if (document.querySelector('[data-fls-popup="pricing-form"]')) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initPricingForm);
	} else {
		initPricingForm();
	}
}

