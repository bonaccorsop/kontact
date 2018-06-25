'use strict';

const _ = require('lodash');

 class MyObject {

    static isSet(obj, key) {
        return ! (typeof obj[key] === 'undefined' || typeof obj[key] === 'not available');
    }

    static get(obj, key, def = undefined) {
        return this.isSet(obj, key) ? obj[key] : def;
    }

    static cleanProps(obj) {
        return _.pickBy(obj, val => typeof val !== 'undefined');
    }

}


module.exports = MyObject;