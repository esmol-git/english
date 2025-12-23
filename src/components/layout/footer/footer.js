import './footer.scss'

// Обновляем год динамически
document.addEventListener('DOMContentLoaded', () => {
	const yearElement = document.querySelector('[data-footer-year]');
	if (yearElement) {
		const currentYear = new Date().getFullYear();
		yearElement.textContent = currentYear;
	}
});