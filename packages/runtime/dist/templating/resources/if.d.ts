import { BindingFlags } from '../../binding/binding-flags';
import { INode, IRenderLocation } from '../../dom';
import { ICustomAttribute } from '../custom-attribute';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IView, IViewFactory } from '../view';
import { CompositionCoordinator } from './composition-coordinator';
export interface If extends ICustomAttribute {
}
export declare class If {
    ifFactory: IViewFactory;
    location: IRenderLocation;
    value: boolean;
    elseFactory: IViewFactory;
    ifView: IView;
    elseView: IView;
    coordinator: CompositionCoordinator;
    constructor(ifFactory: IViewFactory, location: IRenderLocation);
    binding(flags: BindingFlags): void;
    attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
    detaching(lifecycle: IDetachLifecycle): void;
    unbinding(flags: BindingFlags): void;
    caching(): void;
    valueChanged(): void;
    private updateView;
    private ensureView;
}
export declare class Else {
    private factory;
    constructor(factory: IViewFactory, location: IRenderLocation);
    link(ifBehavior: If): void;
}
//# sourceMappingURL=if.d.ts.map