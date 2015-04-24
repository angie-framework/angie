'use strict';

class Model {
    constructor() {
        //this.con
    }
}

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
    model() {
        //return new Model();
    }
}

let app = new Angular();

export default app;


app.model('PeopleModel', function() {
    this.username = new CharField({
        maxLength: 35,
        defaultValue: 'test'
    });
    this.save = function() {
        // TODO this would override the base, but using an es6 class will not
    };
});
