var fs = require('fs')
    , util = require('util')
    , path = require('path')
    , _ = require('underscore');

module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            dist: [ 'dist' ],
            afterBundlingDist: [ 'dist/css/**/*.css', 'dist/js/**/*.js', 'dist/js/**/*.css', 'dist/vendor/**/*.js', 'dist/vendor/**/*.css' ]
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'public/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile'
                }, {
                    expand: true,
                    cwd: 'app/core/static/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile'
                }]
            }
        },
        compress: {
            dist: {
                options: {
                    mode: 'gzip'
                },
                files: [
                    { expand: true, cwd: 'dist/', src: [ '**/*.js' ], dest: 'dist/', ext: '.js' },
                    { expand: true, cwd: 'dist/', src: [ '**/*.css' ], dest: 'dist/', ext: '.css' }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('release', [
        'clean:dist',
        'copy:dist',
        'clean:afterBundlingDist',
        'compress:dist',
        'clean:dist'
    ]);
};
