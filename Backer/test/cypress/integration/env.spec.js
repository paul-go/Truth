/// <reference types="Cypress" />

context("Env", () => 
{
  beforeEach(() => 
  {
    cy.visit("/");
  });

  it("Libraries defined in global", () => 
  {
    cy.window().its("Truth");
    cy.window().its("Reflex");
    cy.window().its("Backer");
  });
  
  it.only("Truth Compiler is sane enough to compile Backer Headers", () => 
  {
    cy.readFile("truth/backer.truth")
      .then(file => cy.window().its("Truth").invoke("parse", file)).as("document");
      
    cy.get("@document").then(doc => 
      {
        doc.program.verify();
        return doc.program.faults.count;
      }).should("be.lessThan", 1);
  });
  
});