function overrideSpecIFrameToApplyToAppIFrame(): void {
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
  {
    const originalEventListener = specDocument.addEventListener;
    const addEventListener = function(this: any): void {
      originalEventListener.apply(this, arguments as any);
      appDocument.addEventListener.apply(appDocument, arguments as any);
    };
    if (specDocument.addEventListener !== addEventListener) {
      specDocument.addEventListener = addEventListener;
    }
  }

  // Override document.appendChild on spec iframe so that we can append those
  // elements to the app iframe.
  {
    const documentAppendChild = function <T extends Node>(this: T): T {
      return appDocument.appendChild.apply(appDocument, arguments as any) as T;
    };
    if (specDocument.appendChild !== documentAppendChild) {
      specDocument.appendChild = documentAppendChild;
    }
  }

  // Override document.body.appendChild on spec iframe so that we can append those
  // elements to the app iframe.
  {
    const bodyAppendChild = function <T extends Node>(this: T): T {
      return appDocument.body.appendChild.apply(appDocument.body, arguments as any) as T;
    };
    if (specDocument.body.appendChild !== bodyAppendChild) {
      specDocument.body.appendChild = bodyAppendChild;
    }
  }

  // Override document.querySelector on spec iframe so that we can query for
  // elements that have been rendered in the app iframe.
  {
    const documentQuerySelector = function(this: any): Element | null {
      return appDocument.querySelector.apply(appDocument, arguments as any);
    };
    if (specDocument.querySelector !== documentQuerySelector) {
      specDocument.querySelector = documentQuerySelector;
    }
  }

  // Override document.body.querySelector on spec iframe so that we can query for
  // elements that have been rendered in the app iframe.
  {
    const bodyQuerySelector = function(this: any): Element | null {
      return appDocument.body.querySelector.apply(appDocument.body, arguments as any);
    };
    if (specDocument.body.querySelector !== bodyQuerySelector) {
      specDocument.body.querySelector = bodyQuerySelector;
    }
  }

  // Override document.querySelectorAll on spec iframe so that we can query for
  // elements that have been rendered in the app iframe.
  {
    const documentQueryAllSelector = function(this: any): NodeListOf<Element> {
      return appDocument.querySelectorAll.apply(appDocument, arguments as any);
    };
    if (specDocument.querySelectorAll !== documentQueryAllSelector) {
      specDocument.querySelectorAll = documentQueryAllSelector;
    }
  }

  // Override document.querySelectorAll on spec iframe so that we can query for
  // elements that have been rendered in the app iframe.
  {
    const bodyQueryAllSelector = function(this: any): NodeListOf<Element> {
      return appDocument.body.querySelectorAll.apply(appDocument.body, arguments as any);
    };
    if (specDocument.body.querySelectorAll !== bodyQueryAllSelector) {
      specDocument.body.querySelectorAll = bodyQueryAllSelector;
    }
  }
}

before(overrideSpecIFrameToApplyToAppIFrame);
