/**
 * @module ngieRepeat.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

function $$ngieRepeatFactory($compile) {
    return {
        priority: 1,
        restrict: 'AECM',
        link($scope, el, attrs, done) {

            console.log('EL HTML', el.html());

            // We need to extract the repetition from the element
            let repeat = attrs.ngieRepeat;

            // Remove the repeat clause from the clone
            el.removeAttr('ngie-repeat');
            delete attrs.ngieRepeat;

            console.log('here', el);

            // Find the element's parent
            let $parent = el.parent();

            console.log('parent', $parent);

            // Clone the raw element
            let $el = buildRepeaterElement(el[ 0 ] || el, el.html()),
                proms = [],

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

            console.log('nablah', el);

            el.remove();

            console.log('blah', el);

            // Remove any $filter type phrasing for now
            repeat = repeat.replace(/(\|.*)$/, '');

            // Now we can parse our repeat value
            repeat = repeat.split(' ');

            repeat.forEach(function(v) {
                v = v.trim();
                console.log(v);
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

            console.log('after decisions', hasFor, objLoop, arrLoop);

            if (objLoop) {
                console.log('in obj loop', v);
                for (let k of $scopeRef) {
                    let v = $scopeRef[ k ];
                    console.log('$el', $el);
                    $parent.append(compile($el)({
                        [ key ]: k,
                        [ value ]: v
                    }));
                }
            } else if (arrLoop) {
                console.log('in arr loop', key, $scopeRef);
                for (let v of $scopeRef) {
                    console.log('V', v);
                    console.log(key);
                    console.log('$el', $el);

                    let prom = $compile($el)({
                        [ key ]: v
                    }).then(function(t) {
                        console.log('T', t);
                        $parent.append(t);
                    });

                    proms.push(prom);
                }
            }

            console.log('TEST');
            return Promise.all(proms).then(function() {
                done();
            });


            // TODO remove repeat statement?
            // TODO test stuff is inserted in right place
            // TODO split on space is not good enough
            // TODO SHOULD REORDER THE REPLACERS AND THE DIRECTIVES
        }
    };
}

function buildRepeaterElement($el, content) {

    console.log('X', $el);

    const tag = $el.name;

    console.log('tag', tag);

    let html = `<${tag}`;

    console.log('in repeater', $el.attribs);

    for (let key in $el.attribs) {
        let value = $el.attribs[ key ];
        html += ` ${key}="${value}"`;
    }

    html += `>${content}</${tag}>`;
    console.log('HTML', html);
    return html;
}

export default $$ngieRepeatFactory;