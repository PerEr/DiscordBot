require('dotenv').config();
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

const APP_ID = process.env.APP_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

const baseUrl = `https://discord.com/api/v10/applications/${APP_ID}/commands`;

const headers = {
  "Authorization": `Bot ${BOT_TOKEN}`,
  "Content-Type": "application/json"
};

const commandsDir = path.join(__dirname, '../grok-bot/commands');

async function getExistingGlobalCommands() {
  try {
    const response = await axios.get(baseUrl, { headers });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch existing global commands:', error.response?.data || error.message);
    return [];
  }
}

async function addOrUpdateGlobalCommand(commandData) {
  try {
    await axios.post(baseUrl, JSON.stringify(commandData), { headers });
    console.log(`Added/Updated global command: ${commandData.name}`);
  } catch (error) {
    console.error(`Failed to add/update global command: ${commandData.name}`, error.response?.data || error.message);
  }
}

async function removeGlobalCommand(commandId, commandName) {
  try {
    await axios.delete(`${baseUrl}/${commandId}`, { headers });
    console.log(`Removed global command: ${commandName}`);
  } catch (error) {
    console.error(`Failed to remove global command: ${commandName}`, error.response?.data || error.message);
  }
}

async function manageGlobalCommands() {
  const existingCommands = await getExistingGlobalCommands();
  const localCommands = new Map();

  // Read local command files
  const files = fs.readdirSync(commandsDir);
  for (const file of files) {
    if (file.startsWith('cmd_')) {
      const commandData = require(path.join(commandsDir, file));
      delete commandData.execute;
      localCommands.set(commandData.name, commandData);
    }
  }

  // Add or update commands
  for (const [name, data] of localCommands) {
    await addOrUpdateGlobalCommand(data);
  }

  // Remove commands that exist on Discord but not locally
  for (const command of existingCommands) {
    if (!localCommands.has(command.name)) {
      await removeGlobalCommand(command.id, command.name);
    }
  }
}

manageGlobalCommands().catch(error => console.error('Global command management failed:', error));