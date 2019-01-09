/// <reference types="cypress" />

import 'reflect-metadata';
import { Aurelia, Container, FrameworkConfiguration, ViewCompiler, ViewResources } from 'aurelia-framework';
import { DOM } from 'aurelia-pal';
import { View } from 'aurelia-templating';

// NOTE(Jake): 2019-01-07
// Used by aurelia-testing. Keeping incase we want to reintroduce.
// interface AureliaWithRoot extends Aurelia {
//    root: ViewWithControllers;
// }

declare global {
    interface Window { 
      AureliaCypress?: {
        AureliaDialogIsDisabled?: boolean
      }; 
    }
}

interface ViewWithControllers extends View {
  controllers: Array<{ viewModel: any }>;
}

// track the patches being used
let patches = newPatches();

const aureliaDialogWarningMessage = 'aurelia-dialog causes Cypress to crash. Removing plugin...';

// having weak reference to styles prevents garbage collection
// and "losing" styles when the next test starts
const stylesCache: Map<string, NodeListOf<Element>> = new Map<string, NodeListOf<Element>>();

// track components that were attached so they can be detached before
// each build
const componentsAttached: any[] = [];

function disposeComponents() {
  for (const component of componentsAttached) {
    if (component.detached) {
      component.detached();
    }
  }
  componentsAttached.length = 0;
}

// NOTE: Jake: 2018-12-18
// Taken from: https://github.com/bahmutov/cypress-react-unit-test/blob/master/lib/index.js
function copyStyles(componentName: string): void {
  // need to find same component when component is recompiled
  // by the JSX preprocessor. Thus have to use something else,
  // like component name
  const hash = componentName;

  let styles = document.querySelectorAll('head style');
  if (styles.length) {
    // tslint:disable-next-line:no-console
    console.log('Injected %d styles into view', styles.length);
    stylesCache.set(hash, styles);
  } else {
    // tslint:disable-next-line:no-console
    console.log('No styles injected for this component, checking cache...');
    const cachedStyles = stylesCache.get(hash);
    if (cachedStyles) {
      styles = cachedStyles;
    }
  }

  if (!styles) {
    return;
  }

  const parentDocument = window.parent.document;
  const projectName = Cypress.config('projectName' as any);
  const appIframeId = `Your App: '${projectName}'`;
  const appIframe = parentDocument.getElementById(appIframeId);
  const head = (appIframe as any).contentDocument.querySelector('head');
  styles.forEach(style => {
    head.appendChild(style);
  });
}

function newPatches() {
  return {
    aureliaDialogDisabled: false
  }
}

// _ is not supported / backwards compatible. Use this at your own risk.
export class _ {
  public static Patches() {
    return {...patches};
  }
}

export class StageComponent {
  public static withResources<T = any>(resources: string | string[] = []): ComponentTester<T> {
    // NOTE: Jake: 2018-12-19
    // Any components we tracked from the previous test, lets dispose them.
    disposeComponents();

    // NOTE: Jake: 2018-12-19
    // Clear document.body, this is so the first step of 2nd test won't have
    // the previous test rendered in it when you're debugging.
    const document: Document = (cy as any).state('document');
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    return new ComponentTester().withResources(resources);
  }
}

export class ComponentTester<T = any> {
  public viewModel?: T;

  // public element: Element;

  // private rootView: View;

  private host: HTMLTemplateElement | HTMLDivElement | null = null;

  private html: string = '';

  private resources: string[] = [];

  private bindingContext: {} = {};

  public withResources(resources: string | string[]): ComponentTester<T> {
    if (typeof resources === 'string') {
      this.resources = [resources];
      return this;
    }
    this.resources = resources;
    return this;
  }

  public inView(html: string): ComponentTester<T> {
    this.html = html;
    return this;
  }

  public boundTo(bindingContext: {}): ComponentTester<T> {
    this.bindingContext = bindingContext;
    return this;
  }

  public bootstrap(configure: (aurelia: Aurelia) => void | FrameworkConfiguration) {
    this.configure = configure;
    return this;
  }

