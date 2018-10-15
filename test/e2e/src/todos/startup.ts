import { BasicConfiguration } from '@au-test/jit';
import { Aurelia } from '@au-test/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(BasicConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();

