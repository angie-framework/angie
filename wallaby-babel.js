const SRC = 'src/**/*.js',
    TEST_SRC = 'test/src/**/*.spec.js';

module.exports = function() {
    return {
        files: [
            {
                pattern: 'src/util/scaffold/project.js',
                instrument: true,
                load: true,
                ignore: true
            },
            'AngieFile.json',
            SRC
        ],
        tests: [
            {
                pattern: 'test/src/util/scaffold/project.spec.js',
                instrument: true,
                load: true,
                ignore: true
            },
            TEST_SRC
        ],
        env: {
            type: 'node'
        },
        params: {
            env: 'TEST_ENV=src;'
        },
        workers: {
            recycle: true
        },
        preprocessors: {
            '**/*.js': file => require('babel').transform(file.content, {
                sourceMap: true
            })
        }
    };
};