/**
 *
 */
if (typeof window.Decafbad=='undefined') 
    window.Decafbad = {};

/**
 *
 */
Decafbad.Main = (function() {

    Function.prototype.bind = function(obj) {
        var _this = this;
        return function() { 
            return _this.apply(obj,arguments); 
        };
    }
    
    var $D  = YAHOO.util.Dom;
    var $E  = YAHOO.util.Event;
    var $EL = YAHOO.util.Element;
    var $C  = YAHOO.util.Connect;

    return {

        /** Debug mode? */
        DEBUG: false, 
        /** Enable logging to console? */
        LOGGER_CONSOLE: true,
        /** Should logger panel be collapsed on load. */
        LOGGER_COLLAPSED: true, 

        buttons: {},

        COMMENT_ICON_SRC: 'http://decafbad.com/images/icon_reaction.gif',

        COMMENT_ID_PREFIX: 'dr_',

        /**
         * Initialize the package on script load.
         */
        init: function() {

            // Turn on logger output for Firebug and friends.
            if (this.LOGGER_CONSOLE) 
                YAHOO.widget.Logger.enableBrowserConsole();
            
            YAHOO.log("Main init", "debug");
            
            $E.onDOMReady(this.onDOMReady, this, true);
            $E.on(window, 'load', this.onLoad, this, true);

            return this;
        },

        /**
         * Perform initialization on DOM availability.
         */
        onDOMReady: function() {

            // If the page is in debug mode, inject the logger panel.
            if ($D.hasClass(document.body, 'debug')) {
                this.DEBUG = true;
                this.log_reader = new YAHOO.widget.LogReader("logger");
                if (this.LOGGER_COLLAPSED) this.log_reader.collapse();
            }
            YAHOO.log("onload", "debug");

            this.injectHaloscanCommentLinks();

        },

        /**
         * Perform initialization after page load completed.
         */
        onLoad: function () {

        },

        /**
         *
         */
        injectHaloscanCommentLinks: function() {

            var permalinks = $D.getElementsByClassName('permalink','a','bd');
            forEach(permalinks, function(permalink) { 

                // Look up from the permalink for the parent entry.
                var entry = permalink;
                while ( entry && !($D.hasClass(entry, 'hentry')) )
                    entry = entry.parentNode;
                if (!entry) return;

                // Try to derive a unique ID from post permalink that is 
                // short and not nasty with URL-funk.
                var permalink_id = entry.id;
                var comment_id = this.COMMENT_ID_PREFIX + 
                    ( (''+entry.id).replace('-','_') );

                // Look up the comment count for this ID.
                var comment_count = hs[comment_id] ? hs[comment_id] : 0;

                // Build the comment link in another function, so as to preserve
                // the permalink_id and comment_count in the closure.
                var comment_link = 
                    this.buildHaloscanCommentLink(permalink_id, comment_id, comment_count);

                // Inject the comment link into the permalink parent.
                $D.insertAfter(SPAN({'class':'comments'}, ' ', comment_link), permalink);

                return true;
                
            }, this);

        },

        /**
         *
         */
        buildHaloscanCommentLink: function(permalink_id, comment_id, comment_count) {

            // Build the DOM node for a comment link.
            // HACK: is javascript:void(null) a good thing to do here? prolly not.
            var comment_link = A(
                { 
                    'class' : 'commentlink', 
                    'href'  : 'javascript:void(null)', 
                    'title' : 'comments on '+permalink_id
                },
                IMG({ 'src':this.COMMENT_ICON_SRC, 'border':0 }),
                SPAN({ 'class':'count'}, '('+comment_count+')')
            );

            // Wire up the Haloscan comment popup launcher.
            comment_link.onclick = function() { HaloScan(comment_id) } 

            return comment_link;
        },

        EOF:null
    };

})().init();
