describe('lib.html', () => {
  const originalUrls = {
    example_css: 'http://your-backup-cdn.com/change/path/assets/example.css',
    example_js: 'http://your-static-server.com/assets/example.js',
    example_png: 'http://your-img-cdn.com/assets/example.png',
  }
  const originalUrlAliases = {
    [originalUrls.example_css]: 'example_css',
    [originalUrls.example_js]: 'example_js',
    [originalUrls.example_png]: 'example_png',
  }
  const errorCount = {
    example_css: 0,
    example_js: 0,
    example_png: 0,
  }

  before(() => {
    cy.visit('/lib.html', {
      onBeforeLoad(win) {
        win.addEventListener('error', e => {
          const originalUrl = (e.target as HTMLElement)?.getAttribute('data-original-url') || (e.target as HTMLScriptElement)?.src || (e.target as HTMLLinkElement)?.href
          const alias = originalUrlAliases[originalUrl]
          if (alias) errorCount[alias] += 1
        }, true)
      },
    })
  })

  beforeEach(() => {
    cy.get('link[data-cy]').as('example_css')
    cy.get('script[data-cy]').as('example_js')
    cy.get('img[data-cy]').as('example_png')
  })

  it('should retry to load resources', () => {
    cy.get('@example_css').should('have.attr', 'data-original-url', originalUrls.example_css)
    cy.get('@example_js').should('have.attr', 'data-original-url', originalUrls.example_js)
    cy.get('@example_png').should('have.attr', 'data-original-url', originalUrls.example_png)

    cy.get('@example_css').should('have.attr', 'href', 'http://127.0.0.1:9999/assets/example.css')
    cy.get('@example_js').should('have.attr', 'src', 'http://127.0.0.1:9999/assets/example.js')
    cy.get('@example_png').should('have.attr', 'src', 'http://127.0.0.1:9999/assets/example.png')
  })

  it('should retry to load css resource 2 times', () => {
    cy.get('@example_css').should('have.attr', 'data-next-index', '2')
  })

  it('should retry to load js resource 2 times', () => {
    cy.get('@example_js').should('have.attr', 'data-next-index', '2')
  })

  it('should retry to load img resource 4 times', () => {
    cy.get('@example_png').should('have.attr', 'data-next-index', '4')
  })

  it('should trigger error events of css resource 2 times', () => {
    cy.wrap(errorCount.example_css).should('eq', 2)
  })

  it('should trigger error events of js resource 2 times', () => {
    cy.wrap(errorCount.example_js).should('eq', 2)
  })

  it('should trigger error events of img resource 4 times', () => {
    cy.wrap(errorCount.example_png).should('eq', 4)
  })

  it('should load resources successfully', () => {
    cy.get('body').pseudoEl('after', 'content').should('eq', 'example.css loaded')
    cy.get('body').should('contain.text', 'example.js loaded')
    cy.get('@example_png').naturalWidth().should('be.greaterThan', 0)
  })
})
