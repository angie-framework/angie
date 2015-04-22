'use strict';

export default class Angular {
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
