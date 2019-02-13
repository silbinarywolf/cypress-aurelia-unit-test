import { PLATFORM } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'cypress-aurelia-unit-test';

import { BoxComponent } from '~/box-component/box-component';
import * as styles from '~/box-component/box-component.scss';
import { ContainerlessDiv } from '~/containerless-div/containerless-div';

describe('ViewModel', () => {
  it('Test getting data from viewModel', () => {
    const component = StageComponent
      .withResources<BoxComponent>(PLATFORM.moduleName('box-component/box-component'))
      .inView(`
        <box-component
          value.bind="value"
        ></box-component>`)
      .boundTo({
        value: 'viewModel test'
      });
    component.create(bootstrap);
    cy.get(`.${styles.main}`).then(() => {
      if (!component.viewModel) {
        expect(component.viewModel).to.not.equal(undefined);
        return;
      }
      expect(component.viewModel.value).to.equal('viewModel test');
    });
  });

  it('Test setting data on viewModel and it updating the view', () => {
    const component = StageComponent
      .withResources<BoxComponent>(PLATFORM.moduleName('box-component/box-component'))
      .inView(`
        <box-component
          value.bind="value"
        ></box-component>`)
      .boundTo({
        value: 'viewModel not setup'
      });
    component.create(bootstrap);
    cy.get(`.${styles.main}`).then(() => {
      if (!component.viewModel) {
        expect(component.viewModel).to.not.equal(undefined);
        return;
      }
      component.viewModel.value = 'viewModel has been changed!';
    });
    cy.get(`.${styles.main}`).contains('viewModel has been changed!');
  });

  it('Check that viewModel is undefined for containerless component', () => {
    const component = StageComponent
      .withResources<ContainerlessDiv>(PLATFORM.moduleName('containerless-div/containerless-div'))
      .inView(`<containerless-div></containerless-div>`);
    component.create(bootstrap);
    cy.get(`div`).then(() => {
      // NOTE: Jake: 2019-02-13
      // At the time of writing we retrieve the viewModel from
      // the mounted elements after running "enhance()", this means we
      // can't get the viewModel for containerless components.
      expect(component.viewModel).to.equal(undefined);
    });
  });
});
