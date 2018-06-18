'use strict';

const request = require('request');

module.exports = class HTTPClient {

  constructor(baseUrl, logger = null) {
    this.baseUrl = baseUrl;
    this.logger = logger;
  }

  // ##########
  // # Public
  // ##########

  performGetRequest(url, options = {}) {
    return this._performRequest(Object.assign(options, {
      url,
      method: 'GET'
    }));
  }

  performPostJsonRequest(url, jsonData, options = {}) {
    return this._performRequest(Object.assign(options, {
      url,
      method: 'POST',
      json: jsonData
    }));
  }

  performPostFormdataRequest(url, formData, options = {}) {
    return this._performRequest(Object.assign(options, {
      url,
      method: 'POST',
      formData
    }));
  }


  performDeleteRequest(url, formData, options = {}) {
    return this._performRequest(Object.assign(options, {
      url,
      method: 'DELETE',
      formData
    }));
  }

  // ##########
  // # Private
  // ##########

  resolveUrl(uri) {
    return this.baseUrl + uri;
  }

  _performRequest(options) {

    // make request
    return new Promise((resolve, reject) => request(options, (err, resp, body) => {

      if(err) {
        reject(err);
      } else {
        let statusCode = resp.statusCode;

        if (statusCode > 399) {
          reject({
            status: 'error',
            code: statusCode,
            content: body,
          })
        }

        resolve(resp);
      }

    }))

    // format response according to response content type
    .then(resp => {
      let contentType = resp.headers['content-type'];
      let body = resp.body;

      switch (contentType) {
        case "application/json":
          body = typeof body == 'object' ? body : JSON.parse(body);
      }

      return {
        body,
        rawBody: resp.body,
        headers: resp.headers,
        statusCode: resp.statusCode,
        contentType: resp.headers['content-type'],
      };

    })
  }



}
