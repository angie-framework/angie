'use strict'; 'use strong';

import fs from 'fs';

/**
 * @desc util is a slient utility file which is not available via any provider
 * on the app object. The only way to access the methods on this class is to
 * import the module.
 * @todo Make this class private
 * @todo Subclass
 * @todo Make the helper class util resolve to Util everywhere, rename Util
 * @since 0.2.3
 */
class Util {
    static extend(target) {
        let _target;

        if (typeof target === 'function') {
            _target = target;
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

        return _target || target;
    }
    static findFile(root, target) {

        // Handle slashes
        target = Util.removeTrailingLeadingSlashes(target);

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
                let files = fs.readdirSync(root);
                for (let i = 0; i < files.length; ++i) {
                    let file = files[i],
                        isDir = fileDirectoryExists(file, 'Directory');
                    if (isDir) {

                        // We have a directory and we need to recurse through it
                        fn(`${root}/${file}`, target);
                    } else if (file.indexOf(target) > -1) {
                        template = `${root}/${target}`;
                    }
                    if (template) break;
                }
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

    static removeLeadingSlashes(str) {
        return str.charAt(0) === '/' ? str.slice(1, str.length) : str;
    }
    static removeTrailingSlashes(str) {
        return str[ str.length - 1 ] === '/' ? str.slice(0, str.length - 1) : str;
    }

    /**
     * @desc Util helper to replace leading and trailing slashes
     * @since 0.2.3
     * @param {string} str [param=''] String to process
     * @returns {string} The str param with stripped trailing and leading slashes
     * @example 'test' === util.removeTrailingLeadingSlashes('/test/'); // true
     */
    static removeTrailingLeadingSlashes(str = '') {
        return Util.removeTrailingSlashes(Util.removeLeadingSlashes(str));
    }
    static toCamel(str) {
        return str.replace(/([-_][a-z])/i, '$1'.toUpperCase().replace(/-|_/, ''));
    }
    static toUnderscore(str) {
        return Util.toFormat(str, '_');
    }
    static toDash(str) {
        return Util.toFormat(str, '-');
    }
    static toFormat(str, del) {
        return str.replace(/([A-Z])/g, `${del}$1`).toLowerCase();
    }
}

class fileUtil {}
class stringUtil {}

export default class util extends Util {}
