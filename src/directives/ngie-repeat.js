/**
 * @module ngieRepeat.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

function $$ngieRepeatFactory($compile, $Log) {
    return {
        priority: 1,
        restrict: 'AECM',
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

            // Check to see if we have parsed properly, throw errors
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
                for (let k of $scopeRef) {
                    let v = $scopeRef[ k ],
                        prom = compileFn({
                            [ key ]: k,
                            [ value ]: v
                        }, false).then(t => html += t);
                    proms.push(prom);
                }
            } else if (arrLoop) {
                for (let v of $scopeRef) {
                    let prom = compileFn({
                        [ key ]: v
                    }, false).then(t => html += t);
                    proms.push(prom);
                }
            }

            if (warn) {
                $Log.warn(warn);
                return el.remove();
            }

            return Promise.all(proms).then(function() {
                let $parentHTML = $parent.html().replace($el, html);
                $parent.html($parentHTML);

                done();
            });
        }
    };
}

function buildRepeaterElement(el, content) {
    const tag = el.name;
    let html = `<${tag}`;

    for (let key in el.attribs) {
        let value = el.attribs[ key ];
        html += ` ${key}="${value}"`;
    }

    html += `>${content}</${tag}>`;
    return html;
}

export default $$ngieRepeatFactory;