import { autoinject } from 'aurelia-framework';

@autoinject
export class MyButton {
  protected hasBeenClicked: boolean = false;

  protected readonly onClick = (): void => {
    this.hasBeenClicked = true;
  }
}
