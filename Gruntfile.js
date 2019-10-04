/* jshint node: true */

'use strict';

module.exports = function (grunt) {
	// Load all grunt tasks
	require('load-grunt-tasks')(grunt);
	// Show elapsed time at the end
	require('time-grunt')(grunt);

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: `/*!
 * Circle Progress - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>
 * <%= pkg.homepage %>
 * Copyright (c) <%= pkg.author.name %>
 * Licensed <%= pkg.license %>
 */`,
		// Task configuration.
		clean: {
			files: ['dist'],
		},
		babel: {
			vanilla: {
				src: 'dist/circle-progress.js',
				dest: 'dist/circle-progress.js',
			},
			jquery: {
				src: 'dist/jquery.circle-progress.js',
				dest: 'dist/jquery.circle-progress.js',
			},
			jqueryBare: {
				src: 'dist/jquery.circle-progress.bare.js',
				dest: 'dist/jquery.circle-progress.bare.js',
			},
		},
		concat: {
			options: {
				banner: '<%= banner %>\n\n\'use strict\';\n\nconst CircleProgress = (function() {\n',
				footer: 'return CircleProgress;\n}());',
				stripBanners: true,
				process: function(src) {
					return src.replace('\'use strict\';\n', '');
				},
			},
			vanilla: {
				src: ['src/innersvg.js', 'src/svgpaper.js', 'src/animator.js', 'src/circle-progress.js'],
				dest: 'dist/circle-progress.js',
			},
			jquery: {
				src: ['src/innersvg.js', 'src/svgpaper.js', 'src/animator.js', 'src/circle-progress.js', 'lib/jquery.ui.widget.js', 'src/jquery.circle-progress.js'],
				dest: 'dist/jquery.circle-progress.js',
			},
			jqueryBare: {
				src: ['src/innersvg.js', 'src/svgpaper.js', 'src/animator.js', 'src/circle-progress.js', 'src/jquery.circle-progress.js'],
				dest: 'dist/jquery.circle-progress.bare.js',
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>\n',
			},
			dist: {
				files: {
					'dist/circle-progress.js': 'dist/circle-progress.js',
					'dist/jquery.circle-progress.js': 'dist/jquery.circle-progress.js',
					'dist/jquery.circle-progress.bare.js': 'dist/jquery.circle-progress.bare.js',
				}
			}
		},
		copy: {
			dist: {
				dest: 'docs/js/circle-progress.js',
				src: 'dist/circle-progress.js',
			}
		},
		watch: {
			src: {
				files: 'src/**/*',
				tasks: ['build'],
			}
		},
	});

	grunt.registerTask('build', ['clean', 'concat', 'babel', 'uglify', 'copy']);
};
