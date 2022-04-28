describe('lib-svg.html', () => {
  before(() => {
    cy.visit('/lib-svg.html')
  })

  beforeEach(() => {
    cy.get('use[data-cy-href]').as('example_svg')
    cy.get('use[data-cy-xlink-href]').as('example_svg_xlink')
  })

  it('should not retry to load svg resources', () => {
    cy.get('@example_svg').should('not.have.attr', 'data-original-url')
    cy.get('@example_svg_xlink').should('not.have.attr', 'data-original-url')

    cy.get('@example_svg').should('have.attr', 'href', '/assets/example1.svg#example1')
    cy.get('@example_svg_xlink').should('have.attr', 'xlink:href', '/assets/example2.svg#example2')
  })
})
