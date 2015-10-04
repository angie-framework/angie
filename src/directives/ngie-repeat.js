/**
 * @module ngieRepeat.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

function $$ngieRepeatFactory() {
    return {
        priority: 1,
        restrict: 'AECM',
        link: function($scope, el, attrs) {

            // We need to extract the repetition from the element
            let repeat = attrs.ngieRepeat,

            // Find the element's parent
                $parent = el.parent(),

            // Clone the raw element
                $el = el.clone(),

            // If not "for" in the Array, it's an invalid loop
                hasFor = false,

            // Is there an "in" or an "of" in the loop
                objLoop = false,
                arrLoop = false,

            // Check to see if there is a scope var in it lastly
                $scopeRef,

            // Check for keys and vals via a comma
                key,
                value;

            // Remove the repeat clause from the clone
            $el.attr('ngieRepeat', false);

            // Remove any $filter type phrasing for now
            repeat = repeat.replace(/(\|.*)$/, '');

            // Now we can parse our repeat value
            repeat = repeat.split(' ');

            repeat.forEach(function(v) {
                v = v.trim();
                console.log(v);
                switch (v) {
                    case '':
                        break;
                    case 'for':
                        hasFor = true;
                        break;
                    case 'in':
                        objLoop = true;
                        break;
                    case 'of':
                        arrLoop = true;
                        break;
                    default:
                        console.log($scope);
                        if ($scope.hasOwnProperty(v)) {
                            $scopeRef = $scope[ v ];
                        } else {
                            v = v.split(',');
                            key = v[0];
                            value = v[1];
                            console.log('here');
                        }
                }
            });

            if (!hasFor) {

                // TODO throw error, bad for statement
            }

            if (!objLoop && !arrLoop) {

                // TODO throw error, neither loop declared
            }

            if (!$scopeRef) {

                // TODO no scope ref found
            }

            if (!key) {

                // TODO no key or value to iterate over
            }

            if (objLoop) {
                console.log('in obj loop', v);
                for (let k of $scopeRef) {
                    let v = $scopeRef[ k ];
                    $parent.append(compile($el.html())({
                        [ key ]: k,
                        [ value ]: v
                    }));
                }
            } else if (arrLoop) {
                console.log('in arr loop', v);
                for (let v of $scopeRef) {
                    $parent.append(compile($el.html())({ [ key ]: v }));
                }
            }

            // TODO remove repeat statement?
        }
    };
}

export default $$ngieRepeatFactory;