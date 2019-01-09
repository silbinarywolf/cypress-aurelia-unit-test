import { PLATFORM } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'cypress-aurelia-unit-test';

import { BoxComponent } from '~/box-component/box-component';
import * as styles from '~/box-component/box-component.scss';

describe('BoxComponent', () => {
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
    cy.get(`.${styles.main}`).contains('Hello World');
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
    cy.get(`.${styles.main}`).contains('Second test');
  });

  it('Test border color of element', () => {
    const component = StageComponent
      .withResources<BoxComponent>(PLATFORM.moduleName('box-component/box-component'))
      .inView(`
        <box-component
          value.bind="value"
        ></box-component>`)
      .boundTo({
        value: 'Border color test'
      });
    component.create(bootstrap);
    cy.get(`.${styles.main}`).should('have.css', 'border-color', 'rgb(255, 0, 0)');
  });
});
