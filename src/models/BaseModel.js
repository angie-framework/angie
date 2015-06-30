'use strict'; 'use strong';

// Angie Modules
import AngieDatabaseRouter from         './AngieDatabaseRouter';
import util from                        '../util/util';
import {default as $Exceptions} from    '../util/$ExceptionsProvider';

const IGNORE_KEYS = [
    'database',
    '__database__',
    'model',
    'name',
    'fields',
    'save',
    'rows'
];

export class BaseModel {
    constructor(name) {
        this.name = this.name || name;
    }
    all() {

        // Returns all of the rows
        return this._prep.apply(this, arguments).all(this.name);
    }
    fetch() {
        let args = arguments[0];
        args.model = this;

        // Returns a subset of rows specified with an int and a head/tail argument
        return this._prep.apply(
            this,
            arguments
        ).fetch(args);
    }
    filter() {
        let args = arguments[0];
        args.model = this;

        // Returns a filtered subset of rows
        return this._prep.apply(
            this,
            arguments
        ).filter(args);
    }
    exists() {
        return this.filter.apply(this, arguments).then(function(querySet) {
            return !!querySet.length;
        });
    }
    create() {
        let args = arguments[0];
        args.model = this;

        this.database = this._prep.apply(this, arguments);

        // Make sure all of our fields are resolved
        let createObj = {},
            me = this;

        this._fields().forEach(function(field) {
            const val = args[ field ] || null;
            if (
                me[ field ] &&
                me[ field ].validate &&
                me[ field ].validate(val)
            ) {
                createObj[field] = val;
            } else {
                $Exceptions.$$invalidModelFieldReference(me.name, field);
            }
        });

        // Once that is settled, we can call our create
        return this.database.create(args);
    }
    delete() {
        let args = arguments[0];
        args.model = this;

        // Delete a record/set of records
        return this._prep.apply(
            this,
            arguments
        ).delete(args);
    }
    query(query, args = {}) {
        if (typeof query !== 'string') {
            return new Promise(function() {
                arguments[1](new Error('Invalid Query String'));
            });
        }
        return this._prep.apply(this, args).raw(query, this);
    }
    _prep() {
        const args = arguments[0],
              database = typeof args === 'object' && args.hasOwnProperty('database') ?
                args.database : null;

        // This forces the router to use a specific database, DB can also be
        // forced at a model level by using this.database
        this.__database__ = AngieDatabaseRouter(
            database || this.database || 'default'
        );
        return this.__database__;
    }
    _fields() {
        this.fields = [];
        for (let key in this) {
            if (
                typeof this[ key ] === 'object' &&
                IGNORE_KEYS.indexOf(key) === -1
            ) {
                this.fields.push(key);
            }
        }
        return this.fields;
    }
}

// "DO YOU WANT TO CHAIN!? BECAUSE THIS IS HOW YOU CHAIN!"
// TODO this can be made much better once Promise is subclassable
let AngieDBObject = function(database, model, query = '') {
    if (!database || !model) {
        return;
    }
    this.database = database;
    this.model = model;
    this.query = query;
};

AngieDBObject.prototype.update = function() {
    let args = arguments[0];

    args.model = this.model;
    args.rows = this;
    if (typeof args !== 'object') {
        return;
    }

    let updateObj = {};
    for (let key in args) {
        const val = args[ key ] || null;
        if (IGNORE_KEYS.indexOf(key) > -1) {
            continue;
        } else if (
            this[ key ] &&
            this[ key ].validate &&
            this[ key ].validate(val)
        ) {
            updateObj[ key ] = val;
        } else {
            $Exceptions.$$invalidModelFieldReference(this.name, key);
        }
    }

    util.extend(args, updateObj);
    return this.database.update(args);
};

export {AngieDBObject};
