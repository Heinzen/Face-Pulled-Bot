const {MessageButton, MessageActionRow} = require('discord.js');

const createNewButton = (customID, label, style) => {
    return new MessageButton()
        .setCustomID(customID)
        .setLabel(label)
        .setStyle(style)
}

const createButtonRow = (buttonArray) => {
    if(buttonArray.length > 5) {
        return;
    }

    const row = new MessageActionRow()
        .addComponents(buttonArray);
    return row;
}

exports.createNewButton = createNewButton;
exports.createButtonRow = createButtonRow;