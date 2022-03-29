import { addErrorListener } from './public-api'

const cssEl = document.createElement('link')
cssEl.href = '//error.com/err.css'
const scriptEl = document.createElement('script')
scriptEl.src = '//error.com/err.js'
const imgEl = document.createElement('img')
imgEl.src = '//error.com/err.jpg'
const basicRules = [{url: '//error.com', fallbacks: ['//error1.com/new-path']}]

beforeEach(() => {
	document.body.appendChild(cssEl)
	document.body.appendChild(scriptEl)
	document.body.appendChild(imgEl)
})

afterEach(() => {
	document.body.innerHTML = ''
})

test('basic css loading error', () => {
	addErrorListener({ rules: basicRules })
	cssEl.dispatchEvent(new Event('error'))
	expect(document.body.innerHTML).toContain('//error1.com/new-path/err.css')
})

test('basic script loading error', () => {
	addErrorListener({ rules: basicRules })
	scriptEl.dispatchEvent(new Event('error'))
	expect(document.body.innerHTML).toContain('//error1.com/new-path/err.js')
})

test('basic img loading error', () => {
	addErrorListener({ rules: basicRules })
	imgEl.dispatchEvent(new Event('error'))
	expect(document.body.innerHTML).toContain('//error1.com/new-path/err.jpg')
})
