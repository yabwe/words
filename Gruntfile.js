
module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-browserify');

	var globalConfig = {
			src: 'src',
			dest: 'dev'
		},
		gruntConfig = {
			pkg: grunt.file.readJSON('package.json'),
			globalConfig: globalConfig
		};

	gruntConfig.browserify = {
		dist: {
			files: {
				'build/<%=pkg.name%>.js' : 'src/js/words.js'
			}
		}
	};

	gruntConfig.concat = {
		options: {
			stripBanners: true
		},
		dist: {
			files: {
				'dist/<%=pkg.name%>.js': 'build/<%=pkg.name%>.js'
			}
		}
	};

	gruntConfig.mochaTest = {
		test: {
			options: {
				reporter: 'spec'
			},
			src: ['test/**/*.js']
		}
	}

	grunt.initConfig(gruntConfig);

	grunt.registerTask('build', ['browserify', 'concat']);
	grunt.registerTask('test', ['build', 'mochaTest']);
	grunt.registerTask('default', ['test']);
}