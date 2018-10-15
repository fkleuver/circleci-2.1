import { Constructable, Immutable, Omit } from '@au-test/kernel';
import { IScope } from '../binding/binding-context';
import { BindingMode } from '../binding/binding-mode';
import { IBindScope } from '../binding/observation';
import { IResourceKind, IResourceType } from '../resource';
import { IBindableDescription } from './bindable';
import { IAttach } from './lifecycle';
import { IRenderingEngine } from './rendering-engine';
export interface ICustomAttributeSource {
    name: string;
    defaultBindingMode?: BindingMode;
    aliases?: string[];
    isTemplateController?: boolean;
    bindables?: Record<string, IBindableDescription>;
}
export declare type AttributeDefinition = Immutable<Required<ICustomAttributeSource>> | null;
export declare type ICustomAttributeType = IResourceType<ICustomAttributeSource, ICustomAttribute>;
export interface ICustomAttribute extends IBindScope, IAttach {
    readonly $scope: IScope;
    $hydrate(renderingEngine: IRenderingEngine): void;
}
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export declare function customAttribute(nameOrSource: string | ICustomAttributeSource): <T extends Constructable<{}>>(target: T) => T & IResourceType<ICustomAttributeSource, ICustomAttribute>;
/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export declare function templateController(nameOrSource: string | Omit<ICustomAttributeSource, 'isTemplateController'>): <T extends Constructable<{}>>(target: T) => T & IResourceType<ICustomAttributeSource, ICustomAttribute>;
export declare const CustomAttributeResource: IResourceKind<ICustomAttributeSource, ICustomAttributeType>;
//# sourceMappingURL=custom-attribute.d.ts.map