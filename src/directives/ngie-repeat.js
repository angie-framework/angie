/**
 * @module ngieRepeat.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

/**
 * @desc Returns a directive, which can be exposed to any element in a routed
 * template as an attribute.
 *
 * This directive is an iterator: provided a properly formatted iterator string,
 * it will loop over all of the elements or keys in a specified $scope
 * Array/Object.
 *
 * For Arrays, proper strings look like this:
 * With index:
 * `for k,v of [Array name in $scope]`
 * where index will be the index of the Array in the current iteration
 * Without index:
 * `for v of [Array name in $scope]`
 *
 * For Objects, proper strings look like this:
 * `for k,v in [Object name in $scope]`
 * if either `k` or `v` is omitted, the keys will be passed into the compiler.
 *
 * Any errors in the ngieRepeat directive string will result in the div being
 * expunged from the DOM and a warning in the console.
 * @since 0.4.4
 * @access private
 * @example
 * <div ngie-repeat="for k,v of arr">{{k}} {{v}}</div>
 * // or
 * <div ngie-repeat="for v of arr">{{v}}</div>
 * // or
 * <div ngie-repeat="for k,v in obj">{{k}} {{v}}</div>
 * // or
 * <div ngie-repeat="for k in obj">{{k}}</div>
 */
function $$ngieRepeatFactory($compile, $Log) {
    return {
        priority: 1,
        restrict: 'A',
        link($scope, el, attrs, done) {

            // We need to extract the repetition from the element
            let repeat = attrs.ngieRepeat;

            // Remove the repeat clause from the clone
            el.removeAttr('ngie-repeat');
            delete attrs.ngieRepeat;

            // Find the element's parent
            let $parent = el.parent(),

                // Clone the raw element
                $el = buildRepeaterElement(el[ 0 ] || el, el.html()),
                compileFn = $compile($el),
                proms = [],
                html = '',

                // State of validity
                warn = false,

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

            // Remove any $filter type phrasing for now, split between words
            repeat.replace(/(\|.*)$/, '').split(' ').forEach(function(v) {
                v = v.trim();
                if (v) {
                    switch (v) {
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
                            if ($scope.hasOwnProperty(v)) {
                                $scopeRef = $scope[ v ];
                            } else {
                                v = v.split(',');
                                key = v[ 0 ];
                                value = v[ 1 ];
                            }
                    }
                }
            });

            // Check to see if we have parsed properly, throw warnings if not
            if (!$parent.html()) {
                warn = 'Parent DOM element of ngieRepeat element must exist';
            } else if (!hasFor) {
                warn = 'No declared "for" in ngieRepeat directive';
            } else if (!$scopeRef) {
                warn = 'No $scope found for ngieRepeat iterable';
            } else if (!key) {
                warn = 'No key or value declarations for ngieRepeat to iterate ' +
                    'over';
            } else if (!objLoop && !arrLoop) {
                warn = 'Use the keyword "in" or "of" in ngieRepeat declarations';
            } else if (objLoop) {
                for (let k in $scopeRef) {
                    let v = $scopeRef[ k ],
                        prom = compileFn({
                            [ key ]: k,
                            [ value ]: v
                        }, false).then(t => html += t);
                    proms.push(prom);
                }
            } else if (arrLoop) {

                // Perform the iteration in this fashion so that we can expose
                // the index
                for (let i = 0; i < $scopeRef.length; ++i) {
                    let v = $scopeRef[ i ],
                        obj = key && value ? {
                            [ key ]: i,
                            [ value ]: v
                        } : {
                            [ key ]: v
                        },
                        prom = compileFn(obj, false).then(t => html += t);
                    proms.push(prom);
                }
            }

            // Pass a warning if it exists
            if (warn) {
                $Log.warn(warn);
                return el.remove();
            }

            return Promise.all(proms).then(function() {

                // Update the parent HTML
                let $parentHTML = $parent.html().replace($el, html);
                $parent.html($parentHTML);

                // Resolve the directive
                done();
            });
        }
    };
}

function buildRepeaterElement(el, content) {
    const tag = el.name;

    // Load the string tag name
    let html = `<${tag}`;

    // Build the equivalent of the repeater element from its tag name and
    // attributes
    for (let key in el.attribs) {
        let value = el.attribs[ key ];
        html += ` ${key}="${value}"`;
    }

    // Close the tag
    html += `>${content}</${tag}>`;
    return html;
}

export default $$ngieRepeatFactory;