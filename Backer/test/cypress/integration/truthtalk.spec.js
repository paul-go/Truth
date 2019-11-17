/// <reference types="Cypress" />

context("TruthTalk", () => 
{
  beforeEach(() => 
  {
		cy.visit("/");  
		
		cy.window().its("Backer").as("Backer");
		
    cy.readFile("truth/screws.truth")
      .then(file => cy.get("@Backer").its("Util").invoke("loadFile", file, /^\d{3}-.+/)).as("document");
			
		cy.get("@Backer").its("Schema").as("Schema");
		cy.get("@Backer").its("Graph").as("Graph");
		
  });

  it("Backer Types are loaded", () => 
	{
		cy.get("@Schema").its("any").should("exist");
		cy.get("@Schema").its("object").should("exist");
		cy.get("@Schema").its("string").should("exist");
		cy.get("@Schema").its("number").should("exist");
		cy.get("@Schema").its("bigint").should("exist");
		cy.get("@Schema").its("boolean").should("exist");
	});
	
	it("Some example queries", () => {
		cy.get("@Backer").its("TruthTalk").as("tt");
		cy.get("@tt").its("tt")
		.then(tt => tt(
			tt.named("421-095"), tt.contents(), tt.equals(16)
		))
		.then(ast => cy.get("@tt").invoke("Execute", ast))
		.then(data => JSON.stringify(data))
		.should("equal", JSON.stringify(["16[mm]"]));
	});
  
});