'use strict';

let app = new Angular();

class Angular {
    constructor() {
        this.services = {};
        this.controllers = {};
        this.models = {};
        this.directives = {};
    }
    service(name, obj) {
        this.services[name] = obj;
    }
}

export default app;
