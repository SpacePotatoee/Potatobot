// righty ho time to declutter and move code that will be reused at future points
// also it would be advised that before new mods release that we should have time to add things to a "predicted" FAQ

//! When trying to access things like client.on or anything to do with client you MUST use bot.client
const bot = require("./index.js")

const {ButtonBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, REST, Routes, Collection} = require("discord.js")
const fs = require("node:fs")
const maintainers = require("./maintainers.json")


const {Faq} = require("./modules/faq.js"); const faq = new Faq()
const {Utils} = require("./modules/utils.js"); const util = new Utils()

const {Channels} = require("./modules/channels.js"); const channels = new Channels("./last_updated.json")


class Potatobot {

    constructor (token,config) {
        this.token = token
        this.config = config
    }
    
    /**
     * Sends the FAQ selector
     * @param {Message} Input the message class
     */
    faq(msg) {
        faq.faq(msg)
    }
  
    /**
     * Checks if a message contains ANY phrase in config.main_filter
     * @param {Message} message 
     * @returns boolean
     */
    filterCheck(message) {
        util.filterCheck(message)
    }
    
    /**
     * Automatically sends a message in the Mod Updates channel whenever one of my mods gets updated
     */
    modUpdater() {
        channels.modUpdater()
    }

    /**
     * Returns SpacePotato's subscriber count and assigns to specified channel
     * @param {string} token 
     */
    getSubscriberCount() {
        channels.getSubscriberCount()
    }

    spambotChecker() {
        channels.spambotChecker()
    }

    sendError(code, error, color) {
        util.sendError(code, error, color)
    }

    /**
     * Detects when a member joins and sends a welcome message
     */
    welcomer() {
        channels.welcomer()
    }

    /**
     * Sets a random status for potatobot.
     */
    setRandomStatus() {
        util.setRandomStatus()
    }

    maintenanceMode(msg) { // cba moving this, just gonna keep it here for now

        if (!maintainers.includes(msg.author.id)) {return}

        let upd_config = JSON.parse(fs.readFileSync("./maintenancetoggle.json"))
        
        if (msg.content.toLowerCase().includes("on")) {
            upd_config.maintenance = true
            util.setName("Under Development")
            fs.writeFileSync("./maintenancetoggle.json",JSON.stringify(upd_config,null,4))
            return
        }

        if (msg.content.toLowerCase().includes("off")) {
            upd_config.maintenance = false
            util.setName("FAQ | PotatoBot")
            fs.writeFileSync("./maintenancetoggle.json",JSON.stringify(upd_config,null,4))
            return
        }
        return
    }

    get checkMaintenanceStatus() {
        return JSON.parse(fs.readFileSync("./maintenancetoggle.json")).maintenance
    }

    

}

//


module.exports.Potatobot = Potatobot
