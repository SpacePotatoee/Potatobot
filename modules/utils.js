const bot = require("../index.js")
const fs = require("node:fs")

const maintainers = require("../maintainers.json")

const {ButtonBuilder, EmbedBuilder} = require("discord.js")

class Utils {
    constructor(config) {
        this.config = config
    }
    
    async fetchServer() {
        return await bot.client.guilds.fetch("1251520688569974914")
    }

    /**
     * Sets PotatoBots nickname
     * @param {string} name 
    */
    async setName(name) {
        //const server = await (await (await bot.client.guilds.fetch("1251520688569974914")).members.fetch("1360807782001148134")).setNickname(name)
        (await (await bot.client.guilds.fetch("1251520688569974914")).members.fetch("1360807782001148134")).setNickname(name)
    }

        
    /**
     * Creates a button with the selected parameters. When creating a link button pass "customId" as null and when not then ignore the url arg
     * @param {string} label 
     * @param {string} style 
     * @param {string} customId 
     * @param {string} URL 
     * @returns Button
     */
    createButton(label, style, customId, URL) {
        if (style === "Link") {
            return (
                new ButtonBuilder()
                    .setLabel(label)
                    .setURL(URL)
                    .setStyle(style)
            )
        }
        return (
            new ButtonBuilder()
                .setLabel(label)
                .setCustomId(customId)
                .setStyle(style)
        )
    }

    /**
     * Use this to create a hotloading config instance
     * @returns JSON - Live Updating Config File
     */
    liveConfig() {
        return JSON.parse(fs.readFileSync("./config.json"))
    }

    /**
     * Sets a random status for potatobot.
     */
    setRandomStatus() {
        bot.client.user.setActivity("Ping for FAQ | "+this.liveConfig().status[Math.floor(Math.random()*this.liveConfig().status.length)])
    }

    async sendError(code, error, color) {
        for(let i = 0; i < maintainers.length; i++){
            const maintainer = await bot.client.users.fetch(maintainers[i])

            const embed = new EmbedBuilder()
                .setTitle(code)
                .setDescription(`${error}`)
                .setTimestamp()
                .setColor(color)
            
            maintainer.send({embeds:[embed]})
        }
    }

    
    /**
     * Checks if a message contains ANY phrase in config.main_filter
     * @param {Message} message 
     * @returns boolean
     */
    filterCheck(message) {
        const live_config = JSON.parse(fs.readFileSync("./config.json"))
        for (var i = 0; i < live_config.main_filter.length; i++) {
            if (message.content.toLowerCase().includes(live_config.main_filter[i])) {
                console.log(`${message.author.username} said ${live_config.main_filter[i]}`)
                return true
            }
        }
        return false
    }
}

module.exports.Utils = Utils