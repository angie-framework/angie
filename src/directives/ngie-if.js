/**
 * @module ngieRepeat.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

import { $$safeEvalFn } from    '../factories/$Compile';

function $$ngieIfFactory() {
    return {
        priority: 1,
        restrict: 'AECM',
        link: function($scope, el, attrs) {

            // We need to extract the repetition from the element
            let iif = attrs.ngieIf;

            // Evaluate expression
            try {
                if (!$$safeEvalFn.call($scope, iif)) {
                    el.remove();
                } else {

                    // Remove the if clause from the clone
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