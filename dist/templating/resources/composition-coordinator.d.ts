import { IScope } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { INode } from '../../dom';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IView } from '../view';
export declare class CompositionCoordinator {
    onSwapComplete: () => void;
    private queue;
    private currentView;
    private swapTask;
    private encapsulationSource;
    private scope;
    private isBound;
    private isAttached;
    compose(value: IView | Promise<IView>): void;
    binding(flags: BindingFlags, scope: IScope): void;
    attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
    detaching(lifecycle: IDetachLifecycle): void;
    unbinding(flags: BindingFlags): void;
    caching(): void;
    private enqueue;
    private swap;
    private processNext;
    private detachAndUnbindCurrentView;
    private bindAndAttachCurrentView;
}
//# sourceMappingURL=composition-coordinator.d.ts.map