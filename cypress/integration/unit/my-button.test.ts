import { PLATFORM } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'cypress-aurelia-unit-test';

import { MyButton } from '~/my-button/my-button';

describe('Button', () => {
  it('Test click.delegate() has event listeners have been applied to app iframe from the spec iframe by "event-listener-fixes" in lib.', () => {
    const component = StageComponent
      .withResources<MyButton>(PLATFORM.moduleName('my-button/my-button'))
      .inView(`
        <my-button
          value.bind="value"
        ></my-button>`)
      .boundTo({
        value: 'Delegate click test'
      });
    component.create(bootstrap);
    cy.get('button').click();
    cy.get('p').contains('Button clicked!');
  });
});
