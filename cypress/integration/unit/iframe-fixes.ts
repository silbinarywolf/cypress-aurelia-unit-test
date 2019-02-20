import { PLATFORM } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { ComponentTester, StageComponent } from 'cypress-aurelia-unit-test';

import { configurationWithoutStart } from '~/main';
import { DocumentManipulator } from '~/document-manipulator/document-manipulator';

describe('IframeFixes', () => {
  let component: ComponentTester<DocumentManipulator>;

  beforeEach(() => {
    component = StageComponent
      .withResources(PLATFORM.moduleName('document-manipulator/document-manipulator'))
      .inView(`
        <document-manipulator></document-manipulator>`)
      .bootstrap(configurationWithoutStart);
  });

  it('Check document.body.appendChild override is active', () => {
    component.create(bootstrap);
    cy.get('.bodyAppendChild').should('exist');
  });

  it('Check document.querySelector override is active', () => {
    component.create(bootstrap);
    cy.get('.documentQuerySelectorSuccess').should('exist');
  });

  it('Check document.body.querySelector override is active', () => {
    component.create(bootstrap);
    cy.get('.documentBodyQuerySelectorSuccess').should('exist');
  });

  it('Check document.querySelectorAll override is active', () => {
    component.create(bootstrap);
    cy.get('.documentQueryAllSelectorSuccess').should('exist');
  });

  it('Check document.body.querySelectorAll override is active', () => {
    component.create(bootstrap);
    cy.get('.documentBodyQueryAllSelectorSuccess').should('exist');
  });
});
