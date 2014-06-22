require.config({
    'paths': {
        'jquery':                       'vendor/jquery',
        'ideame-google-analytics':      'libs/google-analytics',
        'widgets-image-and-text':       'widgets/image-and-text',
        'widgets-projects':             'widgets/project',
        'widgets-embed':                'widgets/embed',
        'widgets-ohlala':               'widgets/ohlala'
    }
});

require(['ideame'], function (ideame) {
    'use strict';

    ideame.init();
});
