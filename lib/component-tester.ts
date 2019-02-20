/// <reference types="cypress" />

import 'reflect-metadata';
import { Aurelia, FrameworkConfiguration } from 'aurelia-framework';
import { DOM } from 'aurelia-pal';

interface AureliaController {
  view: {
    resources: {
      viewUrl: string
    }
  };
  viewModel: any;
}

interface Node {
  firstChild: Node | null;
  nextSibling: Node | null;
  au?: { [name: string]: AureliaController | undefined };
}

// NOTE(Jake): 2019-01-07
// Used by aurelia-testing. Keeping incase we want to reintroduce.
// interface AureliaWithRoot extends Aurelia {
//    root: ViewWithControllers;
// }
// interface ViewWithControllers extends View {
//  controllers: Array<{ viewModel: any }>;
// }

// track the patches being used
let patches = newPatches();

const aureliaDialogWarningMessage = 'aurelia-dialog causes Cypress to crash. Removing plugin...';

// having weak reference to styles prevents garbage collection
// and "losing" styles when the next test starts
const stylesCache: Map<string, NodeListOf<HTMLStyleElement>> = new Map<string, NodeListOf<HTMLStyleElement>>();

// NOTE: Jake: 2018-12-18
// Taken from: https://github.com/bahmutov/cypress-react-unit-test/blob/master/lib/index.js
function copyStyles(componentName: string): void {
  // need to find same component when component is recompiled
  // by the JSX preprocessor. Thus have to use something else,
  // like component name
  const hash = componentName;

  let styles = document.head.querySelectorAll('style');
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

// walkNode recursively
function walkNode(node: Node | null, func: (node: Node) => void): void {
  if (!node ||
    !node.firstChild) {
    return;
  }
  func(node);
  node = node.firstChild;
  while (node) {
    walkNode(node, func);
    node = node.nextSibling;
  }
}

function newPatches() {
  return {
    aureliaDialogDisabled: false
  };
}

// _ is not supported / backwards compatible. Use this at your own risk.
// tslint:disable-next-line:class-name
export class _ {
  public static Patches() {
    return { ...patches };
  }
}

export class StageComponent {
  public static withResources<T = any>(resources: string | string[] = []): ComponentTester<T> {
    // NOTE: Jake: 2018-12-19
    // Clear document.body, this is so the first step of 2nd test won't have
    // the previous test rendered in it when you're debugging.
    const doc: Document = (cy as any).state('document');
    while (doc.body.firstChild) {
      doc.body.removeChild(doc.body.firstChild);
    }

    return new ComponentTester().withResources(resources);
  }
}

export class ComponentTester<T = any> {
  /**
   * The class of the component. This is value is undefined for containerless components.
   */
  public viewModel?: T;

  // public element: Element;

  // private rootView: View;

  // private host: HTMLTemplateElement | HTMLDivElement | null = null;

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
      const doc: Document = (cy as any).state('document');
      return bootstrap((aurelia: Aurelia) => {
        return Promise.resolve(this.configure(aurelia)).then(() => {
          if (this.resources) {
            aurelia.use.globalResources(this.resources);
          }

          // Reset viewModel
          this.viewModel = undefined;

          // NOTE(Jake): 2018-12-18
          // Fixes "inner error: TypeError: Illegal constructor"
          // Modified answer from: https://github.com/aurelia/framework/issues/382
          aurelia.container.registerInstance(Element, doc.createElement);

          // NOTE(Jake): 2018-12-20
          // Fix cases where a user has used @inject(DOM.Element)
          aurelia.container.registerInstance(DOM.Element, doc.createElement);

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
            if (doc.activeElement !== doc.body) {
              // Reset focus to body element if it's not on it
              doc.body.focus();
            }

            // Clear the document body and add child
            while (doc.body.firstChild) {
              doc.body.removeChild(doc.body.firstChild);
            }
            doc.body.innerHTML = this.html;

            // NOTE: Jake: 2019-01-31 - #8
            // Consider allowing bindingContext to be a function as well.
            // A potential benefit is that you can use "Container.instance.get" within the context
            const bindingContext = this.bindingContext;
            // const bindingContext = typeof(this.bindingContext) === 'function' ? this.bindingContext() : this.bindingContext;
            const rootElement = doc.body;
            return aurelia.enhance(bindingContext, rootElement).then(() => {
              // NOTE: Jake: 2018-12-19
              // These are in the original aurelia-testing library
              // this.rootView = aurelia.root;
              // this.element = this.host.firstElementChild as Element;
              copyStyles(this.resources.join(','));

              // NOTE: Jake: 2019-02-13
              // We walk the newly enhanced DOM to find the controller applied
              // to the element so that we can extract the viewModel.
              walkNode(rootElement, (el) => {
                if (!this.viewModel &&
                  el.au) {
                  const controllers = el.au;
                  let controller;
                  for (const key in controllers) {
                    if (!controllers.hasOwnProperty(key)) {
                      continue;
                    }
                    controller = controllers[key];
                    break;
                  }
                  if (controller &&
                    controller.view) {
                    // NOTE: Jake: 2019-02-13
                    // There is no way to guarantee the first element we find is the element
                    // we intended to mount (due to @containerless), so we check that this
                    // element's template resource reference matches the one we gave.
                    // We also compare two versions, one string without *.html and one with it
                    // as both are valid.
                    const viewUrl = controller.view.resources.viewUrl;
                    const viewUrlNoExt = viewUrl.split('.').slice(0, -1).join('.');
                    if (this.resources.indexOf(viewUrl) > -1 ||
                      this.resources.indexOf(viewUrlNoExt) > -1) {
                      this.viewModel = controller.viewModel;
                    }
                  }
                }
              });
              if (!this.viewModel) {
                // tslint:disable-next-line:no-console
                console.warn('Unable to determine viewModel for mounted component. This is expected behaviour for @containerless components.');
              }

              // NOTE: Jake: 2019-01-31 - #9
              // We used to call these manually like the aurelia-testing library,
              // however aurelia.enhance() calls lifecycle methods already, so this was
              // actually causing bugs where attached() was being called twice.
              // if (view.bind) {
              //  view.bind(bindingContext);
              // }
              // if (view.attached) {
              //  view.attached();
              // }

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
