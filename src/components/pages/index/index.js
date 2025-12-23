document.addEventListener('DOMContentLoaded', () => {
	const countdowns = document.querySelectorAll('[data-countdown]');
	if (!countdowns.length) return;

	countdowns.forEach((block) => {
		const daysEl = block.querySelector('[data-countdown-days]');
		const hoursEl = block.querySelector('[data-countdown-hours]');
		const minutesEl = block.querySelector('[data-countdown-minutes]');
		const secondsEl = block.querySelector('[data-countdown-seconds]');
		const baseSeconds = parseInt(block.dataset.countdownSeconds, 10) || 86400;
		const timerId = block.dataset.countdownId || 'countdown-' + Date.now();

		// Получаем сохраненное время окончания из localStorage
		const storageKey = `countdown_${timerId}`;
		let endTimestamp = parseInt(localStorage.getItem(storageKey), 10);

		// Если нет сохраненного времени или оно уже прошло, создаем новое
		if (!endTimestamp || endTimestamp <= Date.now()) {
			endTimestamp = Date.now() + baseSeconds * 1000;
			localStorage.setItem(storageKey, endTimestamp.toString());
		}

		let timerIdInterval;

		const pad = (n) => String(n).padStart(2, '0');

		const update = () => {
			const now = Date.now();
			let remaining = Math.max(0, Math.floor((endTimestamp - now) / 1000));

			// Если время истекло, создаем новый таймер и сохраняем
			if (remaining <= 0) {
				endTimestamp = Date.now() + baseSeconds * 1000;
				localStorage.setItem(storageKey, endTimestamp.toString());
				remaining = baseSeconds;
			}

			const days = Math.floor(remaining / 86400);
			const hours = Math.floor((remaining % 86400) / 3600);
			const minutes = Math.floor((remaining % 3600) / 60);
			const seconds = remaining % 60;

			if (daysEl) daysEl.textContent = pad(days);
			if (hoursEl) hoursEl.textContent = pad(hours);
			if (minutesEl) minutesEl.textContent = pad(minutes);
			if (secondsEl) secondsEl.textContent = pad(seconds);
		};

		update();
		timerIdInterval = setInterval(update, 1000);

		block.addEventListener('removed', () => {
			clearInterval(timerIdInterval);
		});
	});
});
