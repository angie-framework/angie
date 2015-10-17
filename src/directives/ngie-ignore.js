/**
 * @module ngieIgnore.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/06/2015
 */

function $$ngieIgnoreFactory() {
    return {
        priority: 1,
        restrict: 'AECM',
        link($s, el, attrs) {
            el.html(el.html().replace(/(\{{2,3}[^\}]+\}{2,3})/g, '{{{\'$1\'}}}'));

            el.removeAttr('ngie-ignore');
            delete attrs.ngieIgnore;
        }
    };
}

export default $$ngieIgnoreFactory;