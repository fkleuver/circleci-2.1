import { BindingContext as RuntimeContext, IScope } from '@au-test/runtime';

export const BindingContext = {
  ...RuntimeContext,
  createScopeForTest(bindingContext: any, parentBindingContext?: any): IScope {
    if (parentBindingContext) {
      return {
        bindingContext,
        overrideContext: this.createOverride(bindingContext, this.createOverride(parentBindingContext))
      };
    }

    return {
      bindingContext,
      overrideContext: this.createOverride(bindingContext)
    };
  }
};
