require('dotenv').config();
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

let url = `https://discord.com/api/v8/applications/${process.env.APP_ID}/guilds/${process.env.GUILD_ID}/commands`

const headers = {
  "Authorization": `Bot ${process.env.BOT_TOKEN}`,
  "Content-Type": "application/json"
}

/*
let command_data = {
  "name": "foo",
  "type": 1,
  "description": "replies with bar ;/",
}
axios.post(url, JSON.stringify(command_data), {
  headers: headers,
})
*/


const commandsDir = path.join(__dirname, '../grok-bot/commands');
const files = fs.readdirSync(commandsDir);

(async () => {
  for (const file of files) {
    if (!file.startsWith('cmd_')) {
      continue;
    }
    const commandData = require(path.join(commandsDir, file));
    delete commandData.execute;
    try {
      const response = await axios.post(url, JSON.stringify(commandData), {
        headers: headers,
      });
      console.log(`Registered command: ${commandData.name}`);
    } catch (error) {
      console.error(`Failed to register command: ${commandData.name}`, error.response.data);
    }
  }
})();
