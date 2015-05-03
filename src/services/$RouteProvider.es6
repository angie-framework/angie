'use strict';

let routes = {
        '/': {
            templatePath: 'index.html'
        },
        '/404': {
            templatePath: '404.html'
        },
        '/500': {
            templatePath: '404.html'
        }
    },
    otherwise;

class $RouteProvider {
    static when(str, obj) {
        routes[str] = obj;
        return this;
    }
    static otherwise(str) {
        otherwise = str;
        return this;
    }
    static fetch() {
        return {
            routes: routes,
            otherwise: otherwise
        };
    }
}

class $StateProvider {
    constructor() {

    }
}

export {$StateProvider as $stateProvider, $RouteProvider as $routeProvider};

// TODO we have to make state provider as well
