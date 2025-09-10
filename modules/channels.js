const bot = require("../index.js")
const fs = require("node:fs")
const token = require("../token.json")
const config = require("../config.json")

const {Utils} = require("./utils.js"); const util = new Utils()

const {EmbedBuilder} = require("discord.js")

class Channels {
    constructor(lastUpdatedFilePath) {
        this.lastUpdatedFilePath = lastUpdatedFilePath,
        this.lastUpdated = require("."+lastUpdatedFilePath)
    }
    /**
     * Detects when a member joins and sends a welcome message
     */
    welcomer() {
        bot.client.on('guildMemberAdd', async (member) => {
            if(member.bot) return;
            if(this.checkMaintenanceStatus === true) return;

            console.log(member.displayName + " joined the server!");
            const server = member.guild;
            const welcomeChannel = server.systemChannel;
            const rulesChannel = server.rulesChannel;
            
            let newUserCount = server.memberCount.toString();
            let countString = "";
            
            switch (newUserCount.charAt(newUserCount.length - 1)) {
                case '1':
                    countString = "st";
                    break;
                case '2':
                    countString = "nd";
                    break;
                case '3':
                    countString = "rd";
                    break;
                default:
                    countString = "th";
                    break;
            }
        
            newUserCount = newUserCount + countString;
        
            const embed = new EmbedBuilder()
                .setColor(0xFFCC00)
                .setTitle("Welcome " + member.displayName + " to the Space Fries Discord!")
                .setThumbnail(member.user.avatarURL())
                .addFields(
                    { name:"Make sure to check out the " + rulesChannel.url + " first", value: "You are the " + newUserCount + " member to join the server"}
                )
        
            welcomeChannel.send({
                content: "<@" + member.user.id + ">",
                embeds: [embed]
            });
        })
    }

    /**
     * Automatically sends a message in the Mod Updates channel whenever one of my mods gets updated
     */
    async modUpdater() {
        
        const server = await util.fetchServer();
        const channel = await server.channels.fetch("1411241734817714186");

        //Get all my projects
        const projectsListFetch = await fetch("https://api.modrinth.com/v2/user/MXe82l5E/projects", {
            method: "GET",
            headers: {
                "Authorization": token["Modrinth"]
            }
        })
        const projectsList = await projectsListFetch.json();


        //Read when each project was last updated
        fs.readFile(this.lastUpdatedFilePath, 'utf-8', async (err, data) => {
            if (err) {
                console.error("Error: ", err)
                return
            }

            let shouldWrite = false
            let jsonData = JSON.parse(data)

            //For each project in the projects list
            for (let i = 0; i < projectsList.length; i++) {
                //If it should update
                if (i >= this.lastUpdated.length || jsonData[projectsList[i]["id"]] !== projectsList[i]["updated"]) {
                    let numOfVersions = projectsList[i]["versions"]
                    let latestVersionID = projectsList[i]["versions"][numOfVersions.length - 1]

                    //Get the latest version
                    let latestVersionFetch = await fetch("https://api.modrinth.com/v2/version/" + latestVersionID, {
                        method: "GET",
                        headers: {
                            "Authorization": token["Modrinth"]
                        }
                    })
                    let latestVersion = await latestVersionFetch.json();
                    console.log(true)
                    //Send the message
                    let embed = new EmbedBuilder()
                        .setTitle(latestVersion["name"])
                        .setDescription("Changelog:\n" + latestVersion["changelog"])
                        .setColor(projectsList[i]["color"])
                        .setThumbnail(projectsList[i]["icon_url"])
                    let msg = await channel.send({
                        content: "<@&1411245664821575680> \n" + "https://modrinth.com/mod/" + projectsList[i]["slug"] + "/version/" + latestVersionID,
                        embeds: [embed],
                        ephemeral: true
                    })
                    await msg.crosspost()
                    console.log("Created new project update message")

                    //Update the file
                    jsonData[projectsList[i]["id"]] = projectsList[i]["updated"]
                    shouldWrite = true;
                }
            }

            if (shouldWrite) {
                let updatedData = JSON.stringify(jsonData);
                await fs.writeFile(this.lastUpdatedFilePath, updatedData, 'utf-8', err => {
                    console.log("Updated the last_updated.json file")
                })
            }
        })
    }


    /**
     * Returns SpacePotato's subscriber count and assigns to specified channel
     * @param {string} token 
     */
    async getSubscriberCount() {
        const server = await util.fetchServer();
        const channel = await server.channels.fetch("1382364642499887195");

        const result = await fetch('https://www.googleapis.com/youtube/v3/channels?key='+token["YouTube"]+'&part=statistics&forHandle=SpacePotatoee');
        const text = await result.json();

        let subCount = text['items'][0]['statistics']['subscriberCount'];
        let slicedCount = subCount.slice(0, -2);
        let finalCount = slicedCount.slice(0, -1) + '.' + slicedCount.slice(-1) + 'K';
        
        await channel.setName('🎉︱Subscribers: ' + finalCount);
        
        console.log("Updated the sub count to " + finalCount);
    }

    spambotChecker() {
        bot.client.on("messageCreate", (msg) => {
            if (msg.channel.id !== config.honeypot_channel) return; // check if the message was posted originally in the honeypot channel
            console.log(`Message sent in honeypot by ${msg.author.username}`)

            msg.member.ban({
                reason: "You have sent a message in the honeypot channel to detect spambots. To delete the recent messages you will be banned and then unbanned (serving as a kick)",
                deleteMessageSeconds: 60 * 5 // delete every message from the past 5 minutes
            }).then(async (member) => {
                (await util.fetchServer()).members.unban(member.id) 
            })
        })
    }
}

module.exports.Channels = Channels
