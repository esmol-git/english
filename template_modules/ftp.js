// Настройка шаблона
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'
import path from 'path'
import { fileURLToPath } from 'url'
import ftpDeploy from 'ftp-deploy'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isFtp = process.argv.includes('--ftp')

// Кастомный плагин FTP с поддержкой deleteRemote
const customFtpPlugin = () => {
	let outDir = 'dist'
	return {
		name: 'custom-ftp-plugin',
		apply: 'build',
		enforce: 'post',
		configResolved(config) {
			outDir = config.build.outDir
		},
		async closeBundle() {
			const ora = await import('ora').then(res => res.default)
			const chalk = await import('chalk').then(res => res.default)
			const spinner = ora()
			const ftp = new ftpDeploy()
			
			try {
				const ftpConfig = templateConfig.ftp
				const localRoot = path.resolve(outDir)
				
				ftp.on('uploading', function (data) {
					const { totalFilesCount, transferredFileCount, filename } = data
					spinner.start(
						`uploading ${transferredFileCount}/${totalFilesCount} ${filename}`
					)
				})
				
				console.log(chalk.cyan(`✨ begin upload ${ftpConfig.remoteDir}`))
				
				// Задержка для подключения
				await new Promise(resolve =>
					setTimeout(() => {
						resolve(true)
					}, ftpConfig.waitingTime || 2000)
				)
				
				await ftp
					.deploy({
						host: ftpConfig.host,
						port: ftpConfig.port,
						user: ftpConfig.user,
						password: ftpConfig.password,
						localRoot: localRoot,
						remoteRoot: ftpConfig.remoteDir,
						include: ftpConfig.include || ['*', '**/*'],
						// Удаляем старые файлы перед загрузкой новых
						deleteRemote: ftpConfig.deleteRemote !== false, // по умолчанию true
						// Исключаем файлы, если указано
						exclude: ftpConfig.exclude || []
					})
					.then(() => spinner.succeed(`upload complete`))
					.catch((err) => {
						console.log(err)
						spinner.info('upload fail')
						process.exit(1)
					})
			} catch (error) {
				spinner.fail(
					`${chalk.yellow('Client connect fail, Please check config carefully')}`
				)
				process.exit(1)
			}
		}
	}
}

export const ftpPlugin = [
	...((isFtp) ? [customFtpPlugin()] : [])
]
