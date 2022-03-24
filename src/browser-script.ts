import { addErrorListener } from './public-api'

let removeErrorListener = null

const el = document.querySelector('script[data-url-fallback]')
if (el instanceof HTMLScriptElement) {
	const url = el.dataset.url
	const fallbacks = el.dataset.fallbacks?.split(',')
	removeErrorListener = addErrorListener({ rules: [ { url, fallbacks } ] })
}

export { addErrorListener, removeErrorListener }
