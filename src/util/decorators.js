/**
 * @module decorators.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

function Base(name) {
    return (obj) => { global.app[ name ](obj.name, obj); };
}

const Controller = Base('Controller'),
      directive = Base('directive');

export {
    Controller,
    directive
};