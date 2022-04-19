/**
 * Start to capture error events of resources (link, script and img elements by default), and replace error elements with fallback elements.
 * The error element will dispatch a pre-url-fallback event before and a post-url-fallback event after fallback element generated.
 * @param config - Set url fallback rules.
 * @returns The function to remove the error event listener.
 */
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
	/** Set how to match and replace the url of error elements. */
	rules?: FallbackRule[],
	/** Set fallback element generator functions for specific elements. */
	generators?: FallbackElementGeneratorRecord,
	/** Control how to insert every fallback element. */
	insert?: (errorElement: FallbackElement, fallbackElement: FallbackElement) => void,
}
export interface FallbackRule {
	/** The matcher to the url of error elements, every fallback will be a matcher for other fallbacks if the url is empty. */
	url?: string | RegExp
	/** Replacements of matched substring of the url of error elements. */
	fallbacks: string[]
}
export type FallbackElementGenerator<T = FallbackElement> = (errorElement: T) => T | null
export type FallbackElementGeneratorRecord = Record<string, FallbackElementGenerator>
export type RemoveErrorListener = () => void
/** Matched substring and its fallback. */
export interface MatchFallback { match: string, fallback: string }
export interface FallbackData {
	/** The config passed to addErrorListener. */
	config: Readonly<ErrorListenerConfig>
	/** URL of the first error element */
	originalUrl: string
	/** List of matched substrings and their fallbacks. */
	matchFallbacks: Readonly<MatchFallback[]>
}
/** A fallback element is an ordinary HTMLElement instance with some custom properties that makes it a Doubly Linked List with extra data. */
export type FallbackElement<T = EventTargetElement> = {
	fallbackData: FallbackData
	prevFallback: FallbackElement<T> | null
	nextFallback: FallbackElement<T> | null
	src?: string
	href?: string
} & T
type EventTargetElement = EventTarget & HTMLElement

/**
 * Get a list of matched substrings and their fallbacks based on one specific url and rules.
 * @param originalUrl - The url of error resource.
 * @param config - The config passed to addErrorListener.
 * @returns The list of matched substrings and their fallbacks.
 */
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
			// every fallback could be a matcher of other fallbacks if rule.url is empty.
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
/**
 * A simple version of Object.assign in favor of improving browser compatibility.
 * https://caniuse.com/mdn-javascript_builtins_object_assign
 * @param target - The target object.
 * @param source - The source object.
 * @returns The merged target object.
 */
export function assign<T, U>(target: T, source?: U): T & U {
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			// @ts-ignore
			target[key] = source[key]
		}
	}
	return target as T & U
}
/**
 * Get the href or src property of an element.
 * @param el - The element.
 * @returns The url.
 */
export function getElementUrl(el: FallbackElement) {
	return el.href || el.src || ''
}
/**
 * Create a new element and copy attributes from the source element.
 * @param el - The source element.
 * @returns The new element.
 */
export function cloneElement<T extends HTMLElement>(el: T): T {
	const newEl = document.createElement(el.tagName.toLowerCase()) as T
	for (let i = 0; i < el.attributes.length; i++) {
		const attribute = el.attributes[i]
		newEl.setAttribute(attribute.name, attribute.value)
	}
	return newEl
}
/**
 * Create a fallback element with href property.
 * @param errorEl - The error element.
 * @returns The fallback element.
 */
export function hrefElementGenerator (errorEl: FallbackElement): FallbackElement | null {
	const fallbackEl = cloneElement(errorEl)
	const fallbackUrl = getFallbackUrl(errorEl, fallbackEl)
	fallbackEl.href = fallbackUrl || ''
	return fallbackUrl ? fallbackEl : null
}
/**
 * Create a fallback element with src property.
 * @param errorEl - The error element.
 * @returns The fallback element.
 */
export function srcElementGenerator (errorEl: FallbackElement): FallbackElement | null {
	const fallbackEl = cloneElement(errorEl)
	const fallbackUrl = getFallbackUrl(errorEl, fallbackEl)
	fallbackEl.src = fallbackUrl || ''
	return fallbackUrl ? fallbackEl : null
}
