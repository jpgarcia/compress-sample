var fs = require('fs')
    , util = require('util')
    , path = require('path')
    , _ = require('underscore');

module.exports = function(grunt) {
    require('time-grunt')(grunt);

    var branch = process.env.BRANCH;
    var buildNumber = process.env.BUILD_NUMBER;
    var environment = 'production';
    var herokuAppName = 'ideame-widgets';
    var staticBucketName = 'ideame-assets';
    var staticFolderName = 'widgets';
    var amazonApiKey = process.env.AMAZON_API_KEY;
    var amazonApiSecret = process.env.AMAZON_API_SECRET;

    switch (branch) {
        case 'master':
            break;
        case 'develop':
            environment = 'staging';
            herokuAppName += '-staging';
            staticBucketName = 'ideame-assets';
            staticFolderName = 'widgets-staging';
            break;
        default:
            environment = 'test';
            herokuAppName += '-test';
            staticBucketName = 'ideame-assets-test';
            staticFolderName = 'widgets';
            amazonApiKey = process.env.AMAZON_API_KEY_TEST;
            amazonApiSecret = process.env.AMAZON_API_SECRET_TEST;
    }

    grunt.initConfig({
        clean: {
            dist: [ 'dist' ],
            afterBundlingDist: [ 'dist/css/**/*.css', 'dist/js/**/*.js', 'dist/js/**/*.css', 'dist/vendor/**/*.js', 'dist/vendor/**/*.css' ],
            deploy: [ 'deploy' ],
            assets: [ 'assets' ]
        },
        env: {
            dev: {
                NODE_ENV: 'development'
            },
            test: {
                NODE_ENV: 'test'
            }
        },
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    ignore: [ 'README.md', 'node_modules/**', 'public/**', 'core/static/**', '**/*.ejs' ],
                    watch: [ 'app' ],
                    delay: 1,
                    legacyWatch: true,
                    env: {
                        PORT: 5000
                    },
                    cwd: __dirname
                }
            }
        },
        jshint: {
            server: {
                options: {
                    force: true,
                    indent: 4,
                    laxcomma: true,
                    multistr: true,
                    white: false,
                    sub: true,
                    ignores: [ './app/core/static/**/*.js' ],
                    reporter: 'jslint',
                    reporterOutput: 'assets/jshint-server.xml'
                },
                src: [ './*.js', './app/**/*.js' ],
            },
            client: {
                options: {
                    browser: true,
                    force: true,
                    indent: 4,
                    laxcomma: true,
                    multistr: true,
                    white: false,
                    sub: true,
                    ignores: [ './**/vendor/**/*.js' ],
                    reporter: 'jslint',
                    reporterOutput: 'assets/jshint-client.xml'
                },
                src: [ './public/**/*.js' ]
            },
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'dot',
                    globals: [ 'APP', 'accessKeyId', 'secretAccessKey' ]
                },
                src: ['app/test/**/*.js', 'app/core/node/test/**/*.js']
            },
            xunit: {
                options: {
                    reporter: 'xunit',
                    globals: [ 'APP', 'accessKeyId', 'secretAccessKey' ],
                    captureFile: 'shippable/testresults/xunit.xml'
                },
                src: [ 'app/test/**/*.js', 'app/core/node/test/**/*.js' ]
            },
            coverage: {
                options: {
                    require: 'blanket',
                    reporter: 'html-cov',
                    globals: [ 'APP', 'accessKeyId', 'secretAccessKey' ],
                    quiet: true,
                    captureFile: 'coverage.html'
                },
                src: [ 'app/test/**/*.js', 'app/core/node/test/**/*.js' ]
            }
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
            },
            deploy: {
                files: [{
                    expand: true,
                    cwd: 'app/',
                    src: '**',
                    dest: 'deploy/app/',
                    filter: function (filePath) {
                        // Exclussions
                        if (/app\/test/.test(filePath)) { return false; }
                        if (/app\/core\/static/.test(filePath)) { return false; }
                        if (/app\/core\/db/.test(filePath)) { return false; }
                        if (/app\/core\/node\/test/.test(filePath)) { return false; }

                        return true;
                    }
                }, {
                    expand: true,
                    cwd: './',
                    src: '*',
                    dest: 'deploy/',
                    filter: 'isFile'
                }]
            }
        },
        stylus: {
            compile: {
                files: [{
                    expand: true,
                    cwd: 'dist/css/',
                    src: ['**/*.styl'],
                    dest: 'dist/css/',
                    ext: '.css',
                }]
            }
        },
        cssUrls: {
            dist: {
                src: 'dist/main.css'
            }
        },
        cssmin: {
            combine: {
                options: {
                    keepSpecialComments: 0
                },
                files: {
                    'dist/main.css': function () {
                        var content = grunt.file.read('./public/main.css').toString();
                        var files = [];

                        content.replace(/@import\s+'([^']+)/gim, function (match, location, a) {
                            files.push(path.resolve('./dist/' + location).replace(process.cwd() + '/', ''));
                        });

                        return files;
                    }()
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'dist/js',
                    include: [ 'main' ],
                    optimize: 'uglify2',
                    almond: true,
                    mainConfigFile: [ 'dist/js/main.js' ],
                    out: 'dist/idm.js',
                    wrap: function() {
                        return true;
                    },
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    useSourceUrl: true
                }
            }
        },
        revmd5: {
            options: {
                relativePath: 'dist/',
                safe: true
            },
            dist: {
                src: ['dist/main.css', 'deploy/app/views/**/*.ejs']
            }
        },
        cdn: {
            options: {
                cdn: util.format('http://%s.s3.amazonaws.com/%s/', staticBucketName, staticFolderName)
            },
            dist: {
                src: ['dist/main.css', 'deploy/app/views/**/*.ejs']
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
        },
        aws_s3: {
            options: {
                accessKeyId: amazonApiKey,
                secretAccessKey: amazonApiSecret,
                uploadConcurrency: 5,
                downloadConcurrency: 5
            },
            dist: {
                options: {
                    bucket: staticBucketName
                },
                files: [
                    { expand: true, cwd: 'dist/', src: ['**', '!**/*.js', '!**/*.css' ], dest: staticFolderName }
                ]
            },
            distJsAndCss: {
                options: {
                    bucket: staticBucketName,
                    params: {
                        'ContentEncoding': 'gzip',
                        'CacheControl': 'max-age=630720000, public',
                        'Expires': new Date(Date.now() + 63072000000)
                    }
                },
                files: [
                    { expand: true, cwd: 'dist/', src: [ '**/*.js', '**/*.css' ], dest: staticFolderName }
                ]
            }
        },
        gitInitAndDeploy: {
            dist: {
                options: {
                    repository: 'git@heroku.com:' + herokuAppName + '.git',
                    message: util.format('deployment for build.v%s-%s', buildNumber, environment)
                },
                src: 'deploy'
            }
        },
    });

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-css-urls');
    grunt.loadNpmTasks('grunt-cdn');
    grunt.loadNpmTasks('grunt-rev-md5');
    grunt.loadNpmTasks('grunt-git-init-and-deploy');
    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.registerTask('default',   [ 'env:dev', 'nodemon:dev' ]);
    grunt.registerTask('jsh',       [ 'jshint' ]);
    grunt.registerTask('test',      [ 'env:test', 'mochaTest:test' ]);
    grunt.registerTask('testd',     [ 'env:dev', 'mochaTest:test' ]);
    grunt.registerTask('testBuild', [ 'env:test', 'mochaTest:xunit' ]);
    grunt.registerTask('coverage',  [ 'env:test', 'mochaTest:coverage' ]);

    grunt.registerTask('cleanup', [ 'clean:assets', 'clean:dist', 'clean:deploy' ]);

    grunt.registerTask('release', [
        'clean:assets',
        'jshint',
        'testBuild',
        'clean:dist',
        'clean:deploy',
        'copy:dist',
        'copy:deploy',
        'stylus',
        'cssUrls',
        'cssmin',
        'requirejs',
        'revmd5',
        'cdn',
        'clean:afterBundlingDist',
        'compress:dist',
        // 'aws_s3:dist',
        // 'aws_s3:distJsAndCss',
        // 'gitInitAndDeploy',
        'clean:dist',
        'clean:deploy'
    ]);
};
