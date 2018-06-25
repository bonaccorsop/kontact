'use strict';

class ServiceError extends Error {

    constructor(message, code, fileName, lineNumber)
    {
        super(message, fileName, lineNumber);
        this.code = code;
    }

    getCode() {
        return this.code;
    }

}

module.exports = ServiceError;