'use strict';

import Config from '../Config';
import app from '../Angular';

// app.service('$ModelService', function() {
//     return BaseModel;
// });
// let config;

export default class BaseDBConnection {
    constructor() {
        this.config = Config.fetch() || {};
    }
    create() {

    }
    get() {

    }
    update() {

    }
    delete() {

    }
    connect() {

    }
    sync() {
        this.models = app.__registry__.__models__;
    }
}

// TODO methods for filter/etc
// TODO use this to manage services
