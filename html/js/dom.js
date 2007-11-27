/**
 *
 */
if (typeof window.Decafbad=='undefined') 
    window.Decafbad = {};

/**
 *
 */
Decafbad.DOM = (function() {
    var $D = YAHOO.util.Dom;
    return {

        // Tags for which DOM builder functions will be created.
        TAGS: [
            "BUTTON", "TT", "PRE", "H1", "H2", "H3", "BR", "CANVAS", "HR",
            "LABEL", "TEXTAREA", "FORM", "STRONG", "SELECT", "OPTION",
            "OPTGROUP", "LEGEND", "FIELDSET", "P", "UL", "OL", "LI", "DL",
            "DT", "DD", "TD", "TR", "THEAD", "TBODY", "TFOOT", "TABLE", "TH",
            "INPUT", "SPAN", "A", "DIV", "IMG", "EMBED", "PARAM"
        ],

        /**
         * 
         */
        init: function() {
            YAHOO.log("DOM init", "debug");

            forEach(this.TAGS, function(tag) {
                window[tag] = this.createDOMFunc(tag.toLowerCase());
            }, this);

            return this;
        },

        /**
         * Create a partially completed function call for a custom DOM element creator.
         */
        createDOMFunc: function(name) {
            var _this = this;
            return function() {
                var args = [name];
                for (var i=0; i<arguments.length; i++)
                    args.push(arguments[i]);
                return _this.createDOM.apply(_this, args);
            };
        },

        /**
         * DOM builder method stolen roughly from MochiKit.
         */
        createDOM: function(name, attrs/*, nodes... */) {
            var elem;

            // If the 'attrs' parameter seems not to be attributes, treat as node value.
            if (typeof(attrs) == 'string' || typeof(attrs) == 'number') {
                var args = [name, null, attrs];
                for (var i=2; i<arguments.length; i++) 
                    args.push(arguments[i]);
                return this.createDOM.apply(this, args);
            }

            if (typeof(name) == 'string') {
                // Internet Explorer is dumb
                if (attrs && YAHOO.env.ua.ie) {
                    // http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/name_2.asp
                    var contents = "";
                    if ('name' in attrs)
                        contents += ' name="' + this.escapeHTML(attrs.name) + '"';
                    if (name == 'input' && 'type' in attrs) 
                        contents += ' type="' + this.escapeHTML(attrs.type) + '"';
                    if (contents) 
                        name = "<" + name + contents + ">";
                }
                elem = this.createElement(name);
            } else {
                elem = name;
            }

            if (attrs) {
                for (var k in attrs) {
                    if (!YAHOO.lang.hasOwnProperty(attrs,k)) continue;
                    v = attrs[k];
                    // TODO: This doesn't cover style or on* attributes.
                    elem.setAttribute(k,v);
                }
            }

            if (arguments.length > 2) {
                var nodes = [];
                for (var i=2; i<arguments.length; i++) 
                    nodes.push(arguments[i]);
                this.appendChildNodes(elem, nodes);
            }
            return elem;

        },

        /**
         * Given a list of DOM nodes and other things, attempt to add all items
         * as nodes as children.
         */
        appendChildNodes: function(elem, nodes) {
            for (var i=0,node=null; node=nodes[i]; i++) {
                if (typeof node == 'object') { 
                    if (typeof node.nodeType != 'undefined') {
                        elem.appendChild(node);
                    } else if (node.length) {
                        this.appendChildNodes(elem, node);
                    }
                } else {
                    elem.appendChild(document.createTextNode(''+node));
                }
            }
        },

        /**
         * Escape some significant HTML characters.
         */
        escapeHTML: function (s) {
            return s.replace(/&/g, "&amp;"
                ).replace(/"/g, "&quot;"
                ).replace(/</g, "&lt;"
                ).replace(/>/g, "&gt;");
        },
        
        /**
         * Create a DOM element in the way appropriate for XHTML or HTML.
         */
        createElement: function(element) {
            if (typeof document.createElementNS != 'undefined') {
                rv = function(element) {
                    return document.createElementNS('http://www.w3.org/1999/xhtml', element);
                }
            } else {
                rv = function(element) { 
                    return document.createElement(element) 
                }
            }
            this.createElement = rv;
            return rv(element);
        },

        EOF:null
    };
})().init();
