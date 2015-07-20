'use strict'; 'use strong';

// TODO needs to dynamically know when to provide scope
// There is no such thing as $rootScope

// TODO is this still a thing?

let $scope = new $ScopeProvider(),
    handlers = [];

class $ScopeProvider {
    contructor() {
        this.id = 1;
    }
    static $on(name, obj) {
        handlers.push({ [ name ]: obj });
        return true;
    }
    static $broadcast(name, args...) {
        for (handler of handlers) {
            if (handler.hasOwnProperty(name)) {
                handler[ name ](...args);
            }
        }
        return true;
    }

    // Apply object.observe
    static $watch(obj, fn) {
        return Object.observe(obj, fn);
    }

    // Call object.observe for each property
    static $watchCollection(obj, fn) {
        for (let key of obj) {
            this.$watch(obj[ key ], fn);
        }
        return true;
    }
    static $$off(name) {
        for (handler, i of handlers) {
            if (handler.hasOwnProperty(name)) {
                handlers.splice(i, 1);
            }
        }
    }
    static $$removeWatch() {

        // Look up how to remove a watch
    }
}

export default $ScopeProvider;
export {$scope};
