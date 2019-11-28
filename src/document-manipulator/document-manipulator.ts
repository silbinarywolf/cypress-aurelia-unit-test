import { autoinject } from 'aurelia-framework';

@autoinject
export class DocumentManipulator {
  protected documentQuerySelectorSuccess: boolean = false;

  protected documentBodyQuerySelectorSuccess: boolean = false;

  protected documentQueryAllSelectorSuccess: boolean = false;

  protected documentBodyQueryAllSelectorSuccess: boolean = false;

  protected attached(): void {
    // NOTE(Jake): 2019-02-20
    // We create a bunch of elements that manipulate 'document'
    // directly. This is to test that our code in 'iframe-fixes.ts' works.

    {
      const el = document.createElement('div');
      el.classList.add('bodyAppendChild');
      el.textContent = '- bodyAppendChild';
      document.body.appendChild(el);
    }

    {
      const el = document.createElement('div');
      el.classList.add('bodyAppendAndRemoveChild');
      el.textContent = '- bodyAppendAndRemoveChild';
      document.body.appendChild(el);
    }

    {
      const el = document.querySelector('document-manipulator');
      if (el) {
        this.documentQuerySelectorSuccess = true;
      }
    }

    {
      const el = document.body.querySelector('document-manipulator');
      if (el) {
        this.documentBodyQuerySelectorSuccess = true;
      }
    }

    if (document.querySelectorAll('document-manipulator').length > 0) {
      this.documentQueryAllSelectorSuccess = true;
    }

    if (document.body.querySelectorAll('document-manipulator').length > 0) {
      this.documentBodyQueryAllSelectorSuccess = true;
    }
  }
}
