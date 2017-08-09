module.exports = function (grunt) {
    'use strict';
    var destDirList = [
        './dest',
        './dest/race',
        './dest/sudoku'
    ];
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Project configuration.
    grunt.initConfig({
        browserify: {
            race_screen: {
                src: './novi-games/novi-race/screen.js',
                dest: './dest/race/screen.js'
            },
            race_user: {
                src: './novi-games/novi-race/user.js',
                dest: './dest/race/user.js'
            },
            sudoku_screen: {
                src: './novi-games/sudoku/screen.js',
                dest: './dest/sudoku/screen.js'
            },
            sudoku_user: {
                src: './novi-games/sudoku/user.js',
                dest: './dest/sudoku/user.js'
            },
            connect: {
                src: './novi-connect.io/lib/novi-connect.io.js',
                dest: './novi-connect.io/lib/novi-connect.io.min.js'
            }
        },
        clean: destDirList,
        compress: {
            main: {
                options: {
                    archive: './dest.zip'
                },
                files: [
                    {src: ['./**'], expand: true, cwd: './dest/'},
                ]
            }
        },
        copy: {
            race: {
                files: [
                    {expand: true, cwd: './novi-games/novi-race', src: ['files/**'], dest: 'dest/race'},
                    {expand: true, cwd: './novi-games/novi-race', src: ['app.json'], dest: 'dest/race'},
                    {expand: true, cwd: './novi-games/novi-race', src: ['screen.html'], dest: 'dest/race'},
                    {expand: true, cwd: './novi-games/novi-race', src: ['user.html'], dest: 'dest/race'}
                ],
            },
            sudoku: {
                files: [
                    {expand: true, cwd: './novi-games/sudoku', src: ['files/**'], dest: 'dest/sudoku'},
                    {expand: true, cwd: './novi-games/sudoku', src: ['app.json'], dest: 'dest/sudoku'},
                    {expand: true, cwd: './novi-games/sudoku', src: ['screen.html'], dest: 'dest/sudoku'},
                    {expand: true, cwd: './novi-games/sudoku', src: ['user.html'], dest: 'dest/sudoku'}
                ],
            },
        },
    })

    grunt.registerTask('mkdir', 'Creating directories', function(type){
        destDirList.forEach(function (elem, index) {
            grunt.file.mkdir(elem);
        })
    });

    // Default task.
    grunt.registerTask('buildRace', ['browserify:race_screen', 'browserify:race_user', 'copy:race'])
    grunt.registerTask('buildSudoku', ['browserify:sudoku_screen', 'browserify:sudoku_user', 'copy:sudoku'])
    grunt.registerTask('buildConnect', ['browserify:connect'])

    grunt.registerTask('default', ['clean', 'buildRace', 'buildSudoku', 'buildConnect', 'compress:main']);
    grunt.registerTask('race', ['clean', 'buildRace', 'compress:main']);
};