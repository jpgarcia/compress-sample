define('widgets-image-and-text', function (require) {
    'use strict';

    var $ = require('jquery')
        , GoogleAnalytics = require('ideame-google-analytics');

    var ga;

    var init = function () {
        ga = new GoogleAnalytics();

        var container = document.getElementById('_widgetContainer');

        var name = container.getAttribute("data-widget-name");
        var type = container.getAttribute("data-widget-type");
        var campaignName = container.getAttribute("data-campaign-name");
        var campaignMedium = container.getAttribute("data-campaign-medium");
        var campaignSource = container.getAttribute("data-campaign-source");
        var urlToRedirect = container.getAttribute("data-url-to-redirect");
        var extraParameters = "utm_source=" + campaignSource + "&utm_medium=" + campaignMedium + "&utm_campaign=" + campaignName;

        ga.track('Widgets', 'Impression', name + ' - ' + campaignName);

        if (type === 'PROJECT') {
            var projectId = container.getAttribute("data-project-id");
            var projectTitle = container.getAttribute("data-project-title");

            //TODO: get appropiate project url from configuration
            urlToRedirect = 'http://idea.me/proyecto/' + projectId  + '/' + encodeURIComponent(projectTitle);
        }

        urlToRedirect += ((/\?/.test(urlToRedirect)) ? '&' : '?') + extraParameters;

        container.onclick = function () {
            window.open(urlToRedirect);
            ga.track('Widgets', 'Click', name + ' - ' + campaignName);
            return false;
        };
    };

    return { init: init };
});
