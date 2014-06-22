define('ideame-google-analytics', function(require) {
    'use strict';

    var $ = require('jquery');

    /**************************CONSTRUCTOR*************************************/
    var GoogleAnalytics = function() {};

    GoogleAnalytics.prototype.track = function(category, action, label, value) {
        try {
            window.ga('send', 'event', category, action, label, value, {'nonInteraction': 1});
        } catch(e) {}
    };

    GoogleAnalytics.prototype.trackTrans = function(pledgeId, projectTitle, rewardId, rewardName, amount, shippingAmount, paymentMethod) {
        try {
            // optional Tax param => 'tax': '1.29'
            window.ga('ecommerce:addTransaction', {
                id: pledgeId,                // Transaction ID. Required
                affiliation: projectTitle,   // Affiliation or store name
                revenue: amount,             // Grand Total
                shipping: shippingAmount     // Shipping
            });


            window.ga('ecommerce:addItem', {
                id: pledgeId,                // Transaction ID. Required
                name: rewardName,            // Product name. Required
                sku: rewardId,               // SKU/code
                category: paymentMethod,     // Category or variation
                price: amount,               // Unit price
                quantity: '1'                // Quantity
            });

            window.ga('ecommerce:send');
        } catch(e) {}
    };

    GoogleAnalytics.prototype.setDimension = function(name, value) {
        try {

            var nameMatch = {
                'ExperimentGroupAB': 'dimension1',      // visitor-level
                'ExperimentGroupABC': 'dimension2',     // visitor-level
                'Group': 'dimension3'                   // hit (page-level)
            };

            window.ga('set', nameMatch[name], value);
        } catch(e) {}
    };

    return GoogleAnalytics;
});
