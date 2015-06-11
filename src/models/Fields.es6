'use strict'; 'use strong';

import util from '../util/util';

class BaseField {
    constructor(
        args = 0,
        maxValue = undefined,
        minLength = 0,
        maxLength = undefined,
        nullable = false,
        unique = false
    ) {
        this.type = 'BaseField';
        if (typeof args === 'object') {
            util.extend(this, arguments[0]);
        } else if (!isNaN(args)) {
            if (args === 1) {
                return;
            }

            /* eslint-disable */
            [
                this.minValue,
                this.maxValue,
                this.minLength,
                this.maxLength,
                this.nullable,
                this.unique
            ] = [
                args,
                maxValue,
                minLength,
                maxLength,
                nullable,
                unique
            ];

            /* eslint-enable */
        }
    }
    create() {

        // TODO this method is not responsible for migrating a model, only
        // creating a field in a record when the model is instantiated
        if (
            this.default &&
            this.validate(this.default)
        ) {
            this.value = this.default;
        }
    }
    validate(value) {
        value = value || this.value;
        if (!value && !this.nullable) {
            return false;
        }
        if (typeof value === 'string') {
            if (
                (this.minLength && value.length <= this.minLength) ||
                (this.maxLength && value.length >= this.maxLength)
            ) {
                return false;
            }
            return true;
        } else {
            if (
                (this.minValue && value <= this.minValue) ||
                (this.maxValue && value >= this.maxValue)
            ) {
                return false;
            }
            return true;
        }
    }
}

export class CharField extends BaseField {
    constructor() {
        super(...arguments);
        this.type = 'CharField';
    }
    create() {
        super.create();
        if (!this.value) {
            this.value = '';
        }
    }
    validate(value) {
        value = this.value || value;
        if (typeof value !== 'string') {
            return false;
        }
        return super.validate(value);
    }
}

export class IntegerField extends BaseField {
    constructor() {
        super(...arguments);
        this.type = 'IntegerField';
    }
}

export class ForeignKeyField extends BaseField {
    constructor(rel, args) {
        super(1);
        if (!rel) {
            return;
        }

        this.nesting = true;
        this.deepNesting = false;
        if (args && typeof args === 'object') {
            this.nesting = args.hasOwnProperty('nesting') ? !!args.nesting : true;

            // TODO deep nesting
            this.deepNesting = args.hasOwnProperty('deepNesting') ?
                !!args.nesting : true;
        }
        this.rel = rel;
        this.type = 'ForeignKeyField';
    }
}
