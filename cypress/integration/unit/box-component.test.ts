import { PLATFORM } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'cypress-aurelia-unit-test';

import { BoxComponent } from '~/box-component/box-component';

describe('BoxComponent', () => {
  const textElementSelector = '.box-component__content';

  it('Test that we can render a component', () => {
    const component = StageComponent
      .withResources<BoxComponent>(PLATFORM.moduleName('box-component/box-component'))
      .inView(`
        <box-component
          value.bind="value"
        ></box-component>`)
      .boundTo({
        value: 'Hello World',
      });
    component.create(bootstrap);
    cy.get(textElementSelector).contains('Hello World');
  });

  it('Test that 2nd test in the same file will work and not be buggy, use different value to be safe', () => {
    const component = StageComponent
      .withResources<BoxComponent>(PLATFORM.moduleName('box-component/box-component'))
      .inView(`
        <box-component
          value.bind="value"
        ></box-component>`)
      .boundTo({
        value: 'Second test'
      });
    component.create(bootstrap);
    cy.get(textElementSelector).contains('Second test');
  });
});
