import { IResourceDescriptions } from '../resource';
import { ITemplateSource, TemplateDefinition } from './instructions';
import { ViewCompileFlags } from './view-compile-flags';
export interface ITemplateCompiler {
    readonly name: string;
    compile(definition: ITemplateSource, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}
export declare const ITemplateCompiler: import("@au-test/kernel/dist/di").InterfaceSymbol<ITemplateCompiler>;
//# sourceMappingURL=template-compiler.d.ts.map