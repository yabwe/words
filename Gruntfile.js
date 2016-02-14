
module.exports = function(grunt) {
	var gruntConfig = {
			pkg: grunt.file.readJSON('package.json'),
			srcJsDir: 'src/js',
			distDir: 'dist',
			testDir: 'test'
		};

	grunt.loadNpmTasks('grunt-browserify');
	gruntConfig.browserify = {
		dist: {
			files: {
				'<%= distDir %>/<%=pkg.name%>.js' : '<%= srcJsDir %>/<%= pkg.name %>.js'
			}
		}
	};

	grunt.loadNpmTasks('grunt-mocha-test');
	gruntConfig.mochaTest = {
		test: {
			src: ['<%= testDir%>/**/*.js'],
			options: {
				reporter: 'spec'
			}
		}
	};

	grunt.loadNpmTasks('grunt-mocha-istanbul');
	gruntConfig.mocha_istanbul = {
		coverage: {
			src: ['<%= testDir %>/**/*.js'],
			options: {
				reporter: 'spec'
			}
		}
	};

	grunt.initConfig(gruntConfig);

	grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
	grunt.registerTask('build', ['browserify']);
	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('default', ['test', 'build']);
}