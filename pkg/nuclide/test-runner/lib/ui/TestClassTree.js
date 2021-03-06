'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type LazyTreeNode from '../../../ui/tree';

const {React} = require('react-for-atom');
const TestClassTreeNode = require('./TestClassTreeNode');
const {TreeRootComponent} = require('../../../ui/tree');

const {PropTypes} = React;

function labelClassNameForNode(): string {
  return 'icon icon-code';
}

class TestClassTree extends React.Component {

  componentDidUpdate(prevProps: Object) {
    if (this.props.testSuiteModel !== prevProps.testSuiteModel) {
      const roots = [];
      if (this.props.testSuiteModel) {
        for (const testClass of this.props.testSuiteModel.testClasses.values()) {
          roots.push(new TestClassTreeNode(testClass));
        }
      }
      this.refs['tree'].setRoots(roots);
    }

    this.boundRowClassNameForNode = this.rowClassNameForNode.bind(this);
  }

  render() {
    const emptyRenderMessage = (
      <div className="nuclide-tree-root-placeholder">
        <h3>Running tests</h3>
        <ol>
          <li>Open the file you want to test</li>
          <li>Choose the appropriate runner from the dropdown</li>
          <li>{'Click "Test" to run tests for that file\'s directory'}</li>
        </ol>
      </div>
    );

    return (
      <TreeRootComponent
        elementToRenderWhenEmpty={emptyRenderMessage}
        eventHandlerSelector=".nuclide-test-runner-tree"
        initialRoots={[]}
        labelClassNameForNode={labelClassNameForNode}
        onKeepSelection={() => {}}
        ref="tree"
        rowClassNameForNode={this.boundRowClassNameForNode}
      />
    );
  }

  rowClassNameForNode(node: LazyTreeNode): ?string {
    if (!this.props.testSuiteModel) {
      return;
    }

    const item = node.getItem();
    const testRun = this.props.testSuiteModel.testRuns.get(item['id']);
    if (testRun) {
      if (testRun['numFailures'] > 0) {
        // Red/error if the test class had errors.
        return 'status-removed';
      } else if (testRun['numSkipped'] > 0) {
        // Yellow/warning if the class skipped tests.
        return 'status-modified';
      } else {
        // Green/success if all tests passed without skipping any.
        return 'status-added';
      }
    } else if (!this.props.isRunning) {
      return 'status-ignored';
    }
  }

}

TestClassTree.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  testSuiteModel: PropTypes.object,
};

module.exports = TestClassTree;
