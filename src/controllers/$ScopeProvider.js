'use strict'; 'use strong';


let handlers = [];

class $ScopeProvider {
    contructor() {
        this.id = 1;
    }
    static $on(name, obj) {
        handlers.push({ [ name ]: obj });
        return true;
    }
    static $broadcast(name) {
        let args = Array.from(arguments).splice(0, 1);
        for (let handler of handlers) {
            if (handler.hasOwnProperty(name)) {
                handler[ name ](args);
            }
        }
        return true;
    }

    // Apply object.observe
    static $watch(obj, fn) {
        return Object.observe(this[ obj ], fn);
    }

    // Call object.observe for each property
    static $watchCollection(obj, fn) {
        for (let key of obj) {
            this.$watch(obj[ key ], fn);
        }
        return true;
    }
    static $$off(name) {
        for (let handler of handlers) {
            if (handler.hasOwnProperty(name)) {
                handlers.splice(handlers.indexOf(handler), 1);
            }
        }
    }
    static $$removeWatch(obj) {

        // Look up how to remove a watch
        Object.unwatch(this[ obj ]);
    }
}

const $scope = new $ScopeProvider();
export default $ScopeProvider;
export {$scope};
