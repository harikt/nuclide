'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable, Disposable} from 'atom';
import BuckIcon from './BuckIcon';
import BuckToolbar from './BuckToolbar';
import BuckToolbarActions from './BuckToolbarActions';
import BuckToolbarStore from './BuckToolbarStore';
import {Dispatcher} from 'flux';
import {React} from 'react-for-atom';

class Activation {
  _actions: BuckToolbarActions;
  _disposables: CompositeDisposable;
  _store: BuckToolbarStore;

  constructor(rawState: ?Object) {
    rawState = rawState || {};
    this._disposables = new CompositeDisposable(
      atom.commands.add(
        'body',
        'nuclide-buck-toolbar:toggle',
        () => { this._actions.togglePanelVisibility(); },
      ),
    );

    const initialState = {
      buildTarget: rawState.buildTarget || null,
      isPanelVisible: rawState.isPanelVisible || false,
      isReactNativeServerMode: rawState.isReactNativeServerMode || false,
    };

    const dispatcher = new Dispatcher();
    this._store = new BuckToolbarStore(dispatcher, initialState);
    this._disposables.add(this._store);
    this._actions = new BuckToolbarActions(dispatcher);

    const container = document.createElement('div');
    React.render(
      <BuckToolbar store={this._store} actions={this._actions} />,
      container,
    );
    const panel = atom.workspace.addTopPanel({
      item: container,
      // Increase priority (default is 100) to ensure this toolbar comes after the 'tool-bar'
      // package's toolbar. Hierarchically the controlling toolbar should be above, and practically
      // this ensures the popover in this build toolbar stacks on top of other UI.
      priority: 200,
    });
    this._disposables.add(
      new Disposable(() => {
        React.unmountComponentAtNode(container);
        panel.destroy();
      }),
    );
  }

  consumeToolBar(getToolBar: (group: string) => Object): void {
    const toolBar = getToolBar('nuclide-buck-toolbar');
    const toolBarButton = toolBar.addButton({
      callback: 'nuclide-buck-toolbar:toggle',
      tooltip: 'Toggle Buck Toolbar',
      iconset: 'ion',
      priority: 500,
    })[0];
    toolBarButton.innerHTML = React.renderToStaticMarkup(<BuckIcon />);
    this._disposables.add(
      new Disposable(() => { toolBar.removeItems(); }),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  serialize(): Object {
    return {
      buildTarget: this._store.getBuildTarget(),
      isPanelVisible: this._store.isPanelVisible(),
      isReactNativeServerMode: this._store.isReactNativeServerMode(),
    };
  }

}

module.exports = Activation;
