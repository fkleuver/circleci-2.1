import { Aurelia } from '@au-test/runtime';
import { App } from './app';
import { GeneratedConfiguration } from './generated-configuration';

window['au'] = new Aurelia()
  .register(GeneratedConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
