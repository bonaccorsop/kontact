'use strict';

const { Types } = require('mongoose');
const Rx = require('rx');

module.exports = class MongoRepository {

  constructor(schemas) {

    this.Rx = Rx;
    this.schemas = schemas;
    this.slugKey = '';
    this.populate = '';

    /**
     * @param String modelName
     * @param Object filterExp
     * @param Numeric pagelen
     * @param Numeric page
     * @return Observable<Array>
     */
    this.get$ = (modelName, filterExp, pagelen = null, page = null, populate = null) => {
      return this.Rx.Observable.defer(() => {
        //let pop = populate ? populate : this.populate;

        let sortRules = filterExp.__sort;
        delete filterExp.__sort;

        let query = this.schemas.getModel(modelName).find(this.resolveFilterExp(filterExp))
        //.populate(pop);

        if (pagelen) {
          pagelen = parseInt(pagelen);
          page = parseInt(page);
          query.skip(pagelen * (page - 1)).limit(pagelen);
        }

        if (typeof sortRules === 'object') {
          query.sort(sortRules);
        }

        return query.exec();
      });
    }

    /**
    * @param String modelName
    * @param Object filterExp
    * @return Observable<int>
    */
    this.count$ = (modelName, filterExp) => {
      return this.Rx.Observable.defer(() => {
        return this.schemas.getModel(modelName).count(this.resolveFilterExp(filterExp));
      });
    }

    /**
     * @param String modelName
     * @param String id
     * @return Observable<Object>
     */
    this.findById$ = (modelName, id, populate) => {
      let pop = populate ? populate : this.populate;
      return this.Rx.Observable.defer(() => this.schemas.getModel(modelName).findById(id).populate(pop).exec());
    }

    /**
     * @param String modelName
     * @param Object datas
     * @return Observable<Boolean>
     */
    this.write$ = (modelName, data, populate) => {
      let Model = this.schemas.getModel(modelName);
      let model = new Model(data);
      return this.Rx.Observable.defer(() => model.save())
        .map(status => model)
    }


  }

  getModel() {
    return this.schemas.getModel(this.modelName);
  }

  aggregate$(pipeline, options = {}) {
    return this.Rx.Observable.create(obs$ => {
      return this.getModel().aggregate(pipeline).exec()
        .then(res => {
          obs$.onNext(res);
          obs$.onCompleted()
        })
        .catch(err => { obs$.onError(err) })
    })

    //return this.Rx.Observable.defer(this.getModel().aggregate(pipeline).exec());
  }

  // // returns Promise
  // getNativeCollection() {

  //   let collectionName = this.getModel().collection.collectionName;
  //   return Promise.resolve((resolve, reject) => {
  //     mongoose.connection.db.collection(collectionName, (err, collection) => {
  //       err ? reject(err) : resolve(collection);
  //     });
  //   })
  // }

  /**
   * @param String id
   * @return Observable
   */
  find$(id) {
    id = id instanceof Types.ObjectId ? id : Types.ObjectId(id);
    return this.findById$(this.modelName, id);
  }

  /**
   * @param String modelName
   * @param Object findExp
   * @return Observable<Object>
   */
  first$(filterExp, sort = null) {
    return this.Rx.Observable.defer(() => {
      //let pop = populate ? populate : this.populate;

      return this.schemas.getModel(this.modelName)
        .findOne(this.resolveFilterExp(filterExp))
        //.populate(pop)
        .exec()
    })
  }

  /**
   * @param Object findExp
   * @param Object data
   * @return Observable<Object>
   */
  update$(filterExp, data) {
    return this.Rx.Observable.defer(() => this.schemas.getModel(this.modelName)
      .update(this.resolveFilterExp(filterExp), data));
  }

  /**
   * @param int pagelen
   * @param int page
   * @return Observable
   */
  getAll$(pagelen, page, filterExp = {}) {
    return this.get$(this.modelName, filterExp, pagelen, page);
  }

  getMany$(filterExp = {}) {
    return this.get$(this.modelName, filterExp);
  }

  /**
   * @param Object filterExp
   * @return Observable<Number>
   */
  getCount$(filterExp = {}) {
    return this.count$(this.modelName, this.resolveFilterExp(filterExp));
  }

  /**
   * @param Object filterExp
   * @param int pagelen
   * @param int page
   * @return Observable
   */
  getFiltered$(filterExp = null, pagelen, page) {
    return this.get$(this.modelName, filterExp, pagelen, page);
  }

  /**
   * @param Object data
   * @return Observable
   */
  store$(data) {
    return this.write$(this.modelName, data);
  }

  findOrCreate$(condition, data) {
    return this.first$(condition)

      .flatMap(item => {
        if (item) {
          //Then, Return it
          return this.Rx.Observable.of(item)
            .map(item => Object.assign(item, { __created: false }))
        } else {
          //Else, Create it and return it
          return this.store$(data)
            .map(item => Object.assign(item, { __created: true }))
        }
      });
  }

  updateOrCreate$(condition, data) {

    return this.first$(condition)

      .flatMap(oldData => {
        if (oldData) {
          //Then, Update it
          return this.update$(oldData.get('id'), data)
            .flatMap(updateStatus => this.first$(oldData.get('id')))
            .map(newData => Object.assign(newData, { __created: false, __updated: true, __oldData: oldData }));
        } else {
          //Else, Create it and return it
          return this.store$(data)
            .map(item => Object.assign(item, { __created: true, __updated: false }));
        }
      });

  }

  isObjectIdString(str) {
    return typeof str === 'string' && /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i.test(str);
  }

  resolveFilterExp(exp) {

    let out = null;

    if (exp instanceof Types.ObjectId) {
      // ObjectId
      out = { _id: exp };
    } else if (this.isObjectIdString(exp)) {
      // stringified ObjectId
      out = { _id: Types.ObjectId(exp) };
    } else if (typeof exp === 'object') {
      // query expression
      out = exp;
    } else {
      throw new Error(JSON.stringify(exp) + ' is not a valid filter expression...');
    }

    return out;

  }



}
