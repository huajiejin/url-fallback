export function addErrorListener(config: ErrorListenerConfig = {}): RemoveErrorListener {
	if (!document || !window) throw new Error('The function must be running in an environment that has document and window.')

	const generators: FallbackElementGeneratorRecord = assign(
		{
			LINK: hrefElementGenerator,
			SCRIPT: srcElementGenerator,
			IMG: srcElementGenerator,
		},
		config.generators,
	)
	const fallbackDataRecord: Record<string, FallbackData> = {}
	function errorListener (e: ErrorEvent) {
		const errorEl = e.target as FallbackElement
		if (!isEventTargetElement(errorEl)) return

		let originalUrl = errorEl.getAttribute('data-original-url')
		if (!originalUrl) {
			originalUrl	= getElementUrl(errorEl)
			errorEl.setAttribute('data-original-url', originalUrl)
			errorEl.setAttribute('data-next-index', '0')
		}
		let fallbackData = fallbackDataRecord[originalUrl]
		if (!fallbackData) {
			fallbackData = {
				config: Object.freeze(config),
				originalUrl,
				matchFallbacks: Object.freeze(getMatchAndFallbacks(originalUrl, config)),
			}
			fallbackDataRecord[originalUrl] = fallbackData
		}
		assign(errorEl, { fallbackData })
		
		const preUrlFallbackEvent = new Event('pre-url-fallback')
		const postUrlFallbackEvent = new Event('post-url-fallback')

		errorEl.dispatchEvent(preUrlFallbackEvent)

		const fallbackEl = generators[errorEl.tagName]?.(errorEl)
		if (fallbackEl) {
			errorEl.nextFallback = fallbackEl
			fallbackEl.prevFallback = errorEl
		}

		errorEl.dispatchEvent(postUrlFallbackEvent)

		if (config.insert && fallbackEl) {
			config.insert(errorEl, fallbackEl)
		} else if (fallbackEl) {
			errorEl.parentNode?.insertBefore(fallbackEl, errorEl)
			errorEl.parentNode?.removeChild(errorEl)
		}
	}

	window.addEventListener('error', errorListener, true)

	return () => { window.removeEventListener('error', errorListener) }
}

export interface ErrorListenerConfig {
	/** set fallback url replacement rule */
	rules?: FallbackRule[],
	/** set fallback element generator function */
	generators?: FallbackElementGeneratorRecord,
	/** control where to insert fallback element */
	insert?: (errorElement: FallbackElement, fallbackElement: FallbackElement) => void,
}
export interface FallbackRule {
	url?: string | RegExp
	fallbacks: string[]
}
export type FallbackElementGenerator<T = FallbackElement> = (errorElement: T) => T | null
export type FallbackElementGeneratorRecord = Record<string, FallbackElementGenerator>
export type RemoveErrorListener = () => void
export interface MatchFallback { match: string, fallback: string }
export interface FallbackData {
	config: Readonly<ErrorListenerConfig>
	originalUrl: string
	matchFallbacks: Readonly<MatchFallback[]>
}
export type FallbackElement<T = EventTargetElement> = {
	fallbackData: FallbackData
	prevFallback: FallbackElement<T> | null
	nextFallback: FallbackElement<T> | null
	src?: string
	href?: string
} & T
type EventTargetElement = EventTarget & HTMLElement

export function getMatchAndFallbacks(originalUrl: string, config: ErrorListenerConfig): MatchFallback[] {
	const matchFallbacks: MatchFallback[] = []
	const rules = config.rules || []

	function matchAndPush(fallbacks: string[], url: FallbackRule['url'] = '', avoidDuplication = false) {
		const regExpMatchArray = originalUrl.match(url || '') || []
		const match = regExpMatchArray[0]
		if (match) {
			for (let i = 0; i < fallbacks.length; i++) {
				const fallback = fallbacks[i]
				if (avoidDuplication && match === fallback) continue
				matchFallbacks.push({ match, fallback })
			}
		}
	}

	for (let i = 0; i < rules.length; i++) {
		const rule = rules[i]
		if (!rule.url) {
			// every fallback could be a match of other fallbacks if rule.url is empty.
			for (let j = 0; j < rule.fallbacks.length; j++) {
				matchAndPush(rule.fallbacks, rule.fallbacks[j], true)
			}
		}
		else {
			matchAndPush(rule.fallbacks, rule.url)
		}
	}
	return matchFallbacks
}
function getFallbackUrl(errorEl: FallbackElement, fallbackEl: FallbackElement) {
	const originalUrl = errorEl.fallbackData.originalUrl
	const index = parseInt(errorEl.getAttribute('data-next-index') || '', 10) || 0
	fallbackEl.setAttribute('data-next-index', `${index + 1}`)
	const matchFallbacks =  errorEl.fallbackData.matchFallbacks
	const { match, fallback } = matchFallbacks[index] || {}
	const fallbackUrl = match ? originalUrl.replace(match, fallback) : null
	return fallbackUrl
}
function isEventTargetElement(el: any): el is EventTargetElement {
	return el?.dispatchEvent !== undefined && el?.tagName !== undefined && (el?.href !== undefined || el?.src !== undefined)
}
export function assign<T, U>(target: T, source?: U): T & U {
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			// @ts-ignore
			target[key] = source[key]
		}
	}
	return target as T & U
}
export function getElementUrl(el: FallbackElement) {
	return el.href || el.src || ''
}
export function cloneElement<T extends HTMLElement>(el: T): T {
	const newEl = document.createElement(el.tagName.toLowerCase()) as T
	for (let i = 0; i < el.attributes.length; i++) {
		const attribute = el.attributes[i]
		newEl.setAttribute(attribute.name, attribute.value)
	}
	return newEl
}
export function hrefElementGenerator (errorEl: FallbackElement): FallbackElement | null {
	const fallbackEl = cloneElement(errorEl)
	const fallbackUrl = getFallbackUrl(errorEl, fallbackEl)
	fallbackEl.href = fallbackUrl || ''
	return fallbackUrl ? fallbackEl : null
}
export function srcElementGenerator (errorEl: FallbackElement): FallbackElement | null {
	const fallbackEl = cloneElement(errorEl)
	const fallbackUrl = getFallbackUrl(errorEl, fallbackEl)
	fallbackEl.src = fallbackUrl || ''
	return fallbackUrl ? fallbackEl : null
}
