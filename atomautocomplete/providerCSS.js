var cssDocsURL, firstCharsEqual, fs, hasScope, path, pesudoSelectorPrefixPattern, propertyNamePrefixPattern, propertyNameWithColonPattern, tagSelectorPrefixPattern;
fs = require('fs');
path = require('path');
propertyNameWithColonPattern = /^\s*(\S+)\s*:/;
propertyNamePrefixPattern = /[a-zA-Z]+[-a-zA-Z]*$/;
pesudoSelectorPrefixPattern = /:(:)?([a-z]+[a-z-]*)?$/;
tagSelectorPrefixPattern = /(^|\s|,)([a-z]+)?$/;
cssDocsURL = "https://developer.mozilla.org/en-US/docs/Web/CSS";

module.exports = {
  selector: '.source.css',
  disableForSelector: '.source.css .comment, .source.css .string',
  filterSuggestions: true,
  getSuggestions: function(request) {
    var completions, isCompletingPseudoSelector, tagCompletions;
    completions = null;
    isCompletingPseudoSelector = this.isCompletingPseudoSelector(request);
    if (isCompletingPseudoSelector) {
      completions = this.getPseudoSelectorCompletions(request);
    } else if (this.isCompletingValue(request)) {
      completions = this.getPropertyValueCompletions(request);
    } else if (this.isCompletingName(request)) {
      completions = this.getPropertyNameCompletions(request);
    }
    if (this.isCompletingTagSelector(request)) {
      tagCompletions = this.getTagCompletions(request);
      if (tagCompletions != null ? tagCompletions.length : void 0) {
        if (completions == null) {
          completions = [];
        }
        completions = completions.concat(tagCompletions);
      }
    }
    return completions;
  },
  onDidInsertSuggestion: function(arg) {
    var editor, suggestion;
    editor = arg.editor, suggestion = arg.suggestion;
    if (suggestion.type === 'property') {
      return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
    }
  },
  triggerAutocomplete: function(editor) {
    return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
      activatedManually: false
    });
  },
  loadProperties: function() {
    this.properties = {};
    return fs.readFile(path.resolve(__dirname, '..', 'completions.json'), (function(_this) {
      return function(error, content) {
        var ref;
        if (error == null) {
          ref = JSON.parse(content), _this.pseudoSelectors = ref.pseudoSelectors, _this.properties = ref.properties, _this.tags = ref.tags;
        }
      };
    })(this));
  },
  isCompletingValue: function(arg) {
    var scopeDescriptor, scopes;
    scopeDescriptor = arg.scopeDescriptor;
    scopes = scopeDescriptor.getScopesArray();
    return (scopes.indexOf('meta.property-value.css') !== -1 && scopes.indexOf('punctuation.separator.key-value.css') === -1) || (scopes.indexOf('meta.property-value.scss') !== -1 && scopes.indexOf('punctuation.separator.key-value.scss') === -1);
  },
  isCompletingName: function(arg) {
    var scopeDescriptor, scopes;
    scopeDescriptor = arg.scopeDescriptor;
    scopes = scopeDescriptor.getScopesArray();
    return scopes.indexOf('meta.property-list.css') !== -1 || scopes.indexOf('meta.property-list.scss') !== -1;
  },
  isCompletingTagSelector: function(arg) {
    var bufferPosition, editor, scopeDescriptor, scopes, tagSelectorPrefix;
    editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition;
    scopes = scopeDescriptor.getScopesArray();
    tagSelectorPrefix = this.getTagSelectorPrefix(editor, bufferPosition);
    if (!(tagSelectorPrefix != null ? tagSelectorPrefix.length : void 0)) {
      return false;
    }
    if (hasScope(scopes, 'meta.selector.css')) {
      return true;
    } else if (hasScope(scopes, 'source.css.scss') || hasScope(scopes, 'source.css.less')) {
      return !hasScope(scopes, 'meta.property-value.scss') && !hasScope(scopes, 'meta.property-value.css') && !hasScope(scopes, 'support.type.property-value.css');
    } else {
      return false;
    }
  },
  isCompletingPseudoSelector: function(arg) {
    var bufferPosition, editor, prefix, previousBufferPosition, previousScopes, previousScopesArray, scopeDescriptor, scopes;
    editor = arg.editor, scopeDescriptor = arg.scopeDescriptor, bufferPosition = arg.bufferPosition;
    scopes = scopeDescriptor.getScopesArray();
    if (hasScope(scopes, 'meta.selector.css')) {
      return true;
    } else if (hasScope(scopes, 'source.css.scss') || hasScope(scopes, 'source.css.less')) {
      prefix = this.getPseudoSelectorPrefix(editor, bufferPosition);
      if (prefix) {
        previousBufferPosition = [bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1)];
        previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
        previousScopesArray = previousScopes.getScopesArray();
        return !hasScope(previousScopesArray, 'meta.property-name.scss') && !hasScope(previousScopesArray, 'meta.property-value.scss') && !hasScope(previousScopesArray, 'support.type.property-name.css') && !hasScope(previousScopesArray, 'support.type.property-value.css');
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  isPropertyValuePrefix: function(prefix) {
    prefix = prefix.trim();
    return prefix.length > 0 && prefix !== ':';
  },
  getPreviousPropertyName: function(bufferPosition, editor) {
    var line, propertyName, ref, row;
    row = bufferPosition.row;
    while (row >= 0) {
      line = editor.lineTextForBufferRow(row);
      propertyName = (ref = propertyNameWithColonPattern.exec(line)) != null ? ref[1] : void 0;
      if (propertyName) {
        return propertyName;
      }
      row--;
    }
  },
  getPropertyValueCompletions: function(arg) {
    var bufferPosition, completions, editor, i, j, len, len1, prefix, property, ref, value, values;
    bufferPosition = arg.bufferPosition, editor = arg.editor, prefix = arg.prefix;
    property = this.getPreviousPropertyName(bufferPosition, editor);
    values = (ref = this.properties[property]) != null ? ref.values : void 0;
    if (values == null) {
      return null;
    }
    completions = [];
    if (this.isPropertyValuePrefix(prefix)) {
      for (i = 0, len = values.length; i < len; i++) {
        value = values[i];
        if (firstCharsEqual(value, prefix)) {
          completions.push(this.buildPropertyValueCompletion(value, property));
        }
      }
    } else {
      for (j = 0, len1 = values.length; j < len1; j++) {
        value = values[j];
        completions.push(this.buildPropertyValueCompletion(value, property));
      }
    }
    return completions;
  },
  buildPropertyValueCompletion: function(value, propertyName) {
    return {
      type: 'value',
      text: value + ";",
      displayText: value,
      description: value + " value for the " + propertyName + " property",
      descriptionMoreURL: cssDocsURL + "/" + propertyName + "#Values"
    };
  },
  getPropertyNamePrefix: function(bufferPosition, editor) {
    var line, ref;
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    return (ref = propertyNamePrefixPattern.exec(line)) != null ? ref[0] : void 0;
  },
  getPropertyNameCompletions: function(arg) {
    var bufferPosition, completions, editor, options, prefix, property, ref;
    bufferPosition = arg.bufferPosition, editor = arg.editor;
    prefix = this.getPropertyNamePrefix(bufferPosition, editor);
    completions = [];
    ref = this.properties;
    for (property in ref) {
      options = ref[property];
      if (!prefix || firstCharsEqual(property, prefix)) {
        completions.push(this.buildPropertyNameCompletion(property, prefix, options));
      }
    }
    return completions;
  },
  buildPropertyNameCompletion: function(propertyName, prefix, arg) {
    var description;
    description = arg.description;
    return {
      type: 'property',
      text: propertyName + ": ",
      displayText: propertyName,
      replacementPrefix: prefix,
      description: description,
      descriptionMoreURL: cssDocsURL + "/" + propertyName
    };
  },
  getPseudoSelectorPrefix: function(editor, bufferPosition) {
    var line, ref;
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    return (ref = line.match(pesudoSelectorPrefixPattern)) != null ? ref[0] : void 0;
  },
  getPseudoSelectorCompletions: function(arg) {
    var bufferPosition, completions, editor, options, prefix, pseudoSelector, ref;
    bufferPosition = arg.bufferPosition, editor = arg.editor;
    prefix = this.getPseudoSelectorPrefix(editor, bufferPosition);
    if (!prefix) {
      return null;
    }
    completions = [];
    ref = this.pseudoSelectors;
    for (pseudoSelector in ref) {
      options = ref[pseudoSelector];
      if (firstCharsEqual(pseudoSelector, prefix)) {
        completions.push(this.buildPseudoSelectorCompletion(pseudoSelector, prefix, options));
      }
    }
    return completions;
  },
  buildPseudoSelectorCompletion: function(pseudoSelector, prefix, arg) {
    var argument, completion, description;
    argument = arg.argument, description = arg.description;
    completion = {
      type: 'pseudo-selector',
      replacementPrefix: prefix,
      description: description,
      descriptionMoreURL: cssDocsURL + "/" + pseudoSelector
    };
    if (argument != null) {
      completion.snippet = pseudoSelector + "(${1:" + argument + "})";
    } else {
      completion.text = pseudoSelector;
    }
    return completion;
  },
  getTagSelectorPrefix: function(editor, bufferPosition) {
    var line, ref;
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    return (ref = tagSelectorPrefixPattern.exec(line)) != null ? ref[2] : void 0;
  },
  getTagCompletions: function(arg) {
    var bufferPosition, completions, editor, i, len, prefix, ref, tag;
    bufferPosition = arg.bufferPosition, editor = arg.editor, prefix = arg.prefix;
    completions = [];
    if (prefix) {
      ref = this.tags;
      for (i = 0, len = ref.length; i < len; i++) {
        tag = ref[i];
        if (firstCharsEqual(tag, prefix)) {
          completions.push(this.buildTagCompletion(tag));
        }
      }
    }
    return completions;
  },
  buildTagCompletion: function(tag) {
    return {
      type: 'tag',
      text: tag,
      description: "Selector for <" + tag + "> elements"
    };
  }
};

hasScope = function(scopesArray, scope) {
  return scopesArray.indexOf(scope) !== -1;
};

firstCharsEqual = function(str1, str2) {
  return str1[0].toLowerCase() === str2[0].toLowerCase();
};
