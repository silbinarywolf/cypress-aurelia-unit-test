import { PLATFORM } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { ComponentTester, StageComponent } from 'cypress-aurelia-unit-test';

import { configurationWithoutStart } from '~/main';
import { BoxComponent } from '~/box-component/box-component';

describe('CustomBootstrap', () => {
  let component: ComponentTester<BoxComponent>;
  const textElementSelector = '.box-component__content';

  beforeEach(() => {
    component = StageComponent
      .withResources(PLATFORM.moduleName('box-component/box-component'))
      .inView(`
        <box-component
          value.bind="value"
        ></box-component>`)
      .boundTo({
        value: 'Test custom bootstrap!',
      })
      .bootstrap((aurelia) => {
        configurationWithoutStart(aurelia);
      });
  });

  it('Test custom bootstrap', () => {
    component.create(bootstrap);
    cy.get(textElementSelector).contains('Test custom bootstrap!');
  });
});
