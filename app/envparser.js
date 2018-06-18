'use stricts';

require('dotenv').config({ silent: true });

module.exports = {
    get: (key, defaultValue) => {

        let out = process.env[key] || defaultValue;

        //force to 0 if string false taken
        out = ['false'].includes(out) ? false : out;
        out = ['true'].includes(out) ? true : out;

        return out;
    }
};
