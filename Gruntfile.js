module.exports = function(grunt) {

    grunt.initConfig({
        less: {
            main: {
                files: {
                    'build/client/css/main.css': 'src/client/less/main.less'
                }
            }
        },

        copy: {
            statics: {
                files: [
                    {expand: true, cwd: 'src/client', src: ['**'], dest: 'build/client'}
                ]
            }
        },

        ts: {
            default: {
                tsconfig: 'tsconfig.json'
            }
        },

        watch: {
            less: {
                files: ['src/client/less/main.less'],
                tasks: ['less']
            },

            statics: {
                files: ['src/client/**'],
                tasks: ['copy:statics']
            },

            ts: {
                files: ['src/**/*.ts'],
                tasks: ['ts']
            }

        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['less','ts','copy:statics','watch']);
}
