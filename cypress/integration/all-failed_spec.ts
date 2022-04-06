// fix: Uncaught TypeError: Failed to execute 'insertBefore' on 'Node': parameter 1 is not of type 'Node'.

describe('all-failed.html', () => {
  before(() => {
    cy.visit('/all-failed.html')
  })

  it('should retry to load resources', () => {
    cy.get('link[data-cy]').should('have.attr', 'data-original-url', 'http://your-cdn.com/assets/example.css')
    cy.get('script[data-cy]').should('have.attr', 'data-original-url', 'http://your-cdn.com/assets/example.js')
    cy.get('img[data-cy]').should('have.attr', 'data-original-url', 'http://your-cdn.com/assets/example.png')

    cy.get('link[data-cy]').should('have.attr', 'href', 'http://your-static-server.com/assets/example.css')
    cy.get('script[data-cy]').should('have.attr', 'src', 'http://your-static-server.com/assets/example.js')
    cy.get('img[data-cy]').should('have.attr', 'src', 'http://your-static-server.com/assets/example.png')
  })

  it('should retry to load resources 2 times', () => {
    cy.get('link[data-cy]').should('have.attr', 'data-next-index', '2')
    cy.get('script[data-cy]').should('have.attr', 'data-next-index', '2')
    cy.get('img[data-cy]').should('have.attr', 'data-next-index', '2')
  })

  it('should not load resources successfully', () => {
    cy.get('body').pseudoEl('after', 'content').should('not.eq', 'example.css loaded')
    cy.get('body').should('not.contain.text', 'example.js loaded')
    cy.get('img[data-cy]').naturalWidth().should('not.be.greaterThan', 0)
  })
})
