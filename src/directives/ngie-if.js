/**
 * @module ngieRepeat.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

/**
 * @desc Returns a directive, which can be exposed to any element in a routed
 * template as an attribute.
 *
 * This directive is for boolean acceptance of DOM elements. If the content of
 * the attribute string validates against the $scope against which the routed
 * template is evaluated, the element will be kept and all template string
 * descendants will be evaluated. Otherwise, the element shall be removed.
 * @since 0.4.4
 * @access private
 * @example <div ngie-if="test">{{test}}</div>
 */
import { $$safeEvalFn } from    '../factories/$Compile';

function $$ngieIfFactory() {
    return {
        priority: 1,
        restrict: 'A',
        link: function($scope, el, attrs) {

            // We need to extract the repetition from the element
            let iif = attrs.ngieIf;

            // Evaluate expression
            try {
                if (!$$safeEvalFn.call($scope, iif)) {
                    el.remove();
                } else {

                    // Remove the if clause from the element
                    el.removeAttr('ngie-if');
                    delete attrs.ngieIf;
                }
            } catch(e) {
                el.remove();
            }
        }
    };
}

export default $$ngieIfFactory;