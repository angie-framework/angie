/**
 * @module $MimeTypeProvider.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

const MIME_TYPE = {
        atom: 'application/atom+xml',
        css: 'text/css',
        html: 'text/html',
        javascript: 'application/javascript',
        jpg: 'image/jpeg',
        js: 'application/javascript',
        json: 'application/json',
        png: 'image/png',
        rss: 'application/rss+xml',
        svg: 'image/svg+xml',
        xml: 'application/xml'
    },
    DEFAULT_TYPE = 'text/plain';

/**
 * @desc $MimeTypeProvider is predominately used internally to specify a properties
 * mime type on response objects. It can also be used in special cases for
 * routing views.
 * @since 0.2.6
 * @access public
 * @example $MimeTypeProvider._('test.json'); // = 'application/json'
 */
class $MimeTypeProvider {

    /**
     * @desc Find a mime type based on ext
     * @since 0.2.6
     * @access private
     * @param {string} ext [param='html'] Content-Type to check against
     * @returns {string} An approximated Content-Type
     * @example $MimeTypeProvider._('json'); // = 'application/json'
     */
    static $$(ext = '') {
        return MIME_TYPE[ ext.toLowerCase() ] || DEFAULT_TYPE;
    }

    /**
     * @desc Find a mime type based on a pathname
     * @since 0.2.6
     * @access public
     * @param {string} path File path to check against
     * @returns {string} An approximated Content-Type
     * @example $MimeTypeProvider._fromPath('test.json'); // = 'application/json'
     */
    static fromPath(path) {
        return this.$$(path.indexOf('.') > -1 ? path.split('.').pop() : undefined);
    }
}

export default $MimeTypeProvider;
