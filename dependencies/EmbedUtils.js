const {MessageEmbed} = require('discord.js');

const createEmbed = (title, description, footer) => {
	return new MessageEmbed().setColor("#41C2FF")
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
        .setFooter(footer)
}

const buildEmbedField = (k, v, i) => {
    return { name: k, value: v, inline: i};
}

exports.createEmbed = createEmbed;
exports.buildEmbedField = buildEmbedField;