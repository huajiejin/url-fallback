describe('index.html', () => {
  before(() => {
    cy.visit('/index.html')
  })

  it('should retry resources', () => {
    cy.get('script[data-cy]').should('have.attr', 'src', 'http://127.0.0.1:9999/assets/example.js')
    cy.get('link[data-cy]').should('have.attr', 'href', 'http://127.0.0.1:9999/assets/example.css')
    cy.get('img[data-cy]').should('have.attr', 'src', 'http://127.0.0.1:9999/assets/example.png')
  })

  it('should load resources successfully', () => {
    cy.get('body').should('contain.text', 'example.js loaded')
    cy.get('body').pseudoEl('after', 'content').should('eq', 'example.css loaded')
    cy.get('img[data-cy]').naturalWidth().should('be.greaterThan', 0)
  })
})
