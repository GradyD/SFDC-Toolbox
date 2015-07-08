var ApexProvider, VisualforceTagProvider, _, apex, fuzzaldrin, vf;
fuzzaldrin = require('fuzzaldrin');
apex = require('./apex.json');
vf = require('./vf.json');
_ = require('underscore-plus');

ApexProvider = (function() {
  ApexProvider.prototype.id = 'apexprovider';
  ApexProvider.prototype.selector = '.source.apex';
  ApexProvider.prototype.apexClasses = null;

  function ApexProvider() {
    var apexClasses, apexNamespaces;
    apexClasses = [];
    apexNamespaces = apex.publicDeclarations;
    _.each(_.keys(apexNamespaces), function(ns) {
      return _.each(_.keys(apexNamespaces[ns]), function(cls) {
        return apexClasses.push(cls);
      });
    });
    this.apexClasses = apexClasses;
  }

  ApexProvider.prototype.requestHandler = function(options) {
    var len, suggestion, suggestions, word, words;
    suggestions = [];
    words = fuzzaldrin.filter(this.apexClasses, options.prefix);
    for (var i = 0, len = words.length; i < len; i++) {
      word = words[i];
      suggestion = {
        prefix: options.prefix,
        word: word,
        label: 'Apex'
      };
      suggestions.push(suggestion);
    }
    return suggestions;
  };

  return ApexProvider;

})();

VisualforceTagProvider = (function() {
  VisualforceTagProvider.prototype.id = 'visualforceprovider';
  VisualforceTagProvider.prototype.selector = '.visualforce';
  VisualforceTagProvider.prototype.vfTags = null;

  function VisualforceTagProvider() {
    this.vfTags = vf.tags;
  }

  VisualforceTagProvider.prototype.requestHandler = function(options) {
    var len, suggestion, suggestions, word, words;
    suggestions = [];
    words = fuzzaldrin.filter(this.vfTags, options.prefix);
    for (var i = 0, len = words.length; i < len; i++) {
      word = words[i];
      suggestion = {
        prefix: options.prefix,
        word: word,
        label: 'Visualforce'
      };
      suggestions.push(suggestion);
    }
    return suggestions;
  };

  return VisualforceTagProvider;

})();

module.exports.ApexProvider = ApexProvider;
module.exports.VisualforceTagProvider = VisualforceTagProvider;
