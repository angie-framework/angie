'use strict';

let routes = {};

class $RouteProvider {
    static when(str, obj) {
        routes[str] = obj;
        return this;
    }
    static otherwise(str) {
        routes[str] = null;
        return this;
    }
    static fetch() {
        return routes;
    }
}

class $StateProvider {
    constructor() {
        
    }
}

export {$StateProvider as $stateProvider, $RouteProvider as $routeProvider};

// TODO we have to make state provider as well
