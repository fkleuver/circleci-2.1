import { IContainer, Reporter as RuntimeReporter } from '@au-test/kernel';
import { enableImprovedExpressionDebugging } from './binding/unparser';
import { Reporter } from './reporter';

export const DebugConfiguration = {
  register(container: IContainer): void {
    Reporter.write(2);
    Object.assign(RuntimeReporter, Reporter);
    enableImprovedExpressionDebugging();
  }
};
