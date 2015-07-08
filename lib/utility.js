var Utility;

var UtilityView = require('./views/SFDCUtility-view');
var CompositeDisposable = require('atom').CompositeDisposable;

module.exports = Utility = {
  utilityView: null,
  modalPanel: null,
  subscriptions: null,
  activate: function(state) {
    this.utilityView = new UtilityView(state.utilityViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.utilityView.getElement(),
      visible: false
    });
    this.subscriptions = new CompositeDisposable;
    return this.subscriptions.add(atom.commands.add('atom-workspace', {
      'utility:toggle': (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this)
    }));
  },
  deactivate: function() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    return this.utilityView.destroy();
  },
  serialize: function() {
    return {
      utilityViewState: this.utilityView.serialize()
    };
  },
  toggle: function() {
    console.log('Utility was toggled!');
    if (this.modalPanel.isVisible()) {
      return this.modalPanel.hide();
    } else {
      return this.modalPanel.show();
    }
  }
};
