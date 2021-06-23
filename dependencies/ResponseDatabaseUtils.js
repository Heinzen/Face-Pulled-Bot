const { table } = require('table');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const { JsonDB } = require('node-json-db');
const dbUtils = require('./DBUtils')
const appConfig = require ('../config.json');

const config = {
    drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === 2 || lineIndex === rowCount;
    },
    header: {
        alignment: 'center', 
        content: 'FACE PULLED\nTeam schedule for Monday (06/21)'
    }
  }

//I should go to jail for this function, this is literally a crime and I should not be allowed to do this
const getScheduleByDay = (serverID, date) => {
    const db = dbUtils.dbConnectionFactory(appConfig.response_db_filename);
    const fullQuery = dbUtils.buildBaseQuery(serverID) + date;

    let scheduleArray = [];
    try {
        scheduleArray = db.getData(fullQuery);
    }
    catch(e) {
        console.error(e.stack.split("\n", 1).join(""));
    }
    
    let sortable = Object.entries(scheduleArray)
                    .sort(([a,],[b,]) => {
                        let first = a.split("-")[0];
                        let second = b.split("-")[0];
                        return first - second;
                    });

    sortable.forEach((element, index) => {
        for(let i = element[1].length; i < element[0].length; i++)
            element[1].push('');
    });

    sortable = sortable[0].map((_, colIndex) => sortable.map(row => row[colIndex]));
    const availabilityTable = sortable[1].map((_, colIndex) => sortable[1].map(row => row[colIndex]));
    const times = sortable[0];

    return [times, ...availabilityTable];
}

const addDataToArrayByKey = (serverID, date, time, player) => {
    const db = dbUtils.dbConnectionFactory(appConfig.response_db_filename);
    const fullQuery = dbUtils.buildBaseQuery(serverID) + date + "/" + time;

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
}

const postResponses = (serverID, date) => {
    const input = getScheduleByDay(serverID, date);
    const out = table(input,config);

    console.log(out);
}

exports.config = config;
exports.addDataToArrayByKey = addDataToArrayByKey;
exports.postResponses = postResponses;