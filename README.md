Based on: https://betterprogramming.pub/build-a-discord-bot-with-aws-lambda-api-gateway-cc1cff750292

Configure your app in the discord console, the create the file registration/.env with these fields:
```bash
BOT_TOKEN=....
APP_ID=...
```

Then in the folder register:
```bash
npm i
node register.js
```

Your commands will now be regsitered with discord.

Finally, login to AWS and get temprary AWS credentials, paster these to the command promt before running
```bash
./publishit.sh
```

This command assumes an API and a lambda has been created, see original article for details.
