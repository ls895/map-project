module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      dist: {
        files: {
          'dist/js/api.min.js': 'src/js/api.js',
          'dist/js/app.min.js': 'src/js/app.js'
        }
      }
    },
    cssmin: {
      dist: {
        files: {
          'dist/css/style.min.css': 'src/css/style.css'
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'dist/index.html': ['src/index.html']
        }
      },
    },
    copy: {
      dist: {
        files: {
          'dist/js/jquery.ui.touch-punch.min.js': 'src/js/jquery.ui.touch-punch.min.js',
          'dist/js/ko-calendar.min.js': 'src/js/ko-calendar.min.js',
          'dist/css/ko-calendar.min.css': 'src/css/ko-calendar.min.css'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['uglify', 'cssmin', 'copy', 'processhtml']);
};