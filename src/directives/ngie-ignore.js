/**
 * @module ngieIgnore.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/06/2015
 */

/**
 * @desc Returns a directive, which can be exposed to any element in a routed
 * template as an attribute.
 *
 * This directive is a utility for front end templates, which will prevent any
 * template strings from accidentally being compiled on the backend regardless
 * of scoping.
 *
 * Any immediate child template blocks will be ignored entirely, however,
 * descendant directive behavior may change the behavior of template parsing
 * inside of those directive's associated elements.
 * @since 0.4.4
 * @todo perform this operation without string manipulation
 * @access private
 * @example <div ngie-ignore>{{test}}</div>
 */
function $$ngieIgnoreFactory() {
    return {
        priority: 1,
        restrict: 'A',
        link($s, el, attrs) {

            // Replace all templated strings with their equivalents after compile
            el.html(el.html().replace(/(\{{2,3}[^\}]+\}{2,3})/g, '{{{\'$1\'}}}'));

            // Remove the ignore clause from the element
            el.removeAttr('ngie-ignore');
            delete attrs.ngieIgnore;
        }
    };
}

export default $$ngieIgnoreFactory;