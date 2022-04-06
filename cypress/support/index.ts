declare global {
  namespace Cypress {
    interface Chainable {
			pseudoEl(pseudoEl: string, key: string): Chainable<string>
			naturalWidth(): Chainable<number>
    }
  }
}

Cypress.Commands.add(
	'pseudoEl',
	{ prevSubject: 'element' },
	($els: JQuery<HTMLElement>, pseudoEl: string, key: string) => {
		const el = $els.get(0)
		const win = el.ownerDocument.defaultView
		const cssAfter = win.getComputedStyle(el, pseudoEl)
		return cy.wrap(cssAfter.getPropertyValue(key).replace(/(^")|("$)/g, ''))
	},
)

Cypress.Commands.add(
	'naturalWidth',
	{ prevSubject: 'element' },
	($els: JQuery<HTMLImageElement>) => {
		const el = $els.get(0)
		return cy.wrap(el.naturalWidth)
	},
)

export {}
