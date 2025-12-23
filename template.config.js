import path from 'path';
const projectName = path.basename(path.resolve()).toLowerCase()

export default {
	lang: 'ru',
	vscode: {
		settings: true,
		snippets: true
	},
	devcomponents: {
		enable: false,
		filename: '_components.html'
	},
	newpage: {
		copyfromindex: false,
		usetemplate: 'main'
	},
	git: {
		repo: ``,
		branch: `main`
	},
	navpanel: {
		dev: true,
		build: false,
		position: 'left',
		color: '#ffffff',
		background: 'rgba(51, 51, 51, 0.5)',
		transition: '300'
	},
	statistics: {
		enable: false,
		showonbuild: false
	},
	server: {
		path: './',
		isassets: false,
		buildforlocal: false,
		copyfiles: true,
		version: true,
		hostname: 'localhost',
		port: '1111'
	},
	html: {
		beautify: {
			enable: true,
			indent: "tab"
		}
	},
	styles: {
		tailwindcss: false,
		pxtorem: true,
		critical: false,
		codesplit: true,
		devfiles: true,
	},
	fonts: {
		iconsfont: false,
		download: false
	},
	images: {
		svgsprite: false,
		optimize: {
			enable: true,
			edithtml: true,
			sizes: [600, 1200],
			dpi: [],
			attrignore: 'data-fls-image-ignore',
			modernformat: {
				enable: true,
				type: 'webp', // webp/avif
				only: true,
				quality: 80
			},
			jpeg: {
				quality: 80
			},
			png: {
				quality: 80
			}
		}
	},
	js: {
		hotmodules: true,
		devfiles: true,
		bundle: {
			// Собирает в один JS и один CSS файл
			// независимо от настройки
			// styles -> codesplit,
			enable: false,
		},
		react: false,
		vue: false
	},
	php: {
		enable: false,
		base: "./src/php/",
		hostname: 'localhost',
		port: '1110',
		binary: 'C:\\php\\php.exe',
		ini: 'template_modules/assets/php.ini',
	},
	pug: {
		enable: false,
	},
	ftp: {
		// Адрес FTP сервера
		// Можно использовать переменную окружения: process.env.FTP_HOST || '127.0.0.1'
		host: process.env.FTP_HOST || '141.8.192.119',
		// Порт FTP сервера (обычно 21)
		// Можно использовать переменную окружения: process.env.FTP_PORT || 21
		port: parseInt(process.env.FTP_PORT) || 21,
		// Удаленная директория на сервере (куда загружать файлы)
		// Можно использовать переменную окружения: process.env.FTP_REMOTE_DIR
		remoteDir: process.env.FTP_REMOTE_DIR || '/domains/smk-burlak.ru/public_html/test4',
		// Имя пользователя FTP
		// Можно использовать переменную окружения: process.env.FTP_USER || 'root'
		user: process.env.FTP_USER || 'a0284531',
		// Пароль FTP
		// Можно использовать переменную окружения: process.env.FTP_PASSWORD || '123456'
		password: process.env.FTP_PASSWORD || 'ZAQwsx1984',
		// Локальная директория для загрузки (по умолчанию 'dist')
		// localRoot: 'dist',
		// Массив файлов/паттернов для включения (опционально)
		include: ['*', '**/*'],
		// Удалять старые файлы на сервере перед загрузкой новых (по умолчанию true)
		deleteRemote: true,
		// Массив файлов/паттернов для исключения (опционально)
		// exclude: ['*.map', '.git/**'],
		// Время ожидания подключения в миллисекундах (опционально, по умолчанию 2000)
		waitingTime: 2000,
	},
	logger: {
		// Логи работы сборки в терминале
		terminal: true,
		// Логи работы модулей в консоли
		console: {
			enable: true,
			removeonbuild: true
		}
	},
	projectpage: {
		enable: false,
		projectname: '',
		template: "src/projectpage/projectpage.html",
		outfilename: '',
	},
	aliases: {
		// HTML/SCSS/JS components
		'@components': 'src/components',
		// Scripts
		'@js': 'src/js',
		// Styles
		'@styles': 'src/styles',
		// Media & files
		'@fonts': 'src/assets/fonts',
		'@img': 'src/assets/img',
		'@video': 'src/assets/video',
		'@files': 'src/files',
		// Other
		'@pug': 'src/pug'
	},
	coffee: {
		enable: true,
		text: `(!!)Хватит работать, сделай перерыв ☕️`,
		interval: 45
	},
	novaposhta: {
		enable: false,
		key: ''
	}
}
