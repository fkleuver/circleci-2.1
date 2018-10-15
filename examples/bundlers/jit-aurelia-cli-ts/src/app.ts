
import { customElement } from '@au-test/runtime';
import * as view from 'text!./app.html';

@customElement({
  name: 'app',
  templateOrNode: <any>view,
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: []
})
export class App {
  message = 'Hello World!';
}
