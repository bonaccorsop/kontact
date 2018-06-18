'use strict';

let slugify = require('slugify')

module.exports = {

    capitalize: (str) => {
        str += ''
        let f = str.charAt(0).toUpperCase()
        return f + str.toLowerCase().substr(1)
    },

    capitalizeWords: (str) => {
        return (str.toLowerCase() + '')
            .replace(/^(.)|\s+(.)/g, ($1) => {
                return $1.toUpperCase()
            })
    },

    capitalizeFirstLetter: (str) => {
        str += ''
        let f = str.charAt(0).toUpperCase()
        return f + str.substr(1)
    },

    capitalize: (str) => {
        return (str + '')
            .replace(/^(.)|\s+(.)/g, function ($1) {
                return $1.toUpperCase()
            })
    },

    toLowerCase: (str) => {
        return str.toLowerCase();
    },

    slugify: (str) => {
        return slugify(str.toString().toLowerCase());
    },

    isMongoId: ref => {
        let regexp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
        return regexp.test(ref);
    },

    generateRandomString: (length) => {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let text = "";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },
}