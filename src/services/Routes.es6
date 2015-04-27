'use strict';

let routes = {};

export default class $RouteProvider {
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

export class $StateProvider {

}

// TODO we have to make state provider as well
