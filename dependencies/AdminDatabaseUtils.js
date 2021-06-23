const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const { JsonDB } = require('node-json-db');
const dbUtils = require('./DBUtils')
const appConfig = require('../config.json');

const addDataToArrayByKey = (serverID, key, entry) => {
    const db = dbUtils.dbConnectionFactory(appConfig.admin_db_filename);
    const fullQuery = dbUtils.buildBaseQuery(serverID) + key;
    let index = -1;
    
    try {
        index = dbUtils.getIndexOfArrayElement(serverID, key, entry, appConfig.admin_db_filename);
    }
    catch (e) {
        console.error("Database was empty.");
    }

    //If the element has not been initialized yet, include it in the database
    if(index === -1) {
        const data = {
            "key": entry,
            "toggle": true
        }  
    
        console.log(`Running configuration query ${fullQuery}[${index}] | key: ${data.key}`);
        db.push(fullQuery+"[]", data, true);
    }
    //Otherwise, flip the toggle
    else {
        const data = db.getData(`${fullQuery}[${index}]`);
        const newData = flipObjectToggle(data);
        db.push(`${fullQuery}[${index}]`, newData, true);
    }
}

const flipObjectToggle = (object) => {
    return { 
        "key": object.key,
        "toggle": !object.toggle
    };
}

const getToggledEntries = (serverID, key) => {
    const db = dbUtils.dbConnectionFactory(appConfig.admin_db_filename);
    const fullQuery = dbUtils.buildBaseQuery(serverID) + key;
    const data = db.getData(fullQuery);

    let toggledElements = [];
    data.forEach(function(element) {
        if(element.toggle === true) {
            toggledElements.push(element);
        }
    })
    return toggledElements;
}

exports.getToggledEntries = getToggledEntries;
exports.addDataToArrayByKey = addDataToArrayByKey;