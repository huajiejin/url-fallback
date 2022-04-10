// fix: Uncaught TypeError: Failed to execute 'insertBefore' on 'Node': parameter 1 is not of type 'Node'.

describe('all-failed.html', () => {
  before(() => {
    cy.visit('/all-failed.html')
  })

  beforeEach(() => {
    cy.get('link[data-cy]').as('example_css')
    cy.get('script[data-cy]').as('example_js')
    cy.get('img[data-cy]').as('example_png')
  })

  it('should retry to load resources', () => {
    cy.get('@example_css').should('have.attr', 'data-original-url', 'http://your-cdn.com/assets/example.css')
    cy.get('@example_js').should('have.attr', 'data-original-url', 'http://your-cdn.com/assets/example.js')
    cy.get('@example_png').should('have.attr', 'data-original-url', 'http://your-cdn.com/assets/example.png')

    cy.get('@example_css').should('have.attr', 'href', 'http://your-static-server.com/assets/example.css')
    cy.get('@example_js').should('have.attr', 'src', 'http://your-static-server.com/assets/example.js')
    cy.get('@example_png').should('have.attr', 'src', 'http://your-static-server.com/assets/example.png')
  })

  it('should retry to load resources 2 times', () => {
    cy.get('@example_css').should('have.attr', 'data-next-index', '2')
    cy.get('@example_js').should('have.attr', 'data-next-index', '2')
    cy.get('@example_png').should('have.attr', 'data-next-index', '2')
  })

  it('should not load resources successfully', () => {
    cy.get('body').pseudoEl('after', 'content').should('not.eq', 'example.css loaded')
    cy.get('body').should('not.contain.text', 'example.js loaded')
    cy.get('@example_png').naturalWidth().should('not.be.greaterThan', 0)
  })
})
