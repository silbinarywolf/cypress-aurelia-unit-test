import { autoinject, bindable } from 'aurelia-framework';

@autoinject
export class BoxComponent {
  protected readonly styles = {
    main: 'box-component__main',
    content: 'box-component__content',
  };

  @bindable
  public value: string = '';
}
