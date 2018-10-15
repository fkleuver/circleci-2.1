import { customElement } from '@au-test/runtime';
import view from './app.html';

@customElement({
  name: 'app',
  templateOrNode: view,
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: []
})
export class App {
  message = 'Hello World!';
}
