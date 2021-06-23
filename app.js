const {Client, Intents, MessageEmbed} = require('discord.js');
const config = require('./config.json');
const Strings = require('./resources/strings_en.js');
const EmbedUtils = require('./dependencies/EmbedUtils.js');
const { createNewButton, createButtonRow } = require('./dependencies/ButtonManager');
const AdminDBUtils = require('./dependencies/AdminDatabaseUtils.js');
const ResponseDBUtils = require('./dependencies/ResponseDatabaseUtils.js')


const intents = new Intents();
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const weekendDays = ["Saturday", "Sunday"];

intents.add('GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILDS');
const discordClient = new Client({ intents: intents });
discordClient.login(config.token);

discordClient.on('ready', () => {
    console.log('Face Pulled bot successfully online');
});

discordClient.on('message', async message => {
    if (!discordClient.application?.owner) await discordClient.application?.fetch();

    if (message.content.toLowerCase() === '!setupadmin' && message.author.id === discordClient.application?.owner.id) {
        const setupEmbed = setupAdmin();
        await message.channel.send({
             embed: setupEmbed[0],
             components: [setupEmbed[3], setupEmbed[2], setupEmbed[1]]
         })
        message.delete();
    }
    else if (message.content.toLowerCase() === '!setupplayer' && message.author.id === discordClient.application?.owner.id) {
        const setupEmbed = setupPlayers(message.guild.id);
        let components = [];
        setupEmbed[1].forEach(element => {
            components.push(element);
        })
        await message.channel.send({
            embed: setupEmbed[0],
            components: components
        })
        message.delete();
    }
});

discordClient.on('interaction', async interaction => {
	if (!interaction.isMessageComponent() && interaction.componentType !== 'BUTTON') return;
    const embed = interaction.message.embeds[0];
    const interactionString = interaction.customID.split("_");
    const serverID = interaction.guild.id;

    if(interactionString.includes("timeSetup") || interactionString.includes("daySetup"))
        configurationEmbedInteractionHandler(interactionString, embed, serverID, interaction);

    if(interactionString.includes("playerAvailability"))
        playerAvailabilityHandler(embed, interaction);

    interaction.deferUpdate();
});

const playerAvailabilityHandler = async (embed, interaction) => {
    const serverID = interaction.guild.id;
    const player = interaction.user.username;

    const interactionDate = interaction.customID.split("_")[0];
    const interactionTime = interaction.customID.split("_")[1];

    ResponseDBUtils.addDataToArrayByKey(serverID, interactionDate, interactionTime, player);
    const table = ResponseDBUtils.postResponses(serverID, interactionDate);

    const content = `Face Pulled: Team Schedule **Monday (06/21)**:\n\`\`\`${table}\`\`\``;
    await interaction.message.edit({
        content: content
    });
}

const configurationEmbedInteractionHandler = async (interactionString, embed, serverID, interaction) => {
    let db_key = "";
    let field = null;
    let index = -1;
    //Include a new time slot into the field 
    if(interactionString.includes("timeSetup")) {
        db_key = config.db_keys_timesofday;
        field = embed.fields[1];
        index = 1;
    } 
    //Otherwise include a day
    else if(interactionString.includes("daySetup")) {
        db_key = config.db_keys_daysofweek;
        field = embed.fields[0];
        index = 0;
    }
    const toggledElements = getToggledElements(serverID, db_key, interactionString[0]);
    const updatedField = generateUpdatedField(field, toggledElements);
    embed.fields[index] = updatedField;
    
    await interaction.message.edit({
        embed: embed
    });
}

const getToggledElements = (serverID, db_key, data) => {
    AdminDBUtils.addDataToArrayByKey(serverID, db_key, data);
    return AdminDBUtils.getToggledEntries(serverID, db_key);
}

const generateUpdatedField = (field, v) => {
    let value = Strings.EMPTY_STRING;
    if(v.length > 0) {
        value = "";
        v.forEach(function(element) {
            value += element.key + "\n";
        });
    }
    value = value.trimRight();
    return EmbedUtils.buildEmbedField(field.name, value, field.inline);
}

