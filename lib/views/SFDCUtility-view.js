var UtilityView;

module.exports = UtilityView = (function() {
  function UtilityView(serializedState) {
    var message;
    this.element = document.createElement('div');
    this.element.classList.add('utility');
    message = document.createElement('div');
    message.textContent = "This will eventually show a SF login screen";
    message.classList.add('message');
    this.element.appendChild(message);
  }

  UtilityView.prototype.serialize = function() {};

  UtilityView.prototype.destroy = function() {
    return this.element.remove();
  };

  UtilityView.prototype.getElement = function() {
    return this.element;
  };

  return UtilityView;

})();
