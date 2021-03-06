'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const invariant = require('assert');

/*eslint-disable no-unused-vars*/
type WaitsForPromiseOptions = {
  shouldReject?: boolean;
  timeout?: number;
}
/*eslint-enable no-unused-vars*/

function waitsForPromise(...args: Array<WaitsForPromiseOptions | () => Promise<mixed>>): void {
  let shouldReject;
  let timeout;
  if (args.length > 1) {
    shouldReject = args[0].shouldReject;
    timeout = args[0].timeout;
  } else {
    shouldReject = false;
    timeout = 0;
  }

  let finished = false;

  runs(() => {
    const fn = args[args.length - 1];
    invariant(typeof fn === 'function');
    const promise = fn();
    if (shouldReject) {
      promise.then(() => {
        jasmine.getEnv().currentSpec.fail(
          'Expected promise to be rejected, but it was resolved');
      }, () => {
        // Do nothing, it's expected.
      }).then(() => {
        finished = true;
      });
    } else {
      promise.then(() => {
        // Do nothing, it's expected.
      }, (error) => {
        const text = error ? (error.stack || error.toString()) : 'undefined';
        jasmine.getEnv().currentSpec.fail(
          `Expected promise to be resolved, but it was rejected with ${text}`);
      }).then(() => {
        finished = true;
      });
    }
  });

  waitsFor(timeout, () => finished);
}

module.exports = waitsForPromise;
