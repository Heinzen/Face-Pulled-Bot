const { table } = require('table');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const { JsonDB } = require('node-json-db');
const dbUtils = require('./DBUtils')
const appConfig = require ('../config.json');

const getAvailableMembersByTime = (query) => {

}

const addDataToArrayByKey = (serverID, date, time, player) => {
    const db = dbUtils.dbConnectionFactory(appConfig.response_db_filename);
    const fullQuery = dbUtils.buildBaseQuery(serverID) + date + "/" + time;
    let index = -1;

    let data = [];
    try {
        data = db.getData(fullQuery);
    }
    catch (e) {
        console.error(e.stack.split("\n", 1).join(""));
        console.log("Adding new entry to Database");
        db.push(fullQuery+"[]", player, true);
    }

    //Player already exists for schedule. Remove
    if(data.includes(player)) {
        data.splice(data.indexOf(player), 1);
    }
    else {
        data.push(player);
    }
    db.push(fullQuery, data, true);

    // const data = {}
    // data[time] = [player];

    // try{ 
    //     db.push(fullQuery, data, true);
    // } catch(e) {
    //     console.log(e);
    // }

    // const ret = db.getData("/arraytest/myarray[0]");
    // console.log(ret.key[0]);
    // try {
    //     index = dbUtils.getIndexOfArrayElement(serverID, key, player, appConfig.response_db_filename);
    // }
    // catch (e) {
    //     console.error("Database was empty.");
    // }
    //     //If the element has not been initialized yet, include it in the database
    //     if(index === -1) {
    //         const data = {
    //             "key": player,
    //             "toggle": true
    //         }  
        
    //         console.log(`Running configuration query ${fullQuery}[${index}] | key: ${data.key}`);
    //         db.push(fullQuery+"[]", data, true);
    //     }
    //     //Otherwise, flip the toggle
    //     else {
    //         const data = db.getData(`${fullQuery}[${index}]`);
    //         const newData = flipObjectToggle(data);
    //         db.push(`${fullQuery}[${index}]`, newData, true);
    //     }
}

const config = {
    drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === 2 || lineIndex === rowCount;
    },
    header: {
        alignment: 'center', 
        content: 'FACE PULLED\nTeam schedule for Monday (06/21)'
    }
  }

const test = (config) => {
    const data = [
        ['07:00 to 08:00 PM', '08:00 to 09:00 PM', '09:00 to 10:00 PM', '10:00 to 11:00 PM', '11:00 to 12:00 AM'],
        ['Name1', 'Name1', 'Name1', 'Name1', 'Name1'],
        ['Name2', 'Name2', 'Name2', 'Name2', 'Name2'],
        ['Name3', 'Name3', 'Name3', 'Name3', 'Name3'],
        ['Name4', 'Name4', 'Name4', 'Name4', 'Name4']
    ];
    
    return(table(data, config));
}

exports.config = config;
exports.test = test;
exports.addDataToArrayByKey = addDataToArrayByKey;