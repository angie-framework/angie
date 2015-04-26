'use strict';

class Angular {
    constructor() {
        this.services = {};
        this.Controllers = {};
        this.Models = {};
        this.directives = {};
        this.__registry__ = {
            __services__: new Set(),
            __controllers__: new Set(),
            __models__: new Set(),
            __directives__: new Set()
        };
    }
    service(name, obj) {
        this.__registry__.__services__.add(name);
        this.services[name] = obj;
    }
    Model(name, obj) {
        this.__registry__.__models__.add(name);
        this.Models[name] = obj;
    }
    static noop() {}
}

let app = new Angular();

export default app;
export {Angular as angular};

app.Model('UserModel', function() {
    // this.username = new CharField({
    //     maxLength: 35,
    //     defaultValue: 'test'
    // });
    this.name = 'angie_users';
    this.save = function() {
        // TODO this would override the base, but using an es6 class will not
    };
    return this;
});

app.Model('MigrationsModel', function() {
    // this.username = new CharField({
    //     maxLength: 35,
    //     defaultValue: 'test'
    // });
    //this.name = 'angie_migrations';
    // this.save = function() {
    //     // TODO this would override the base, but using an es6 class will not
    // };
    //return this;
    return class MigrationsModel {
        constructor(){
            this.name = 'angie_migrations';
        }
    }
});
