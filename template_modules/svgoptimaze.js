// Настройки шаблона
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import path from 'node:path'
import { outlineSvg } from '@davestewart/outliner'
import { optimize } from 'svgo'
import { readFile, writeFile } from 'fs/promises';
import SVGFixer from 'oslllo-svg-fixer'

// Оптимизация SVG-иконок
export async function svgOptimaze(iconsFiles) {
	const srcDir = 'src/assets/svgicons';
	const distDir = 'src/assets/svgicons/fixed';

	logger('_ICONS_OPT_START')
	try {
		await SVGFixer(srcDir, distDir, { throwIfDestinationDoesNotExist: false }).fix().then(() => {
			logger('_ICONS_OPT_END')
		})
	} catch (err) {
		console.log(err)
		throw err;
	}
}
