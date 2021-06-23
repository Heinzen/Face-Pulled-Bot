const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const { JsonDB } = require('node-json-db');
const appConfig = require('../config.json');

const dbConnectionFactory = (database) => {
    const filename = database;
    return new JsonDB(new Config(filename, true, true, '/'));
}

const buildBaseQuery = (serverID) => {
    return appConfig.db_separator + serverID + appConfig.db_separator;
}

const getIndexOfArrayElement = (serverID, query, data, database) => {
    const db = dbConnectionFactory(database);
    const fullQuery = buildBaseQuery(serverID) + query;
    return db.getIndex(fullQuery, data, "key");
}

const removeDataFromArray = (serverID, key, data, database) => {
    const db = dbConnectionFactory(database);
    const fullQuery = buildBaseQuery(serverID) + key;
    const index = db.getIndex(fullQuery, data, "day");
}

exports.dbConnectionFactory = dbConnectionFactory;
exports.buildBaseQuery = buildBaseQuery;
exports.getIndexOfArrayElement = getIndexOfArrayElement;
exports.removeDataFromArray = removeDataFromArray;