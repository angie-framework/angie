'use strict'; 'use strong';

require('babel/register');

global.expect =         require('chai').expect;
global.simple =         require('simple-mock');

global.mock = simple.mock;