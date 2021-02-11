/**
 * name : index.js
 * author : Aman Karki
 * created-date : 20-July-2020
 * Description : Configurations related information.
*/

/**
  * Mongodb Database configuration.
  * @function
  * @name mongodb_connect
  * @param {Object} configuration - mongodb database configuration.
*/

const mongodb_connect = function (configuration) {
  
  global.database = require("./db/mongodb")(
    configuration
  );

  global.ObjectId = database.ObjectId;
  global.Abstract = require("../generics/abstract");
};

/**
  * Cassandra Database configuration.
  * @function
  * @name db_connect
  * @param {Object} configuration  - configuration data for cassandra.
*/

// let cassandra_connect = function (configuration) {
//   global.cassandraDatabase = require("./db/cassandra")(configuration);
//   if( !global.Abstract ){
//     global.Abstract = require(process.env.PATH_TO_ABSTRACT_FILE);
//   }
// };

/**
  * Elastic search configuration.
  * @function
  * @name elasticsearch_connect
  * @param {Object} configuration - elastic search configuration.
*/

let elasticsearch_connect = function (configuration) {
  global.elasticsearch = require("./db/elastic-search")(
    configuration
  );
};

// Configuration data.

const configuration = {
  mongodb: {
    host : process.env.MONGODB_URL,
    port : process.env.MONGODB_PORT,
    database : process.env.MONGODB_DATABASE_NAME
  },
  cassandra: {
    host: process.env.CASSANDRA_HOST,
    port:process.env.CASSANDRA_PORT,
    keyspace: process.env.CASSANDRA_DB,
  },
  elasticSearch: {
    host : process.env.ELASTICSEARCH_HOST_URL
  }
};

mongodb_connect(configuration.mongodb);
// cassandra_connect(configuration.cassandra);
elasticsearch_connect(configuration.elasticSearch);

module.exports = configuration;
