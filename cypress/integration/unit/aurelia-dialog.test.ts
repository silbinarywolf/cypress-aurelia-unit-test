import 'reflect-metadata';
import 'aurelia-dialog';

import { PLATFORM } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent, _ } from 'cypress-aurelia-unit-test';

import { BoxComponent } from '~/box-component/box-component';

describe('AureliaDialog', () => {
  it('Test that the library auto-removes aurelia-dialog from your config', () => {
    const component = StageComponent
      .withResources<BoxComponent>(PLATFORM.moduleName('box-component/box-component'))
      .inView(`
        <box-component
          value.bind="value"
        ></box-component>`)
      .boundTo({
        value: 'Aurelia Dialog',
      })
      .bootstrap((aurelia) => {
        aurelia.use
          .developmentLogging()
          .standardConfiguration()
          .plugin(PLATFORM.moduleName('aurelia-dialog'));
      })
    component.create(bootstrap);
    // NOTE(Jake): 2019-01-09
    // I had to wrap this expect() in cy command or else I had timing problems.
    // Not sure what the most idiomatic way to test this behaviour is.
    cy.window().then((win) => {
      expect(_.Patches().aureliaDialogDisabled).to.be.true
    })
  });

  it('Test that that aurelia dialog isn\'t disabled if it isnt used.', () => {
    const component = StageComponent
      .withResources<BoxComponent>(PLATFORM.moduleName('box-component/box-component'))
      .inView(`
        <box-component
          value.bind="value"
        ></box-component>`)
      .boundTo({
        value: 'Aurelia Dialog',
      })
      .bootstrap((aurelia) => {
        aurelia.use
          .developmentLogging()
          .standardConfiguration()
      })
    component.create(bootstrap);
    // NOTE(Jake): 2019-01-09
    // I had to wrap this expect() in cy command or else I had timing problems.
    // Not sure what the most idiomatic way to test this behaviour is.
    cy.window().then((win) => {
      expect(_.Patches().aureliaDialogDisabled).to.be.false
    })
  });
});
