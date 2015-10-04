/**
 * @module ngieRepeat.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

app.directive('ngieRepeat', function() {
    return {
        priority: 1,
        restrict: 'AECM',
        link: function($scope, el, attrs) {

            // We need to extract the repetition from the element
            let repeat = attrs.ngRepeat,

            // Find the raw element's parent
                $parent = el.parent(),

            // Clone the raw element
                $el = el.clone();

            // Then remove the original el
            el.remove();

            // Remove any $filter type phrasing for now
            repeat = repeat.replace(/\(|.*)$/, '');

            // Now we can parse our repeat value
            repeat = repeat.split(' ');

            console.log('REPEAT', repeat);
        }
    };
});

// TODO test nested repeat directives