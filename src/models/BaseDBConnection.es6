import Config from '../config'
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
    read() {

    }
    update() {

    }
    delete() {

    }
    connect() {

    }
    sync() {
        // TODO collect the modules here
        this.models = app.models;
    }
}

// TODO methods for filter/etc
// TODO use this to manage services
