const Promise = require('bluebird');
const mysql = require('mysql');
const winston = require('winston');
const dbConfig = require('../../config/mySqlDbConfig');
winston.level = process.env.LOG || 'info';

process.on('SIGINT',function(){
  process.exit(0);
});

module.exports = {

  runQuery: function(query) {
    //Switch DB info based on env

    return new Promise(function(resolve, reject) {
      let connection = mysql.createConnection({
        user          : dbConfig.user,
        password      : dbConfig.password,
        host : dbConfig.host,
        database: dbConfig.database
      }, function(error) {
        if (error) {
          return reject(error);
        }
      });

      connection.connect();
      connection.query(query, function(error, results, fields) {
        if (error) {
          connection.end();
          return reject(error);
        }
        connection.end();
        return resolve({
          query: query,
          results: results,
          fields: fields
        });
      });
    });
  },

};
