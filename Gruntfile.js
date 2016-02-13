
module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-mocha-test');

	var globalConfig = {
			src: 'src',
			dest: 'dev'
		},
		gruntConfig = {
			pkg: grunt.file.readJSON('package.json'),
			globalConfig: globalConfig
		},
		srcFiles = [
			'src/js/util.js',
			'src/js/char.js',
			'src/js/word.js',
			'src/js/block.js',
			'src/js/document.js',
			'src/js/words.js'
			];

	gruntConfig.concat = {
		options: {
			stripBanners: true
		},
		dist: {
			src: ['src/wrappers/start.js']
				.concat(srcFiles)
				.concat(['src/wrappers/end.js']),
			dest: 'dist/js/<%= pkg.name %>.js',
			nonull: true
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

	grunt.registerTask('test', ['concat', 'mochaTest']);
	grunt.registerTask('default', ['concat']);
}