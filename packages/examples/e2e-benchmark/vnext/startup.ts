import { BasicConfiguration } from '@au-test/jit';
import { DI } from '@au-test/kernel';
import { Aurelia, IChangeSet } from '@au-test/runtime';
import { App } from './app';
import { Instrumenter } from './instrumenter';
declare var instrumenter: Instrumenter;

instrumenter.markLifecycle('module-loaded');

const container = DI.createContainer();
const changeSet = <IChangeSet>container.get(IChangeSet);
instrumenter.changeSet = changeSet;
const au = window['au'] = new Aurelia(container);

instrumenter.markLifecycle('au-created');

au.register(BasicConfiguration);
const host = document.querySelector('app');
const component = new App(changeSet);
const config = { host, component };

au.app(config);

instrumenter.markLifecycle('au-configured');

au.start();

instrumenter.markLifecycle('au-started');
