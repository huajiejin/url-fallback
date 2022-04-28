/**
 * Start to capture error events of resources loaded by link, script and img elements, and replace error elements with fallback elements.
 * The error element will dispatch a pre-url-fallback event before and a post-url-fallback event after fallback element generated.
 * @param config - Set url fallback rules.
 * @returns The function to remove the error event listener.
 */
export function addErrorListener(config: ErrorListenerConfig = {}): RemoveErrorListener {
	const { urlFallbackHandler } = getUrlFallbackHandler(config)
	const urlFallbackListener = (e: ErrorEvent) => e.target && urlFallbackHandler(e.target)
	window.addEventListener('error', urlFallbackListener, true)
	return () => { window.removeEventListener('error', urlFallbackListener) }
}

/**
 * Get url fallback hander that replacing elements with fallback elements.
 * @param config - Set url fallback rules.
 * @returns urlFallbackHandler and fallbackDataRecord
 */
export function getUrlFallbackHandler(config: ErrorListenerConfig = {}) {
	const fallbackDataRecord: Record<string, FallbackData> = {}
	function urlFallbackHandler (errorEl: EventTarget) {
		if (!isFallbackElement(errorEl)) return
	
		let originalUrl = errorEl.getAttribute('data-original-url')
		if (!originalUrl) {
			originalUrl	= (errorEl as HTMLLinkElement).href || (errorEl as HTMLImageElement).src || ''
			errorEl.setAttribute('data-original-url', originalUrl)
			errorEl.setAttribute('data-next-index', '0')
		}
		let fallbackData = fallbackDataRecord[originalUrl]
		if (!fallbackData) {
			fallbackData = {
				originalUrl,
				matchFallbacks: Object.freeze(getMatchAndFallbacks(originalUrl, config)),
			}
			fallbackDataRecord[originalUrl] = fallbackData
		}
		errorEl.fallbackData = fallbackData
		
		const preUrlFallbackEvent = new Event('pre-url-fallback')
		const postUrlFallbackEvent = new Event('post-url-fallback')
	
		errorEl.dispatchEvent(preUrlFallbackEvent)
	
		const fallbackEl = cloneElement(errorEl)
		const index = parseInt(errorEl.getAttribute('data-next-index') || '', 10) || 0
		fallbackEl.setAttribute('data-next-index', `${index + 1}`)
		const { match, fallback } = errorEl.fallbackData.matchFallbacks[index] || {}
		const fallbackUrl = match ? originalUrl.replace(match, fallback) : null
		if (fallbackUrl) {
			if (fallbackEl.tagName === 'LINK') (fallbackEl as HTMLLinkElement).href = fallbackUrl
			else (fallbackEl as HTMLScriptElement).src = fallbackUrl
			errorEl.nextFallback = fallbackEl
			fallbackEl.prevFallback = errorEl
		}
	
		errorEl.dispatchEvent(postUrlFallbackEvent)
	
		if (fallbackUrl) {
			errorEl.parentNode?.insertBefore(fallbackEl, errorEl)
			errorEl.parentNode?.removeChild(errorEl)
		}
	}

	return {
		fallbackDataRecord,
		urlFallbackHandler,
	}
}

export interface ErrorListenerConfig {
	/** Set how to match and replace the url of error elements. */
	rules?: FallbackRule[],
}
export interface FallbackRule {
	/** The matcher to the url of error elements, every fallback will be a matcher for other fallbacks if the url is empty. */
	url?: string | RegExp
	/** Replacements of matched substring of the url of error elements. */
	fallbacks: string[]
}
export type RemoveErrorListener = () => void
/** Matched substring and its fallback. */
export interface MatchFallback { match: string, fallback: string }
export interface FallbackData {
	/** URL of the first error element */
	originalUrl: string
	/** List of matched substrings and their fallbacks. */
	matchFallbacks: Readonly<MatchFallback[]>
}
/** A fallback element is an ordinary HTMLElement instance with some custom properties that makes it a Doubly Linked List with extra data. */
export type FallbackElement = {
	fallbackData?: FallbackData
	prevFallback?: FallbackElement
	nextFallback?: FallbackElement
} & (HTMLLinkElement | HTMLScriptElement | HTMLImageElement)
function isFallbackElement(el: any): el is FallbackElement {
	return el.tagName === 'LINK' || el.tagName === 'SCRIPT' || el.tagName === 'IMG'
}

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
/**
 * Create a new element and copy attributes from the source element.
 * @param el - The source element.
 * @returns The new element.
 */
function cloneElement<T extends HTMLElement>(el: T): T {
	const newEl = document.createElement(el.tagName.toLowerCase()) as T
	for (let i = 0; i < el.attributes.length; i++) {
		const attribute = el.attributes[i]
		newEl.setAttribute(attribute.name, attribute.value)
	}
	return newEl
}
