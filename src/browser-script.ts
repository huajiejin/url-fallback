import { addErrorListener } from './core'

const el = document.querySelector('script[data-url-fallback]')
if (el instanceof HTMLScriptElement) {
	const url = el.getAttribute('data-url') || ''
	const fallbacks = el.getAttribute('data-fallbacks')?.split(',') || []
	if (fallbacks.length > 0) addErrorListener({ rules: [ { url, fallbacks } ] })
}
