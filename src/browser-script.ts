import { addErrorListener } from './core'

const el = document.querySelector('script[data-url-fallback]')
if (el instanceof HTMLScriptElement) {
	const url = el.getAttribute('data-url')
	const fallbacks = el.getAttribute('data-fallbacks')?.split(',')
	if (url && fallbacks) addErrorListener({ rules: [ { url, fallbacks } ] })
}
