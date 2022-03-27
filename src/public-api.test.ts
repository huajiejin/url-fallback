import { addErrorListener } from './public-api'

const cssEl = document.createElement('link')
const scriptEl = document.createElement('script')
const rules = [{url: '//error.com', fallbacks: ['//error1.com/new-path']}]

beforeEach(() => {
	cssEl.href = '//error.com/err.css'
	document.head.appendChild(cssEl)

	scriptEl.src = '//error.com/err.js'
	document.body.appendChild(scriptEl)
})

afterEach(() => {
	document.head.innerHTML = ''
	document.body.innerHTML = ''
})

test('basic script loading error', () => {
	addErrorListener({ rules })
	scriptEl.dispatchEvent(new Event('error'))
	const fallbackEl = scriptEl.previousSibling as HTMLScriptElement
	expect(fallbackEl?.src).toBe('https://error1.com/new-path/err.js')
})

test('basic css loading error', () => {
	addErrorListener({ rules })
	cssEl.dispatchEvent(new Event('error'))
	const fallbackEl = cssEl.previousSibling as HTMLLinkElement
	expect(fallbackEl?.href).toBe('https://error1.com/new-path/err.css')
})
