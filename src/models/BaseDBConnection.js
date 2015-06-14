'use strict'; 'use strong';

import {prepApp} from '../Server';
import app from '../Base';
import {AngieDBObject} from './BaseModel';
import util from '../util/util';
import $log from '../util/$LogProvider';
import $Exceptions from '../util/$ExceptionsProvider';

const IGNORE_KEYS = [
        'database',
        'tail',
        'head',
        'rows',
        'values',
        'model'
    ];

export default class BaseDBConnection {
    constructor(database, destructive = false) {
        this.database = database;
        this.destructive = destructive;
    }
    name (modelName) {
        modelName = modelName.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (modelName.charAt(0) === '_') {
            modelName = modelName.slice(1, modelName.length);
        }
        return modelName;
    }
    models() {
        return this.__models__;
    }
    all(args = {}, fetchQuery = '', filterQuery = '') {
        if (!args.model || !args.model.name) {
            $Exceptions.$$invalidModelReference();
        }

        let values = '*';
        if (typeof args.values === 'object' && args.values.length) {
            values = args.values;
            if (values.indexOf('id') === -1) {
                values.unshift('id');
            }
        }
        return `SELECT ${values} FROM ${args.model.name} ` +
            `${filterQuery ? `WHERE ${filterQuery}` : ''} ${fetchQuery};`;
    }
    fetch(args = {}, filterQuery = '') {
        let ord = 'ASC';

        if (args.head && args.head === false) {
            ord = 'DESC';
        } else if (args.tail && args.tail === true) {
            ord = 'DESC';
        }

        const int = args.rows || 1,
              fetchQuery = `ORDER BY id ${ord} LIMIT ${int}`;
        return this.all(args, fetchQuery, filterQuery);
    }
    filter(args = {}) {
        return this.fetch(args, this.filterQuery(args));
    }
    filterQuery(args) {
        let filterQuery = [];
        for (let key in args) {
            if (IGNORE_KEYS.indexOf(key) > -1) {
                continue;
            }
            if (typeof args[ key ] !== 'object') {
                filterQuery.push(`${key}='${args[key]}'`);
            } else {
                filterQuery.push(`${key} in ${this.queryInString(args, 'key')}`);
            }
        }
        return filterQuery.length ? `${filterQuery.join(' AND ')}` : '';
    }
    create(args = {}) {
        let keys = Object.keys(args),
            queryKeys = [],
            values = [];

        if (!args.model || !args.model.name) {
            $Exceptions.$$invalidModelReference();
        }

        keys.forEach(function(key) {
            if (IGNORE_KEYS.indexOf(key) === -1) {
                queryKeys.push(key);
                values.push(`'${args[key]}'`);
            }
        });

        return `INSERT INTO ${args.model.name} (${queryKeys.join(', ')}) ` +
            `VALUES (${values.join(', ')});`;
    }
    delete(args = {}) {
        return `DELETE FROM ${args.model.name} ${this.filterQuery(args)};`;
    }
    update(args = {}) {
        if (!args.model || !args.model.name) {
            $Exceptions.$$invalidModelReference();
        }

        let filterQuery = this.filterQuery(args),
            idSet = this.queryInString(args.rows, 'id');
        if (!filterQuery) {
            $log.warn('No filter query in UPDATE statement.');
        } else {
            return `UPDATE ${args.model.name} SET ${filterQuery} WHERE id in ${idSet};`;
        }
    }
    queryInString(args = {}, key) {
        let fieldSet = [];
        args.forEach(function(row) {
            fieldSet.push(row[ key ]);
        });
        return `(${fieldSet.join(',')})`;
    }
    sync() {
        let me = this;

        // Every instance of sync needs a registry of the models, which implies
        return prepApp().then(function() {
            me.__models__ = app.Models;
            $log.info(
                `Synccing database: ${me.database.name || me.database.alias}`
            );
        });
    }
    migrate() {
        let me = this;

        // Every instance of sync needs a registry of the models, which implies
        return prepApp().then(function() {
            me.__models__ = app.Models;
            $log.info(
                `Migrating database: ${me.database.name || me.database.alias}`
            );
        });
    }
    __querySet__(model, query, rows, errors) {
        let me = this,
            rels = [],
            relFieldNames = {},
            relArgs = {},

            proms = [];

        // We want to process all of the foreign keys
        rows.forEach(function(v) {

            // Find all of the foreign key fields
            for (let key in v) {
                const field = model[ key ];
                if (field && field.nesting === true) {
                    rels.push(field.rel);
                    relFieldNames[ field.rel ] = key;
                    relArgs[ field.rel ] = me.queryInString(rows, 'id');
                }
            }
        });

        // Instantiate a promise for each of the foreign key fields in the
        // query
        rels.forEach(function(v) {
            proms.push(me.filter({
                model: {
                    name: v,
                    id: relArgs[ v ]
                }
            }).then(function(queryset) {

                // Add errors to queryset errors
                if (errors === null) {
                    errors = [];
                }
                errors.push(queryset.errors);

                rows.forEach(function(row) {
                    queryset.forEach(function(queryRow) {
                        if (
                            !isNaN(+row[ relFieldNames[ v ] ]) &&
                            queryRow.hasOwnProperty('id') &&
                            row[ relFieldNames[ v ] ] === queryRow.id
                        ) {
                            row[ relFieldNames[ v ] ] = queryRow;
                        } else {
                            row[ relFieldNames[ v ] ] = null;
                        }
                    });
                });
            }));
        });

        return Promise.all(proms).then(function() {

            // Resolves to a value in the connections currently
            const queryset = new AngieDBObject(me, model, query);
            return util.extend(
                rows,
                { errors: errors },
                AngieDBObject.prototype,
                queryset
            );
        });
    }
}
