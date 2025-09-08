const config = require("./config.json")
const { 
    Client,       GatewayIntentBits,        Partials,      EmbedBuilder, 
    Collection,    REST,  Routes,    ButtonBuilder,    ActionRowBuilder,
    StringSelectMenuBuilder,    MessageFlags,     ChannelType,   Events,
    ContainerBuilder, FileBuilder, SectionBuilder, SeparatorSpacingSize,
    TextDisplayBuilder
    } = require('discord.js');
const fs = require('fs');
// if you dont have a token.json file, create one and just do [<your token>]
const token = require("./token.json")

//Who to send error reports to
const maintainers = require("./maintainers.json")

const {Potatobot} = require("./potatobot.js"); const pb = new Potatobot(token,config)
const {Github} = require("./modules/github.js"); const git = new Github()

const client = new Client(
    {intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildVoiceStates
        ],
    partials: [Partials.Reaction]}
)
module.exports.client = client

//pb.loadCommands(token["Bot"])

//Welcome
pb.welcomer()

pb.spambotChecker()

//#region Message Detection
client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || msg.channel.type !== ChannelType.DM) return
    console.log("someone sent a dm")
    if (msg.author.id.includes("484144133917769749") || msg.author.id.includes("520961867368103936")) {
        if (msg.content.toLowerCase().includes("change status")) {
            pb.setRandomStatus()
        }
        if (msg.content.toLowerCase().startsWith("nick")) {
            pb.setName(msg.content.split("nick ")[1])
        }
    }
})

client.on(Events.MessageCreate, async (message) => {
    
    if (message.author.bot) return
    if (message.author.id.includes("721640105307275315") && message.content.toLowerCase().includes("linux")) {
        const linux = [
            "https://cdn.discordapp.com/attachments/1156304119313748010/1360535401164570624/caption.gif?ex=680d4515&is=680bf395&hm=6f04b4ee59a0e103bc272d1799d42e5c4993a732932c39997a3ba9f9a991c3aa&",
            "https://tenor.com/view/linux-trash-linuxbad-gif-18671901",
            "https://tenor.com/view/linux-gif-25928231",
            "https://tenor.com/view/sudo-rm-rf-linux-bruh-chungus-poggers-gif-19024993",
            "https://tenor.com/view/sudo-rm-rf-sudo-rm-rf-beamng-gif-25571467",
            "https://tenor.com/view/linux-linux-users-gif-24927537",
            "https://tenor.com/view/linux-arch-linux-desktop-productive-drivers-gif-26104738",
            "https://tenor.com/view/breaking-in-windows-linux-meme-breaking-into-a-windows-user-gif-27138745",
            "https://tenor.com/view/arch-linux-linux-open-source-arch-i-use-arch-btw-gif-25315741",
            "https://tenor.com/view/linux-linux-user-open-source-gif-26342988",
            "https://tenor.com/view/linux-windows-arch-btw-vulnerability-gif-26202413",
            "https://tenor.com/view/cat-linux-ubuntu-fork-bomb-funny-gif-26955144",
            "https://tenor.com/view/linux-windows-11-window-door-computer-breaking-into-gif-2145998682255639382"
            ]
        message.reply(linux[Math.floor(Math.random() *linux.length)])
    }
})

client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot) return
    
    if ((msg.content.includes("<@1360807782001148134>")||msg.content.toLowerCase().includes("potatobot")) && (msg.content.toLowerCase().includes("sucks")||msg.content.toLowerCase().includes("i hate")||msg.content.toLowerCase().includes("is bad")||msg.content.toLowerCase().includes("is ass")||msg.content.toLowerCase().includes("beat our child")||msg.content.toLowerCase().includes("disown"))) {
        msg.react("😢")
        msg.react("🫃")
    }
    
    if (pb.filterCheck(msg) === false) {return}

    if ((pb.checkMaintenanceStatus === true) && !maintainers.includes(msg.author.id)) {
        const embed = new EmbedBuilder()
            .setTitle("PotatoBot is currently under maintenance.")
            .setDescription("PotatoBot is either undergoing development or being patched, please try again later")
            .setColor(0xFF1111)
        msg.reply({embeds:[embed]})
        return
    }
    if (msg.content.includes(" ")) {pb.maintenanceMode(msg); return}
    
    
    if (maintainers.includes(msg.author.id) && msg.content.toLowerCase().includes("send latest commit")) {
        const last_commit = await pb.getBasicCommitInfo("SpacePotatoee","PotatoBot")
        pb.sendError(
            "New Commit",
            `>>> Commit Author: ${last_commit.author}
            Commit Date: ${last_commit.date}
            Commit Message: ${last_commit.message}`,
            0x023bb5
        );

    }

    pb.faq(msg)
});


client.on(Events.MessageReactionAdd, async (reaction,user) => {
    if (reaction.emoji.name === "🫃") {
        reaction.message.react("🫃")
    }
})
//#endregion Message Detection

//#region Error Logging
client.on(Events.Error, (e) => {
    console.log(e)
    pb.sendError("error",e,0xFF0000)
})
process.on("uncaughtException", (e) => {
    console.log(e)
    pb.sendError("uncaught exception",e,0xFF0000)
})
//#endregion Error Logging

client.login(token["Bot"])
client.on(Events.ClientReady, async () => {
    console.log("started");
    const last_commit = await git.getBasicCommitInfo("SpacePotatoee","PotatoBot")
    pb.sendError(
        "Started PotatoBot",
        `__**Latest Commit**__
        >>> Commit Author: ${last_commit.author}
        Commit Date: ${last_commit.date}
        Commit Message: ${last_commit.message}`,
        0x00FF00
    );

    pb.setRandomStatus()
    setInterval(()=>(pb.setRandomStatus()),300_000) // Set a random status every 5 minutes

    pb.getSubscriberCount()
    pb.modUpdater()
    setInterval(()=> {
        pb.getSubscriberCount()
        pb.modUpdater()
    },3_600_000)  // Update the subscriber counter and update tracker every hour
})

module.exports.client = client
