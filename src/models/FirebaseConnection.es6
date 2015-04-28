'use strict'

import BaseDBConnection from './BaseDBConnection';
import app from '../Angular';

const Firebase =        require('firebase'),
      chalk =           require('chalk'),
      mysql =           require('mysql'),
      mkdirp =          require('mkdirp'),
      fs =              require('fs');

const p = process,
      DEFAULT_HOST = '127.0.0.1';

export default class FirebaseConnection extends BaseDBConnection {
    constructor(database = 'default') {
        super();
    }
}
