/**
 * copyEventHandlesFromSpecToAppIFrame will fix an issue where certain events aren't on
 * the app iframe context. Without this code, certain features like "click.delegate" won't
 * work in Aurelia templates.
 */
function copyEventHandlesFromSpecIFrameToAppIFrame(): void {
  const specIframe = window.parent.document.querySelector('iframe.spec-iframe');
  if (!specIframe) {
    throw new Error('Cannot find .spec-iframe');
  }
  const specDocument: Document = (specIframe as any).contentDocument;
  if (!specDocument) {
    throw new Error('Cannot find contentDocument on specIframe');
  }

  const rootDocument = window.parent.document;
  const appIframe = rootDocument.querySelector('iframe.aut-iframe');
  if (!appIframe) {
    throw new Error('Cannot find .aut-iframe');
  }
  const appDocument: Document = (appIframe as any).contentDocument;
  if (!appDocument) {
    throw new Error('Cannot find contentDocument on appIframe');
  }

  // Override addEventListener on spec iframe so that we can attach those
  // same events to the app iframe, this fixes:
  // - aurelia-binding - click.delegate won't work in templates without this.
  const originalEventListener = specDocument.addEventListener;
  const addEventListener = function(this: any): void {
    originalEventListener.apply(this, arguments as any);
    appDocument.addEventListener.apply(appDocument, arguments as any);
  };
  if (specDocument.addEventListener !== addEventListener) {
    specDocument.addEventListener = addEventListener;
  }
}

before(copyEventHandlesFromSpecIFrameToAppIFrame);
