const bot = require("../index.js")
const fs = require("node:fs")
const {ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder} = require("discord.js")

const {Utils} = require("./utils.js"); const util = new Utils()


let active_layer = ""

class Faq {
    constructor(config) {
        this.config = config
    }

    /**
     * Returns an object to create the select options
     * @returns object
     */
    createSelectOptions(layer) {
        console.log(Object.getPrototypeOf(this.getFaqLayer(layer)))
        let buffer = []
        const faq_layer = this.getFaqLayer(layer)
        for (var i = 0; i < Object.keys(faq_layer).length; i++) { // 4:20GMT istfg if i have to do the most jank ass solution to get this to work
            buffer.push({
                label:(faq_layer[ Object.keys(faq_layer) [i] ].fields[0].name),
                value:(Object.keys(faq_layer)[i].toString()) 
            })
        }

        return buffer
    }
    

    /**
     * Pass the name of the mod that is in the FAQ and then return its path
     * @param {string} layer 
     * @returns string - JSON PATH
     */
    getFaqLayer(layer) {
        if (Object.keys((util.liveConfig()).faq).includes(layer)) {
            active_layer = layer
        }

        if (layer === undefined) {
            active_layer = ""
            return (util.liveConfig()).faq
        } else {
            return eval("util.liveConfig().faq."+active_layer+".questions")
        }
    }

    createSelectMenu(layer) {
        return (new StringSelectMenuBuilder()
            .setCustomId('faq')
            .setPlaceholder('Select a Question')
            .setOptions(this.createSelectOptions(layer)))
    }

     /**
    * Creates the buttons for the corresponding mod FAQ
    * @param {string} layer 
    */
    createActionRow(layer) {
        const live_config = util.liveConfig()

        const another_row = new ActionRowBuilder()
            .addComponents(util.createButton("Back to Home", "Secondary", "home"))

        const selector_last_element = new ActionRowBuilder()
            .addComponents(this.createSelectMenu(layer))

        switch (active_layer) {
            default:
                return [another_row, selector_last_element]
            case "found_footage":
                const row = new ActionRowBuilder()
                    .addComponents(
                        //this.createButton("KNOWN ISSUES", "Primary", "issues"), 
                        util.createButton("Backrooms Wiki", "Link", null, live_config.links.wiki),
                        util.createButton("Use Mac?", "Link", null, live_config.links.wiki_mac),
                        util.createButton("Video Tutorial", "Link", null, live_config.links.wiki_install),
                        //block
                    )
                return [row, another_row, selector_last_element]

            case "some_mod":
                return [another_row, selector_last_element]
        }

        // const row = new ActionRowBuilder()
        //     .addComponents(issues, wiki, mac_not_working, tutorial, block)

        // const row2 = new ActionRowBuilder()
        //     .addComponents(this.createSelectMenu(layer))
        
    }

    /**
     * Sends the FAQ to the Found Footage mod
     * @param {Message} Input the message class
     */
    async faq(msg) {
        const live_config = util.liveConfig()
        
        const embed = new EmbedBuilder()
            .setColor(0xFFCC00)
            .setThumbnail(live_config.links.embed_image)
            .setTitle("Frequently Asked Questions")
            .addFields(
                { name:"What can I find here?", value:"You can find links to very important info below at all times.\nPlease select the desired mod below. Go back to this page by clicking \"Back to Home\""}
            )
        const response = await msg.reply({
            embeds: [embed] ,
            components: this.createActionRow(),
            withResponse: true,
            ephemeral: true
        });

        const timeout = 1200_000
        const collector = response.createMessageComponentCollector({time: timeout}); //add filter 

        setTimeout(() => {response.delete()}, timeout)

        collector.on('collect', async (i) => {

            const live_config = util.liveConfig()

            if (i.customId === "issues") {
                const embed = new EmbedBuilder()
                    .setTitle("Frequently Asked Questions")
                    .setColor(0xFFCC00)
                    .setThumbnail(live_config.links.embed_image)
                    .addFields(live_config.faq.important_note.fields)
                    .setFooter({text:"Click \"block\" if you dont want to see this anymore"})
                i.update({embeds:[embed], components:[row,row2], ephemeral: true})
                return
            }

            if (i.customId === "home") {
                i.update({
                    embeds: [embed] ,
                    components: this.createActionRow(),
                    withResponse: true,
                    ephemeral: true
                })
            }

            if (i.customId === "faq") {
                const selection = i.values[0];
                console.log(selection)
                try {

                    const row = this.createActionRow(selection)

                    console.log(active_layer)
                    console.log(selection)

                    let field_path = ".fields"
                    let image_path = ".image"

                    if ((active_layer !== "") && selection !== active_layer) {
                        field_path = ".questions."+selection+".fields"
                        image_path = ".questions."+selection+".image"
                    }

                    console.log([field_path, image_path])
                    //console.log(Object.keys(eval("live_config.faq."+selection+".questions.fields")))

                    const embed = new EmbedBuilder()
                        .setTitle("Frequently Asked Questions")
                        .setColor(0xFFCC00)
                        // .setThumbnail(live_config.links.embed_image)
                        .addFields(eval("live_config.faq."+active_layer+field_path))
                        .setFooter({text:"Click \"block\" if you dont want to see this anymore"})
                        .setImage(eval("live_config.faq."+active_layer+image_path) ?? null)

                    i.update({embeds:[embed], components:row, ephemeral: true})
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }
}

module.exports.Faq = Faq