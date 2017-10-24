/* @flow */
'use strict';

import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

const asyncGenerator = async (fn: Function): Promise<void> => {
    return new Promise((resolve, reject) => {

    });
}


// https://medium.com/javascript-scene/the-hidden-power-of-es6-generators-observable-async-flow-control-cfa4c7f31435
/* How to use gensync() */

// const fetchSomething = () => new Promise((resolve) => {
//   setTimeout(() => resolve('future value'), 500);
// });

// const asyncFunc = gensync(function* () {
//   const result = yield fetchSomething(); // returns promise

//   // waits for promise and uses promise result
//   yield result + ' 2';
// });

// // Call the async function and pass params.
// asyncFunc('param1', 'param2', 'param3')
//   .then(val => console.log(val)); // 'future value 2'
