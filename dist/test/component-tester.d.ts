import 'reflect-metadata';
import { Aurelia, FrameworkConfiguration } from 'aurelia-framework';
export declare class StageComponent {
    static withResources<T = any>(resources?: string | string[]): ComponentTester<T>;
}
export declare class ComponentTester<T = any> {
    viewModel: T;
    private host;
    private html;
    private resources;
    private bindingContext;
    withResources(resources: string | string[]): ComponentTester<T>;
    inView(html: string): ComponentTester<T>;
    boundTo(bindingContext: {}): ComponentTester<T>;
    bootstrap(configure: (aurelia: Aurelia) => void | FrameworkConfiguration): this;
    create(bootstrap: (configure: (aurelia: Aurelia) => Promise<void>) => Promise<void>): any;
    private configure;
}
