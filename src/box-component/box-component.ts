import { autoinject, bindable } from 'aurelia-framework';
import * as styles from '~/box-component/box-component.scss';

@autoinject
export class BoxComponent {
  protected readonly styles = styles

  @bindable
  public value: string = '';
}
