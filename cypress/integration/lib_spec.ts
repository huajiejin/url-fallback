describe('lib.html', () => {
  before(() => {
    cy.visit('/lib.html')
  })

  it('should retry to load resources', () => {
    cy.get('link[data-cy]').should('have.attr', 'data-original-url', 'http://your-backup-cdn.com/change/path/assets/example.css')
    cy.get('script[data-cy]').should('have.attr', 'data-original-url', 'http://your-static-server.com/assets/example.js')
    cy.get('img[data-cy]').should('have.attr', 'data-original-url', 'http://your-img-cdn.com/assets/example.png')

    cy.get('link[data-cy]').should('have.attr', 'href', 'http://127.0.0.1:9999/assets/example.css')
    cy.get('script[data-cy]').should('have.attr', 'src', 'http://127.0.0.1:9999/assets/example.js')
    cy.get('img[data-cy]').should('have.attr', 'src', 'http://127.0.0.1:9999/assets/example.png')
  })

  it('should retry to load css and js resources 2 times', () => {
    cy.get('link[data-cy]').should('have.attr', 'data-next-index', '2')
    cy.get('script[data-cy]').should('have.attr', 'data-next-index', '2')
  })

  it('should retry to load img resource 4 times', () => {
    cy.get('img[data-cy]').should('have.attr', 'data-next-index', '4')
  })

  it('should load resources successfully', () => {
    cy.get('body').pseudoEl('after', 'content').should('eq', 'example.css loaded')
    cy.get('body').should('contain.text', 'example.js loaded')
    cy.get('img[data-cy]').naturalWidth().should('be.greaterThan', 0)
  })
})