const setupAdmin = () => {
    const embed = EmbedUtils.createEmbed(Strings.SETUP_TITLE, Strings.SETUP_DESCRIPTION, Strings.SETUP_FOOTER);
    embed.addField("Days of the week", Strings.EMPTY_STRING, false);
    embed.addField("Times of the day", Strings.EMPTY_STRING, false);
    
    let hoursArray = [];
    for(i = 7; i < 12; i++) {
        const ampm = i<12?"pm":"am";
        if(i < 11) {
            hoursArray.push(createNewButton(
                i+"-"+(i+1)+"_timeSetup_btnID",
                i+ampm+" to "+(i+1)+ampm,
                Strings.BUTTON_SUCCESS
            ));
        }
        else {
            hoursArray.push(createNewButton(
                i+"-"+(i+1)+"_timeSetup_btnID",
                i+ampm+" to "+(i+1)+"am",
                Strings.BUTTON_SUCCESS
            ));
        }
    }

    let weekdaysArray = [];
    weekdays.forEach(element => {
        weekdaysArray.push(createNewButton(
            element+"_daySetup_btnID",
            ""+element,
            Strings.BUTTON_PRIMARY
        ))
    });
        
    let weekendDaysArray = [];
    weekendDays.forEach(element => {
        weekendDaysArray.push(createNewButton(
            element+"_daySetup_btnID",
            ""+element,
            Strings.BUTTON_SECONDARY
        ))
    });
    return [embed, createButtonRow(hoursArray), createButtonRow(weekdaysArray), createButtonRow(weekendDaysArray)];
}

const setupPlayers = (serverID) => {
    const embed = EmbedUtils.createEmbed(Strings.SETUP_PLAYER_TITLE, Strings.SETUP_PLAYER_DESCRIPTION, Strings.SETUP_FOOTER);
    const toggledDays = AdminDBUtils.getToggledEntries(serverID, config.db_keys_daysofweek);
    const toggledTimes = AdminDBUtils.getToggledEntries(serverID, config.db_keys_timesofday);

    let buttonArr = [];
    let buttonRowArr = [];

    for(let i = 0; i < toggledTimes.length; i++) {
        const subStr = toggledDays[0].key.substring(0,3);
        const hours = toggledTimes[i].key.split("-");
        hours.forEach((element, index) => {
            if(hours[index].length < 2) {
                hours[index] = `0${element}`;
            }
        })
        buttonArr.push(createAvailabilityButton(subStr, hours, 0));
    }
    buttonRowArr.push(buttonArr);

    return [embed, buttonRowArr];
}

const getDateByWeekday = (dayOfWeek) => {
    const daysEnum = Object.freeze({
        "Sun": 0,
        "Mon": 1,
        "Tue": 2,
        "Wed": 3,
        "Thu": 4,
        "Fri": 5,
        "Sat": 6,
    })
    
    /*
    0 = Sunday
    6 = Saturday
    */
    let date = new Date();
    date.setDate(date.getDate() + (daysEnum[dayOfWeek] + 7 - date.getDay())%7);
    return date;
}

const createAvailabilityButton = (dayLabel, hours, even) => {
    let label = "";//dayLabel + ": ";
    const ampm = [hours[0]<12?"pm":"am", hours[1]<12?"pm":"am"];

    if(hours[0] === "10" && hours[1] === "11") {
        label = `\u00A0\u00A0\u00A0${label+hours[0]+ampm[0]} to ${hours[1]+ampm[1]}\u00A0\u00A0\u00A0`;
    }
    else if(hours[0] === "09" && hours[1] === "10") {
        label = `\u00A0${label+hours[0]+ampm[0]} to ${hours[1]+ampm[1]}\u00A0`;
    }
    else if(hours[0] === "11" && hours[1] === "12") {
        label = `\u00A0\u00A0\u00A0\u00A0${label+hours[0]+ampm[0]} to ${hours[1]+ampm[1]}\u00A0\u00A0\u00A0`;
    }
    else {
        label = `${label+hours[0]+ampm[0]} to ${hours[1]+ampm[1]}`;
    }

    const nextDate = getDateByWeekday(dayLabel);

    const buttonColor = even === 0? Strings.BUTTON_PRIMARY : Strings.BUTTON_SUCCESS;
    return createNewButton(
        `${nextDate.getMonth()+1}-${nextDate.getDate()}_${hours[0]+"-"+hours[1]}_playerAvailability_btnID`,
        label,
        buttonColor
    )
}