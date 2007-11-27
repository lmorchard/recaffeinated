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
            this.injectVideoPlayers();

        },

        /**
         * Perform initialization after page load completed.
         */
        onLoad: function () {

        },

        /**
         * Find video entries in the page and inject video players where appropriate.
         */
        injectVideoPlayers: function() {
            YAHOO.log("Injecting video players...");
            var entries = $D.getElementsByClassName('entry-video', 'li', 'bd');
            forEach(entries, function(entry) {
                
                var content = $D.getElementsByClassName('entry-content', '*', entry)[0];
                var title   = $D.getElementsByClassName('entry-title', '*', entry)[0];
                var link    = title.getElementsByTagName('a')[0];
                var href    = link.href;

                if (/youtube.com/.test(href)) {

                    YAHOO.log("Found YouTube video at "+href);
                    var vid = this.parseQueryString(href)['v'];
                    var new_div = DIV();
                    content.appendChild(new_div);
                    new_div.innerHTML = '<object width="425" height="355"><param name="movie" value="http://www.youtube.com/v/'+encodeURIComponent(vid)+'&rel=1"></param><param name="wmode" value="transparent"></param><embed src="http://www.youtube.com/v/'+encodeURIComponent(vid)+'&rel=1" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355"></embed></object>'

                } else if (/(mpg|mov)$/.test(href)) {

                    YAHOO.log("Found QT video at "+href);
                    var new_div = DIV();
                    content.appendChild(new_div);
                    new_div.innerHTML = '<OBJECT classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" width="455" height="355" codebase="http://www.apple.com/qtactivex/qtplugin.cab"><param name="src" value="'+href+'"><param name="autoplay" value="true"><param name="controller" value="true"><param name="loop" value="true"><EMBED src="'+href+'" width="455" height="355" autoplay="true" controller="true" loop="true" pluginspage="http://www.apple.com/quicktime/download/"></EMBED></OBJECT>';

                }

                // TODO: Google video, Yahoo! video, etal

            }, this);
        },

        /**
         * Find permalinks in the page and inject HaloScan comment links.
         */
        injectHaloscanCommentLinks: function() {
            YAHOO.log("Injecting Haloscan comment links...");
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

        /**
         * Accept a URL or query string and return a hash of query string vars.
         * see: http://www.safalra.com/web-design/javascript/parsing-query-strings/
         */
        parseQueryString: function(queryString) {

            // define an object to contain the parsed query data
            var result = {};

            // if a query string wasn't specified, use the query string from the URI
            if (queryString == undefined){
                queryString = location.search ? location.search : '';
            } else if (queryString.indexOf('?') != -1) {
                queryString = queryString.substring(queryString.indexOf('?') + 1);
            }

            // remove the leading question mark from the query string if it is present
            if (queryString.charAt(0) == '?') queryString = queryString.substring(1);

            // replace plus signs in the query string with spaces
            queryString = queryString.replace('+', ' ');

            // split the query string around ampersands and semicolons
            var queryComponents = queryString.split(/[&;]/g);

            // loop over the query string components
            for (var i = 0; i < queryComponents.length; i++){

                // extract this component's key-value pair
                var keyValuePair = queryComponents[i].split('=');
                var key = decodeURIComponent(keyValuePair[0]);
                var value = decodeURIComponent(keyValuePair[1]);

                // update the parsed query data with this component's key-value pair
                if (!result[key]) result[key] = [];
                result[key].push((keyValuePair.length == 1) ? '' : value);

            }

            // return the parsed query data
            return result;

        },

        EOF:null
    };

})().init();
