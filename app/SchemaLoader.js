'use strict';

const fs = require('fs');

module.exports = class SchemaLoader {

    constructor(mongoose) {
        this.models = {};
        this.mongoose = mongoose;
        this.onComplete = null;
    }

    setUp (callback) {

        return new Promise((resolve, reject) => {
            fs.readdir('./app/Models', (error, files) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(files);
                }
            });
        })
        .then(files => {
            files.forEach((filename) => {
                let modelName = filename.replace('Model.js', '');
                this.models[modelName] = this.mongoose.model(modelName, require('./Models/' + filename));
            });

            return files;
        })

    }

    onSuccess(callback) {
        this.onComplete = callback;
        return this;
    }

    getConnection() {
        return this.mongoose;
    }

    getModel(modelName) {
        return this.models[modelName];
    }
}