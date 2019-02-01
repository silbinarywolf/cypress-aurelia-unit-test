import { autoinject, containerless } from 'aurelia-framework';

@autoinject
@containerless
export class ContainerlessDiv {
  protected attachedCounter = 0;

  protected attached(): void {
    this.attachedCounter += 1;
  }
}
