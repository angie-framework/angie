/**
 * @module ngieRepeat.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

import cheerio from                 'cheerio';

function $$ngieRepeatFactory($compile) {
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
            let $parent = el.parent();

            if (!$parent.html()) {
                // Parent html must exist
            }

            // Clone the raw element
            let $el = buildRepeaterElement(el[ 0 ] || el, el.html()),
                prom = $compile($el),
                proms = [],
                html = '',

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
            repeat = repeat.replace(/(\|.*)$/, '').split(' ');

            repeat.forEach(function(v) {
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
                                key = v[0];
                                value = v[1];
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

            if (objLoop) {
                for (let k of $scopeRef) {
                    let v = $scopeRef[ k ],
                        $elProm = prom({
                            [ key ]: k,
                            [ value ]: v
                        }).then(function(t) {
                            $parent.append('test');
                        });

                    proms.push($elProm);
                }
            } else if (arrLoop) {
                for (let v of $scopeRef) {
                    let $elProm = prom({
                        [ key ]: v
                    }).then(t => html += t);

                    proms.push($elProm);
                }
            }

            return Promise.all(proms).then(function() {

                console.log('html', html);

                // TODO still an error with Reference
                $parent.html($parent.html().replace(el.html(), html));
                // $parent.insertAfter(el.html(), cheerio.load(html));
                // el.remove();

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