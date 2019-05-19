module.exports = function(grunt) {

    grunt.initConfig({
        less: {
            files: {
                'build/client/less/main.css': 'src/client/less/main.less'
            }
        },

        copy: {
            statics: {
                files: [
                    {expand: true, src: 'src/client/**', dest: 'build/client'}
                ]
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
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
}
