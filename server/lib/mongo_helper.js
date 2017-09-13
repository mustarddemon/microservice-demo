const Promise = require('bluebird');
const MongoDB = require('mongodb');
const _ = require('lodash');
const winston = require('winston');
winston.level = process.env.LOG || 'info';

const databases = {};
const domain = process.env.MONGO_HOST || 'localhost';
const port = process.env.MONGO_PORT || '27017';
Promise.promisifyAll(MongoDB);

// utility for setting the mongodb connection string
const baseURI = (() => {
  return `mongodb://${domain}:${port}`;
})();

/**
 * Abstract form to handle generic methods
 * associated with a single database connection
 * in MongoDB.
 *
 * @example
 * const MongoHelper = require('ha-auto-utils/lib/mongo');
 * const scattershotLoadDB = new MongoHelper('scattershot-load-results');
 * // scattershotLoadDB.connect(<your callback here, if you'd like>);
 *
 * @param databaseName
 * @constructor
 */
function MongoHelper(databaseName) {

  /**
   * Each helper is intended to be associated with a single db in MongoDB.
   * this.databaseName is a reference to the db for later use.
   */
  this.databaseName = databaseName;

  /**
   * Add the database object (passed as an argument) to the static
   * databases object for referencing later on.
   *
   * @param database
   */
  this.init = database => {
    const databaseName = database.databaseName;
    if (!databases[database]) {
      databases[databaseName] = database;
    }
  };

  /**
   * Make the connection to the db defined by this.databaseName.
   *
   * Calls {@link #init} to add the database to the databases object.
   *
   * @param callback
   */
  this.connect = callback => {
    if (databases[this.databaseName]) {
      return;
    }

    MongoDB.MongoClient.connect(`${baseURI}/${this.databaseName}`, (err, database) => {
      if (err) throw err;

      this.init(database);

      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  /**
   * Get the database connection object
   * @param dbName
   * @returns {*}
   */
  this.getDb = dbName => {
    if (dbName && databases[dbName]) {
      return Promise.resolve(databases[dbName]);
    }
    return Promise.reject(`Could not find a connection for ${dbName}`);
  };

  /**
  * Insert a single record into the provided collection.
  *
  * @param db
  * @param collection
  * @param data
  * @returns {*|{document}|Promise}
  */
  this.insertRecord = (db, collection, data) => {
    winston.debug(`Inserting ${data} into ${collection}`);
    return db.collection(collection).insertOne(data);
  };


}

/**
 * Keeping track of the MongoDB databases that are currently connected.
 * @returns {Object}
 */
MongoHelper.getDatabases = () => {
  // clone to avoid corruption, freeze to prevent additions
  return Object.freeze(_.cloneDeep(databases));
};

module.exports = MongoHelper;
