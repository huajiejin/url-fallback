describe('url fallback', () => {
  it('basic test', () => {
    cy.visit('index.html')
    cy.get('script[data-basic-test]')
    cy.get('link[data-basic-test]')
    cy.get('img[data-basic-test]')
  })
})
