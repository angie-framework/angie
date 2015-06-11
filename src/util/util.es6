'use strict'; 'use strong';

const fs =          require('fs');

const util = {
    extend: function extend(target) {
        let __target__;

        if (typeof target === 'function') {
            __target__ = target;
            target = target.prototype;
        } else if (typeof target !== 'object') {
            return target;
        }

        let args = Array.prototype.slice.call(arguments, 1, arguments.length);
        args.forEach(function(src) {
            if (typeof src === 'object') {
                for (let key in src) {
                    target[key] = src[key];
                }
            }
        });

        return __target__ || target;
    },
    findFile: function findFile(root, target) {

        // Handle slashes
        target = target.charAt(0) === '/' ? target.slice(1, target.length) : target;

        // Pull this out because it is used several times
        const fileDirectoryExists = function fileDirectoryExists(n, t) {
            try {
                return fs.lstatSync(n)[ `is${t}` ]();
            } catch(e) {
                return false;
            }
        };

        let template;
        if (target.indexOf('/') > -1) {

            // We can just search the root for the file
            template = `${root}/${target}`;
        } else {

            // If file has no slash, search in all directories
            const fn = function deepFindFile(root, target) {
                fs.readdirSync(root).forEach(function(file) {
                    let isDir = fileDirectoryExists(file, 'Directory');
                    if (isDir) {

                        // We have a directory and we need to recurse through it
                        fn(`${root}/${file}`, target);
                    } else if (file.indexOf(target) > -1) {
                        template = `${root}/${target}`;
                    }
                });
            };

            // Recursively call for all roots
            fn(root, target);
        }

        // Check to see that the 'template' we found is an actual file
        if (template && fileDirectoryExists(template, 'File')) {
            return template;
        }
        return undefined;
    }
};

export default util;