  public create(bootstrap: (configure: (aurelia: Aurelia) => Promise<void>) => Promise<void>): any {
    // reset special internals
    patches = newPatches();

    // NOTE(Jake): 2019-01-08
    // We have an "any" annotation on create to silence the following error:
    // TS4053: Return type of public method from exported class has or is using name 'Bluebird' from external module
    // "cypress-aurelia-unit-test/node_modules/cypress/node_modules/@types/bluebird/index" but cannot be named.
    return new Cypress.Promise((resolve, reject) => {
      const document: Document = (cy as any).state('document');
      return bootstrap((aurelia: Aurelia) => {
        return Promise.resolve(this.configure(aurelia)).then(() => {
          if (this.resources) {
            aurelia.use.globalResources(this.resources);
          }

          // NOTE(Jake): 2018-12-18
          // Fixes "inner error: TypeError: Illegal constructor"
          // Modified answer from: https://github.com/aurelia/framework/issues/382
          aurelia.container.registerInstance(Element, document.createElement);

          // NOTE(Jake): 2018-12-20
          // Fix cases where a user has used @inject(DOM.Element)
          aurelia.container.registerInstance(DOM.Element, document.createElement);

          // Remove any plugins that don't work or cause crashes
          {
            let plugins: any[] = (aurelia.use as any).info;
            if (plugins) {
              plugins = plugins.filter((plugin) => {
                if (plugin &&
                  plugin.moduleId &&
                  plugin.moduleId === 'aurelia-dialog') {
                  // NOTE: Jake: 2018-12-19
                  // Aurelia dialog does not work with Cypress Unit testing. It seems like it tries to load <ux-dialog> in its own
                  // special way, and this falls over.
                  /*
                      (missing: http://localhost:61465/__cypress/iframes/integration/unit/4.autocomplete.test.ts)
                          at HTMLScriptElement.onScriptComplete (http://localhost:61465/__cypress/tests?p=cypress\integration\unit\autocomplete.test.ts-275:115:29)
                      From previous event:
                          at Function.requireEnsure [as e] (http://localhost:61465/__cypress/tests?p=cypress\integration\unit\autocomplete.test.ts-275:89:28)
                          at Object.ux-dialog (webpack:///./node_modules/aurelia-dialog/dist/native-modules/dialog-configuration.js?:13:59)
                          at eval (webpack:///./node_modules/aurelia-dialog/dist/native-modules/dialog-configuration.js?:41:91)
                          at Array.map (<anonymous>)
                  */
                  // tslint:disable-next-line:no-console
                  console.warn(aureliaDialogWarningMessage);
                  patches.aureliaDialogDisabled = true;
                  return false;
                }
                return true;
              });
              (aurelia.use as any).info = plugins;
            }
          }

          return aurelia.start().then(() => {
            if (document.activeElement !== document.body) {
              // Reset focus to body element if it's not on it
              document.body.focus();
            }

            this.host = document.createElement('template');
            this.host.innerHTML = this.html;

            // Compile the template and copy styles to the main iframe
            let view: ViewWithControllers;
            const compiler = Container.instance.get(ViewCompiler);
            try {
              view = compiler.compile(this.host, Container.instance.get(ViewResources)).create(Container.instance);
            } catch (err) {
              reject(err);
              return;
            }

            if (view.controllers.length > 0) {
              this.viewModel = view.controllers[0].viewModel;
              if (this.viewModel) {
                copyStyles(this.viewModel.constructor.name);
              } else {
                // tslint:disable-next-line:no-console
                console.warn('No view model found on first controller. Styles might not work.', this.html);
              }
            } else {
              // NOTE(Jake): 2018-12-19
              // Not sure if/when this case will execute or
              // what the ramifications of this are.
              copyStyles('undefined');
              // tslint:disable-next-line:no-console
              console.warn('Unable to determine component name from template. Bugs may occur in cleanup.', this.html);
            }

            // Clear the document body and add child
            while (document.body.firstChild) {
              document.body.removeChild(document.body.firstChild);
            }
            document.body.appendChild(view.fragment);

            // NOTE: Jake: 2018-12-20
            // Fix aurelia.enhance() problems that are occuring due to
            // a <compose> in a component.
            // Research: https://github.com/aurelia/framework/issues/600#issuecomment-252479570
            // Gist: https://gist.run/?id=c59eed72e1c255b8f462c1d45e495a7a
            document.body.querySelectorAll('.au-target').forEach((el) => {
              el.classList.remove('au-target');
              el.removeAttribute('au-target-id');
            });

            return aurelia.enhance(this.bindingContext, document.body).then(() => {
              // NOTE: Jake: 2018-12-19
              // These are in the original aurelia-testing library
              // this.rootView = aurelia.root;
              // this.element = this.host.firstElementChild as Element;

              if (view.bind) {
                view.bind(this.bindingContext);
              }
              if (view.attached) {
                view.attached();
              }
              componentsAttached.push(view);

              // Wait 4 frames, this allows us to do "hacky" CSS sizing calculations
              // that rely on requestAnimationFrame callbacks. This test framework
              // supports 4 by default. I might make this configurable in the future
              // if need be. (ie. can be disabled, decreased or increased)
              window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                  window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                      resolve();
                    });
                  });
                });
              });
            });
          }).catch((err) => {
            reject(err);
            return;
          });
        });
      });
    });
  }

  private configure = (aurelia: Aurelia): void | FrameworkConfiguration => {
    return aurelia.use.standardConfiguration();
  }
}
