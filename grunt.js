/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:defer.jquery.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
        dest: 'dist/jquery.<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/jquery.<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      urls: {
        src: '1.5,1.6,1.7,1.8.0,1.9.0,git'.split(',').map(function(v) { 
          return 'http://localhost:9001/test/defer.html?jquery=' + v; 
        })
      }
    },
    server: {
      port: 9001,
      base: '.'
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    },
    uglify: {}
  });

  // Default task.
// grunt.registerMultiTask('qunit', 'tun all jasmine tests')//, function () {
  //   grunt.log.writeln('asfsa');
  //       for (var key in this.data) {
  //           grunt.log.writeln(key + ': ' + this.data[key]);
  //       }
  //      //grunt.task.run('jasmines', 'jasmine');
   
  // });

  // Default task.
  grunt.registerTask('test', 'server qunit');
  grunt.registerTask('default', 'lint server qunit concat min');
  grunt.registerTask('build', 'concat min');

};
