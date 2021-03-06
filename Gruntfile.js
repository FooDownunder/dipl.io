'use strict';

module.exports = function(grunt) {
    // Load all grunt tasks.
    require('jit-grunt')(grunt, {
        ngconstant: 'grunt-ng-constant',
        useminPrepare: 'grunt-usemin',
        ngtemplates: 'grunt-angular-templates',
        replace: 'grunt-text-replace'
    });
    grunt.loadNpmTasks('grunt-git');

    grunt.initConfig({
        seekrits: grunt.file.exists('seekrits.json')
            ? grunt.file.readJSON('seekrits.json')
            : grunt.file.readJSON('seekrits.default.json'),
        pkg: grunt.file.readJSON('package.json'),

        lodash: {
            dist: {
                dest: 'client/temp/lodash.dist.js',
                options: {
                    exports: ['amd']
                }
            }
        },
        lodashAutobuild: {
            app: {
                src: ['client/app/**/*.js'],
                options: {
                    lodashConfigPath: 'lodash.dist.options.include',
                    lodashObjects: ['_'],
                    lodashTargets: ['dist']
                }
            }
        },
        open: {
            server: {
                url: 'https://localhost/main/home'
            }
        },
        watch: {
            options: {
                livereload: {
                    host: 'localhost',
                    cert: grunt.file.read('dev_certs/server/server.crt'),
                    key: grunt.file.read('dev_certs/server/server.key')
                }
            },
            css: {
                files: 'client/app/**/*.scss',
                tasks: ['sass']
            },
            angular: {
                files: [
                    'client/index.html',
                    'client/app/**/*.js',
                    'client/app/**/*.html'
                ],
                options: {
                    spawn: false
                }
            }
        },
        ngconstant: {
            options: {
                name: 'diplomacy.constants',
                dest: 'client/temp/constants.js'
            },
            dev: {
                constants: {
                    CONST: {
                        domain: 'https://localhost',
                        diplicityEndpoint: 'https://localhost:3000'
                    }
                }
            },
            prod: {
                constants: {
                    CONST: {
                        domain: 'https://dipl.io',
                        diplicityEndpoint: 'https://diplicity-engine.appspot.com'
                    }
                }
            }
        },
        preprocess: {
            prod: {
                src: 'dist/client/index.html',
                options: {
                    inline: true,
                    context: {
                        NODE_ENV: 'production'
                    }
                }
            }
        },
        eslint: {
            options: {
            },
            target: [
                'client/**/*.js',
                '!client/temp/*.js'
            ]
        },
        modernizr: {
            prod: {
                uglify: false, // Let other processes uglify this.
                dest: 'client/temp/modernizr.js',
                files: {
                    src: ['client/app/**/*.{js,css,scss}']
                }
            }
        },
        clean: {
            before: {
                src: ['.tmp', 'temp', 'dist']
            },
            after: {
                src: ['.tmp']
            }
        },
        useminPrepare: {
            html: 'client/index.html',
            options: {
                dest: 'dist/client',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        }
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration.
        usemin: {
            html: ['dist/{,*/}*.html'],
            css: ['dist/styles/{,*/}*.css'],
            options: {
                assetsDirs: [
                    'dist',
                    'dist/assets'
                ]
            }
        },
        sass: {
            server: {
                options: {
                    loadPath: [
                        'node_modules',
                        'client/app'
                    ],
                    compass: false
                },
                files: {
                    'client/temp/app.css': 'client/app/app.scss'
                }
            }
        },
        cssmin: {
            css: {
                src: 'client/temp/app.css',
                dest: 'dist/client/app.min.css'
            }
        },
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat',
                    src: '*.js',
                    dest: '.tmp/concat'
                }]
            }
        },
        ngtemplates: {
            options: {
                module: 'diplomacy',
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    removeComments: true
                }
            },
            main: {
                cwd: 'client',
                src: ['{app,components}/**/*.html'],
                dest: '.tmp/templates.js'
            }
        },
        replace: {
            footer: {
                src: ['dist/client/*.html'],
                overwrite: true,
                replacements: [{
                    from: '{{VERSION}}',
                    to: '<%= pkg.version %>'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'client',
                    dest: 'dist/client',
                    src: ['index.html', 'assets/**']
                }, {
                    expand: true,
                    dest: 'dist/',
                    src: [
                        'variants/**/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/concat',
                    dest: 'dist/client',
                    src: ['*']
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: 'dist/client',
                    src: ['*.html'],
                    dest: 'dist/client'
                }]
            }
        },
        wiredep: {
            target: {
                src: 'index.html',
                ignorePath: 'client'
            }
        },
        concat: {
            templates: {
                src: ['.tmp/concat/app.min.js', '.tmp/templates.js'],
                dest: '.tmp/concat/app.min.js'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        release: {
            changelog: false,
            github: {
                repo: 'spamguy/dipl.io'
            },
            additionalFiles: ['bower.json']
        },
        rsync: {
            dist: {
                options: {
                    src: '<%= seekrits.sourcePath %>',
                    dest: '<%= seekrits.destPath %>',
                    host: '<%= seekrits.host %>',
                    recursive: true,
                    args: ['-av']
                }
            }
        }
    });

    grunt.registerTask('sauce-connect', 'Launch Sauce Connect', function() {
        var done = this.async();
        require('sauce-connect-launcher')({
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY
        }, function(err, sauceConnectProcess) {
            if (err)
                console.error(err.message);
            else
                done();
        });
    });

    grunt.registerTask('build', [
        'eslint',
        'test',
        'lodashAutobuild',
        'ngconstant:prod',
        'clean:before',
        'copy:dist',
        'preprocess:prod',
        'useminPrepare',
        'ngtemplates',
        'concat:generated',
        'concat:templates',
        'ngAnnotate',
        'sass',
        'usemin',
        'htmlmin',
        'cssmin',
        'replace:footer',
        'uglify',
        'clean:after'
    ]);

    /*
     * Present in 'test' and not needed in 'serve' and/or 'build':
     * - modernizr:prod
     * - sass
     * - wiredep
    */
    grunt.registerTask('serve', [
        'eslint',
        'ngconstant:dev',
        'test',
        'open',
        'watch'
    ]);
    grunt.registerTask('test', [
        'ngconstant:dev',
        'modernizr:prod',
        'sass',
        'karma'
    ]);
    grunt.registerTask('test:protractor-travis', [
        'ngconstant:mock',
        'karma',
        'sauce-connect',
        'protractor:travis'
    ]);
    grunt.registerTask('deploy', [
        'release',
        'build',
        'rsync:dist'
    ]);
};
