'use strict'; 'use strong';

function Base(name) {
    return (obj) => { global.app[ name ](obj.name, obj); };
}

const Controller = Base('Controller'),
      directive = Base('directive');

export {
    Controller,
    directive
};