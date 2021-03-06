const Promise = require('bluebird');
const oracledb = require('oracledb');
const winston = require('winston');
const dbConfig = require('../../config/oracleDbConfig');
winston.level = process.env.LOG || 'info';

process.on('SIGINT',function(){
  process.exit(0);
});

module.exports = {

  runQuery: function(query) {
    //Switch DB info based on env

    return new Promise(function(resolve, reject) {
      oracledb.getConnection({
        user          : dbConfig.username,
        password      : dbConfig.password,
        connectString : dbConfig.connectString
      }, function(err, connection) {
        //if connection failed return error
        if (err) {
          return reject(err);
        }
        //run our query
        connection.execute(query,[], { maxRows: 100, outFormat: oracledb.OBJECT }, function(err, result) {
          if (err) {
            return connection.release(function(err2) {
              // reject with release error, or execute error
              return reject(err2 || err);
            });
          }
          let records = result.rows;
          return connection.release(function(err) {
            if (err) {
              winston.log('warn', 'error releasing connection');
              return reject(err);
            }
            return resolve({
              query: query,
              records: records
            });
          });
        });
      });
    });
  },

};
