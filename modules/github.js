const bot = require("../index.js")
const fs = require("node:fs")

class Github {

    /**
     * Makes an API Request to github to pull commit info and returns the latest info
     * @param {String} RepoName Needs repository name in form of string
     * @param {String} RepoOwner Needs repository owner in form of string
     * 
     * @returns JSON as PROMISE
     */
    async githubApiReqCommit(RepoOwner, RepoName) {
        const temp = await fetch(`https://api.github.com/repos/${RepoOwner}/${RepoName}/commits?per_page=1`)
        return temp.json()
    }

    /**
     * Returns basic info from the APIReq function
     * @param {String} RepoName Needs repository name in form of string
     * @param {String} RepoOwner Needs repository owner in form of string
     * 
     * @returns JSON
     */
    async getBasicCommitInfo(RepoOwner, RepoName) {
        const commit_temp = await this.githubApiReqCommit(RepoOwner, RepoName) // idk what to call it but its the parents info, gets the repo commit data and caches it
        
        let latest_commit = {
            "author":commit_temp[0].commit.author.name,
            "date":new Date(commit_temp[0].commit.author.date).toUTCString(),
            "message":commit_temp[0].commit.message,
        }
        return latest_commit
    }
}

module.exports.Github = Github