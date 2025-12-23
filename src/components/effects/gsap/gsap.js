// Подключение функционала " Чертоги фрилансера"
import { FLS } from "@js/common/functions.js";
// Docs: https://www.npmjs.com/package/gsap
import { gsap, ScrollTrigger, Draggable, MotionPathPlugin } from "gsap/all";
// Стили модуля
import './gsap.scss'

// Регистрация плагинов GSAP
gsap.registerPlugin(ScrollTrigger);

function gsapInit() {
	// Анимация для элементов с splittype и gsap
	const gsapElements = document.querySelectorAll('[data-fls-splittype][data-fls-gsap]');
	
	if (gsapElements.length) {
		gsapElements.forEach((element) => {
			const chars = element.querySelectorAll('.char');
			const words = element.querySelectorAll('.word');
			
			if (chars.length) {
				// Анимация появления символов
				gsap.from(chars, {
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
				// Анимация появления слов
				gsap.from(words, {
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

	// Анимация для контента секций при появлении через watcher
	document.addEventListener("watcherCallback", (e) => {
		if (e.detail && e.detail.entry) {
			const entry = e.detail.entry;
			const target = entry.target;
			
			if (entry.isIntersecting && target.classList.contains('section')) {
				const content = target.querySelector('.section__content');
				if (content && !content.classList.contains('--animated')) {
					content.classList.add('--animated');
					gsap.from(content, {
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

document.querySelector('[data-fls-gsap]') ?
	window.addEventListener('load', gsapInit) : null
