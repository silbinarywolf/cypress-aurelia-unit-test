import { Aurelia, PLATFORM } from 'aurelia-framework';

export function configurationWithoutStart(aurelia: Aurelia): void {
    aurelia.use
        .developmentLogging()
        .standardConfiguration()
        //.plugin(PLATFORM.moduleName('aurelia-dialog'));
}

export function configure(aurelia: Aurelia): void {
    configurationWithoutStart(aurelia);
    aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
