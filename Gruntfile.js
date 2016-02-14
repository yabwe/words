
module.exports = function(grunt) {
	var globalConfig = {
			src: 'src',
			dest: 'dev'
		},
		gruntConfig = {
			pkg: grunt.file.readJSON('package.json'),
			globalConfig: globalConfig
		};

	grunt.loadNpmTasks('grunt-browserify');
	gruntConfig.browserify = {
		dist: {
			files: {
				'build/<%=pkg.name%>.js' : 'src/js/words.js'
			}
		}
	};

	grunt.loadNpmTasks('grunt-contrib-concat');
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

	grunt.loadNpmTasks('grunt-mocha-test');
	gruntConfig.mochaTest = {
		test: {
			options: {
				reporter: 'spec'
			},
			src: ['test/**/*.js']
		}
	};

	grunt.loadNpmTasks('grunt-mocha-istanbul');
	gruntConfig.mocha_istanbul = {
		coverage: {
			src: ['test/**/*.js'],
			options: {
				reporter: 'spec',
				mask: '*.spec.js'
			}
		}
	};

	grunt.initConfig(gruntConfig);

	/*grunt.event.on('coverage', function (lcovFileContents, done) {
		done();
	});*/

	grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
	grunt.registerTask('build', ['browserify', 'concat']);
	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('default', ['test', 'build']);
}