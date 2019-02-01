import { PLATFORM } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'cypress-aurelia-unit-test';

import { ContainerlessDiv } from '~/containerless-div/containerless-div';

describe('ContainerlessDiv', () => {
  it('Test that we properly render a containerless component and calls attached() once', () => {
    const component = StageComponent
      .withResources<ContainerlessDiv>(PLATFORM.moduleName('containerless-div/containerless-div'))
      .inView(`<containerless-div></containerless-div>`);
    component.create(bootstrap);
    cy.get('containerless-div').should('not.exist');
    const AttachedMethodCalledCount = '1';
    cy.get(`div`).contains(AttachedMethodCalledCount);
  });
});
