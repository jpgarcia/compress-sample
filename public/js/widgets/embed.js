define('widgets-embed', function (require) {
    'use strict';

    var $ = require('jquery')
        , GoogleAnalytics = require('ideame-google-analytics');

    var init = function () {
        ga = new GoogleAnalytics();

        var id = $('#info').data('project-id');
        var slug = $('#info').data('slug');

        ga.track('Widgets', 'Impression', 'project-' + slug, id);

        $(".project-box").click(function (e) {
            e.preventDefault();

            ga.track('Widgets', 'Click', 'project-' + slug, id);

            if ($(e.target).get(0).tagName == "A") {
                window.open($(e.target).attr('href'));
            } else {
                window.open($(e.currentTarget).find('.project-content a').attr('href'));
            }
        });

    };

    return { init: init };
});
