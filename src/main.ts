import { Aurelia, PLATFORM } from 'aurelia-framework';

// configurationWithoutStart exists so that Cypress tests can utilize the
// same configuration as the app
export function configurationWithoutStart(aurelia: Aurelia): void {
  aurelia.use
    .developmentLogging()
    .standardConfiguration();
}

export function configure(aurelia: Aurelia): void {
  configurationWithoutStart(aurelia);
  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app/app')));
}
