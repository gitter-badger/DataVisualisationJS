import {world} from './temp';

export function helloWorld() {
  console.log('Hello ' + world() + ' !!');
}

window.hello = helloWorld;
