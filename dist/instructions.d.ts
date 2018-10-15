import { BindingMode, DelegationStrategy, ForOfStatement, ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetBindingInstruction, ILetElementInstruction, IListenerBindingInstruction, INode, Interpolation, IPropertyBindingInstruction, IRefBindingInstruction, IsBindingBehavior, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITargetedInstruction, ITemplateSource, ITextBindingInstruction, TargetedInstruction, TargetedInstructionType } from '@au-test/runtime';
export declare class TextBindingInstruction implements ITextBindingInstruction {
    srcOrExpr: string | Interpolation;
    type: TargetedInstructionType.textBinding;
    constructor(srcOrExpr: string | Interpolation);
}
export declare class InterpolationInstruction implements IInterpolationInstruction {
    srcOrExpr: string | Interpolation;
    dest: string;
    type: TargetedInstructionType.interpolation;
    constructor(srcOrExpr: string | Interpolation, dest: string);
}
export declare class OneTimeBindingInstruction implements IPropertyBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.propertyBinding;
    oneTime: true;
    mode: BindingMode.oneTime;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class ToViewBindingInstruction implements IPropertyBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.propertyBinding;
    oneTime: false;
    mode: BindingMode.toView;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class FromViewBindingInstruction implements IPropertyBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.propertyBinding;
    oneTime: false;
    mode: BindingMode.fromView;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class TwoWayBindingInstruction implements IPropertyBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.propertyBinding;
    oneTime: false;
    mode: BindingMode.twoWay;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class IteratorBindingInstruction implements IIteratorBindingInstruction {
    srcOrExpr: string | ForOfStatement;
    dest: string;
    type: TargetedInstructionType.iteratorBinding;
    constructor(srcOrExpr: string | ForOfStatement, dest: string);
}
export declare class TriggerBindingInstruction implements IListenerBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.listenerBinding;
    strategy: DelegationStrategy.none;
    preventDefault: true;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class DelegateBindingInstruction implements IListenerBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.listenerBinding;
    strategy: DelegationStrategy.bubbling;
    preventDefault: false;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class CaptureBindingInstruction implements IListenerBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.listenerBinding;
    strategy: DelegationStrategy.capturing;
    preventDefault: false;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class CallBindingInstruction implements ICallBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.callBinding;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class RefBindingInstruction implements IRefBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    type: TargetedInstructionType.refBinding;
    constructor(srcOrExpr: string | IsBindingBehavior);
}
export declare class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
    srcOrExpr: string | IsBindingBehavior;
    dest: string;
    type: TargetedInstructionType.stylePropertyBinding;
    constructor(srcOrExpr: string | IsBindingBehavior, dest: string);
}
export declare class SetPropertyInstruction implements ISetPropertyInstruction {
    value: any;
    dest: string;
    type: TargetedInstructionType.setProperty;
    constructor(value: any, dest: string);
}
export declare class SetAttributeInstruction implements ITargetedInstruction {
    value: any;
    dest: string;
    type: TargetedInstructionType.setAttribute;
    constructor(value: any, dest: string);
}
export declare class HydrateElementInstruction implements IHydrateElementInstruction {
    res: any;
    instructions: TargetedInstruction[];
    parts?: Record<string, ITemplateSource>;
    contentOverride?: INode;
    type: TargetedInstructionType.hydrateElement;
    constructor(res: any, instructions: TargetedInstruction[], parts?: Record<string, ITemplateSource>, contentOverride?: INode);
}
export declare class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
    res: any;
    instructions: TargetedInstruction[];
    type: TargetedInstructionType.hydrateAttribute;
    constructor(res: any, instructions: TargetedInstruction[]);
}
export declare class HydrateTemplateController implements IHydrateTemplateController {
    src: ITemplateSource;
    res: any;
    instructions: TargetedInstruction[];
    link?: boolean;
    type: TargetedInstructionType.hydrateTemplateController;
    constructor(src: ITemplateSource, res: any, instructions: TargetedInstruction[], link?: boolean);
}
export declare class LetElementInstruction implements ILetElementInstruction {
    instructions: ILetBindingInstruction[];
    toViewModel: boolean;
    type: TargetedInstructionType.letElement;
    constructor(instructions: ILetBindingInstruction[], toViewModel: boolean);
}
export declare class LetBindingInstruction implements ILetBindingInstruction {
    srcOrExpr: string | IsBindingBehavior | Interpolation;
    dest: string;
    type: TargetedInstructionType.letBinding;
    constructor(srcOrExpr: string | IsBindingBehavior | Interpolation, dest: string);
}
//# sourceMappingURL=instructions.d.ts.map