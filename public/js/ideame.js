define('ideame', function(require) {
    'use strict';

    var $ = require('jquery');

    var widgets = {
        'widgets-image-and-text': require('widgets-image-and-text'),
        'widgets-projects': require('widgets-projects'),
        'widgets-ohlala': require('widgets-ohlala'),
        'embed-project': require('widgets-embed')
    };

    var init = function () {
        $(document).ready(function() {
            var lang = $('body').attr('data-current-lang');
            var viewName = $('body').attr('data-view-name');
            var customWidgetName = $('body').attr('data-custom-widget-name');

            if (widgets[viewName]) {
                widgets[viewName].init();
            }

            if (widgets[customWidgetName]) {
                widgets[customWidgetName].init();
            }
        });
    };

    return { init: init };
});
