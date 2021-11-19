const fs = require("fs");
const Octokit = require("@octokit/rest").Octokit;
const dotenv = require("dotenv");
dotenv.config();

const startDate = new Date("2021-11-21");
const currentDate = new Date();
const commitCount = 30;

startDate.setHours(0, 0, 0, 0);
currentDate.setHours(0, 0, 0, 0);

const dayOffset = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

if (dayOffset < 0) process.exit(0);

const pattern = [
    0, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 0,
    0, 0, 1, 0, 1, 0, 1,
    0, 0, 1, 0, 1, 0, 1,
    0, 0, 0, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 0,
    0, 0, 1, 0, 0, 0, 1,
    0, 0, 1, 0, 0, 0, 1,
    0, 0, 1, 0, 0, 0, 1,
    0, 0, 0, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 1, 1, 1, 0,
    0, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 0,
    0, 1, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 0,
    0, 0, 1, 0, 0, 0, 1,
    0, 0, 1, 0, 0, 0, 1,
    0, 0, 1, 0, 0, 0, 1,
    0, 0, 0, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 1, 1, 1, 1,
    0, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 0,
    0, 0, 1, 0, 0, 0, 1,
    0, 0, 1, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
];

const index = Math.floor(dayOffset % pattern.length);
const active = !!pattern[index];

if (!active) process.exit(0);


const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const getSHA = async () => {
    const result = await octokit.repos.getContent({
        owner: "bruechler",
        repo: "hello-github",
        path: "update.txt",
    });

    return result?.data?.sha;
}

async function commitUpdate (commitIndex) {
    const result = await octokit.repos.createOrUpdateFileContents({
        owner: "bruechler",
        repo: "hello-github",
        path: "update.txt",
        message: `update daily routine`,
        content: Buffer.from(`${index}-${commitIndex}`).toString("base64"),
        sha: await getSHA(),
    });

    return result?.status || 500;
}

(async () => {
    try {
        for(let i = 0; i < commitCount; i++) {
            await commitUpdate(i);
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
})();
