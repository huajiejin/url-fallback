export function addErrorListener(config: ErrorListenerConfig): RemoveErrorListener {
	function errorListener() {}
	
	window.addEventListener('error', errorListener, true)

	return () => { window.removeEventListener('error', errorListener) }
}

interface ErrorListenerConfig {
	rules: FallbackRule[],
	generators: FallbackElementGenerator[],
}
interface FallbackRule {
	host: string
	fallback: string[]
}
type FallbackElementGenerator = (target: EventTarget, rules: FallbackRule[]) => HTMLElement
type RemoveErrorListener = () => void
