module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib');

  grunt.initConfig({

    qunit: {
      files: [
          'test/index.html',
          'test/distribution.html'
      ]
    },

    jshint: {
      files: ['src/**/*.js'],
      options: {
        multistr: true
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'qunit']);

};
