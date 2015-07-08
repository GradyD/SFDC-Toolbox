fuzzaldrin  = require 'fuzzaldrin'
apex        = require './apex.json'
vf          = require './vf.json'
_           = require 'underscore-plus'

# provides code assist for standard Apex Classes
#
# e.g. when user types "S", String, StringException, Site, Set, System, Sobject, etc. are showing in suggestions
class ApexProvider
  id: 'mavensmate-apexprovider'
  selector: '.source.apex'
  apexClasses: null

  constructor: ->
    apexClasses = []
    apexNamespaces = apex.publicDeclarations
    _.each _.keys(apexNamespaces), (ns) ->
      _.each _.keys(apexNamespaces[ns]), (cls) ->
        apexClasses.push cls
    @apexClasses = apexClasses

  requestHandler: (options) ->
    suggestions = []
    words = fuzzaldrin.filter @apexClasses, options.prefix
    for word in words
      suggestion =
        prefix: options.prefix
        word: word
        label: 'Apex'
      suggestions.push(suggestion)
    return suggestions
  

  # # provides code assist for standard/custom Apex Class methods
  # #
  # # e.g. when user types "s.", if s represents a String, user is shown a list of String instance methods
  # ApexContextProvider: class ApexContextProvider extends Provider
  #   wordRegex: /\b\w*[a-zA-Z_]\w*\b./g
  #   buildSuggestions: ->
  #     selection = @editor.getSelection()
  #     # console.log selection
  #     prefix = @prefixOfSelection selection
  #     prefix = prefix.replace /./, ''
  #     # console.log 'prefix!'
  #     # console.log prefix
  #     #@editor.
      
  #     cursorPosition = @editor.getCursorBufferPosition() #=> returns a point
  #     cachedBufferText = @editor.getBuffer().cachedText #=> returns the CURRENT buffer
  #     # console.log cachedBufferText
  #     if prefix == '.'
  #       params =
  #         args:
  #           operation: 'get_apex_class_completions'
  #           pane: atom.workspace.getActivePane()
  #           offline: true
  #         payload:
  #           point: [cursorPosition.row, cursorPosition.column]
  #           buffer: cachedBufferText
  #           #file_name: util.activeFile()
  #       mm.run(params).then (result) =>
  #         # console.log result
  #         # TODO: waiting on: https://github.com/saschagehlich/autocomplete-plus/pull/99
  #         suggestions = []
  #         for s in result.body
  #           suggestions.push new Suggestion(this, word: s.name, label: "@"+s.name, prefix: prefix)
  #         console.log suggestions
  #         return suggestions


# provides code assist for visualforce tags
#
# e.g. when user types "<", list of vf tags is presented

class VisualforceTagProvider
  id: 'mavensmate-vfprovider'
  selector: '.visualforce'
  vfTags: null

  constructor: ->
    @vfTags = vf.tags
   
  requestHandler: (options) ->
    suggestions = []
    words = fuzzaldrin.filter @vfTags, options.prefix
    for word in words
      suggestion =
        prefix: options.prefix
        word: word
        label: 'Visualforce'
      suggestions.push(suggestion)
    return suggestions
      
  # # provides code assist for visualforce tags
  # #
  # # e.g. when user types "<", list of vf tags is presented
  # VisualforceTagContextProvider: class VisualforceTagContextProvider extends Provider
  #   wordRegex: /<apex:[a-z]*\b/gi
  #   # exclusive: true
    
  #   vfTags: []

  #   initialize: ->
  #     @vfTags = vf.tags

  #   buildSuggestions: ->
  #     console.log 'building suggestions for vf tag context ...'
  #     selection = @editor.getSelection()
  #     console.log selection
  #     prefix = @prefixOfSelection selection
  #     console.log '----'
  #     console.log prefix
  #     return unless prefix.length

  #     suggestions = @findSuggestionsForPrefix prefix
  #     return unless suggestions.length
  #     return suggestions

  #   findSuggestionsForPrefix: (prefix) ->
  #     # Filter the words using fuzzaldrin
  #     prefix = prefix.replace '<', ''
  #     words = fuzzaldrin.filter @vfTags, prefix

  #     # Builds suggestions for the words
  #     suggestions = for word in words
  #       new Suggestion this, word: word, prefix: prefix, label: "@#{word} (Visualforce)"
  #     return suggestions

  # # provides list of Sobjects available in the source org
  # #
  # # e.g. when user types "O" list of options may include Opportunity, OpportunityLineItem, OpportunityContactRole, etc.
  # SobjectProvider: class SobjectProvider extends Provider
  #   wordRegex: /[A-Z].*/g
  #   sobjects: ["Account", "Contact", "Opportunity"] #todo: populate sobjects

  #   buildSuggestions: ->
  #     selection = @editor.getSelection()
  #     prefix = @prefixOfSelection selection
  #     return unless prefix.length

  #     suggestions = @findSuggestionsForPrefix prefix
  #     return unless suggestions.length
  #     return suggestions

  #   findSuggestionsForPrefix: (prefix) ->
  #       # Filter the words using fuzzaldrin
  #       words = fuzzaldrin.filter @sobjects, prefix

  #       # console.log words

  #       # Builds suggestions for the words
  #       suggestions = for word in words
  #         new Suggestion this, word: word, prefix: prefix, label: "@#{word} (Sobject)"

  #       return suggestions

module.exports.ApexProvider = ApexProvider
module.exports.VisualforceTagProvider = VisualforceTagProvider