import { ForOfStatement, Interpolation, IsBindingBehavior } from './ast';
export interface IExpressionParser {
    cache(expressions: Record<string, Interpolation | ForOfStatement | IsBindingBehavior>): void;
    parse(expression: string, bindingType: BindingType.ForCommand): ForOfStatement;
    parse(expression: string, bindingType: BindingType.Interpolation): Interpolation;
    parse(expression: string, bindingType: Exclude<BindingType, BindingType.ForCommand | BindingType.Interpolation>): IsBindingBehavior;
    parse(expression: string, bindingType: BindingType): Interpolation | ForOfStatement | IsBindingBehavior;
}
export declare const IExpressionParser: import("@au-test/kernel/dist/di").InterfaceSymbol<IExpressionParser>;
export declare const enum BindingType {
    None = 0,
    Interpolation = 2048,
    IsRef = 1280,
    IsIterator = 512,
    IsCustom = 256,
    IsFunction = 128,
    IsEvent = 64,
    IsProperty = 32,
    IsCommand = 16,
    IsPropertyCommand = 48,
    IsEventCommand = 80,
    DelegationStrategyDelta = 6,
    Command = 15,
    OneTimeCommand = 49,
    ToViewCommand = 50,
    FromViewCommand = 51,
    TwoWayCommand = 52,
    BindCommand = 53,
    TriggerCommand = 86,
    CaptureCommand = 87,
    DelegateCommand = 88,
    CallCommand = 153,
    OptionsCommand = 26,
    ForCommand = 539,
    CustomCommand = 284
}
//# sourceMappingURL=expression-parser.d.ts.map