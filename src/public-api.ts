export function addErrorListener(config: ErrorListenerConfig): RemoveErrorListener {
	if (!document || !window) throw new Error('The function must be running in an environment that has document and window.')

	const generators = mergeGenerators(config.generators)

	const errorListener: EventListenerOrEventListenerObject = (e) => {
		const errorEl = e.target as FallbackElement
		const preUrlFallbackEvent = new Event('pre-url-fallback')
		const postUrlFallbackEvent = new Event('post-url-fallback')

		errorEl.dispatchEvent(preUrlFallbackEvent)

		const generator = generators.get(errorEl?.constructor as FallbackElementConstructor)
		const fallbackEl = generator?.(errorEl, config.rules || [])
		if (fallbackEl) {
			errorEl.nextFallback = fallbackEl
			fallbackEl.prevFallback = errorEl
			if (config.insert) {
				config.insert(errorEl, fallbackEl)
			} else {
				errorEl.parentNode.insertBefore(fallbackEl, errorEl)
			}
		}

		errorEl.dispatchEvent(postUrlFallbackEvent)
	}

	window.addEventListener('error', errorListener, true)

	return () => { window.removeEventListener('error', errorListener) }
}

export interface ErrorListenerConfig {
	/** set fallback url replacement rule */
	rules?: FallbackRule[],
	/** set fallback element generator function */
	generators?: FallbackElementGeneratorMap,
	/** control where to insert fallback element */
	insert?: (errorElement: FallbackElement, fallbackElement: FallbackElement) => void,
}
interface FallbackRule {
	url: string
	fallbacks: string[]
}
type FallbackElementGenerator<T = FallbackElement> = (errorElement: T, rules: FallbackRule[]) => T
type FallbackElementGeneratorMap = Map<FallbackElementConstructor, FallbackElementGenerator>
type RemoveErrorListener = () => void
export interface FallbackElement extends HTMLElement {
	prevFallback?: FallbackElement
	nextFallback?: FallbackElement
}
type FallbackElementConstructor = {
	new (): FallbackElement;
	prototype: FallbackElement;
}

function mergeGenerators(source?: FallbackElementGeneratorMap) {
	const generators: FallbackElementGeneratorMap = new Map()
	generators.set(HTMLLinkElement, (errorEl: HTMLLinkElement, rules) => {
		const fallbackEl = cloneElement(errorEl)
		const fallbackUrl = genFallbackUrl(errorEl, fallbackEl, rules, errorEl.href)
		fallbackEl.href = fallbackUrl
		return fallbackUrl ? fallbackEl : null
	})
	generators.set(HTMLScriptElement, (errorEl: HTMLScriptElement, rules) => {
		const fallbackEl = cloneElement(errorEl)
		const fallbackUrl = genFallbackUrl(errorEl, fallbackEl, rules, errorEl.src)
		fallbackEl.src = fallbackUrl
		return fallbackUrl ? fallbackEl : null
	})

	source?.forEach((v, k) => { generators.set(k, v) })

	return generators
}

function genFallbackUrl(errorEl: HTMLElement, fallbackEl: HTMLElement, rules: FallbackRule[], errorUrl = getElementUrl(errorEl)) {
	try {
		const originalUrl = errorEl.dataset.originalUrl || errorUrl
		fallbackEl.dataset.originalUrl = originalUrl

		const fullbackUrlIndex = parseInt(errorEl.dataset.nextFullbackUrlIndex) || 0
		fallbackEl.dataset.nextFullbackUrlIndex = `${fullbackUrlIndex + 1}`

		const fullbackRule = rules.find(rule => originalUrl.includes(rule.url))
		const urlReplacement = fullbackRule?.fallbacks[fullbackUrlIndex]
		const fallbackUrl = urlReplacement ? originalUrl.replace(fullbackRule?.url, urlReplacement) : null

		return fallbackUrl
	} catch (error) {
		console.error(error)
		return null
	}
}

export function cloneElement<T extends HTMLElement>(el: T): T {
	const newEl = document.createElement(el.tagName.toLowerCase()) as T
	for (let i = 0; i < el.attributes.length; i++) {
		const attribute = el.attributes[i]
		newEl.setAttribute(attribute.name, attribute.value)
	}
	return newEl
}

export function getElementUrl(el: HTMLElement) {
	return (el as HTMLLinkElement).href || (el as HTMLScriptElement).src || ''
}
