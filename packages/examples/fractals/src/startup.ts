import { BasicConfiguration } from '@au-test/jit';
import { Aurelia, ISVGAnalyzer } from '@au-test/runtime';
import { App } from './app';
import { DI, IContainer } from '@au-test/kernel';
import { register } from '@au-test/plugin-svg';
import { State } from './state';
import { Pythagoras } from './pythagoras';

window['App'] = App;
window['Pythagoras'] = Pythagoras;

let state: State;
const au = window['au'] = new Aurelia()
  .register(
    {
      register(container: IContainer) {
        state = container.get(State);
        register(container);
      }
    },
    BasicConfiguration,
    Pythagoras as any
  )
  .app({ host: document.querySelector('app'), component: new App(state) });
au
  .start();
