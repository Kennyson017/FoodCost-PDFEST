import { loadState, STATE } from './js/state.js';

// mock localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

loadState();
console.log(STATE);
