import { addErrorListener } from './public-api'

let removeErrorListener = null;

const el = document.querySelector('script[data-url-fallback]')
if (el instanceof HTMLScriptElement) {
	// TODO get config from dataset
	removeErrorListener = addErrorListener({})
}

export { addErrorListener, removeErrorListener }
