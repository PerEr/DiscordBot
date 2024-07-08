Based on: https://betterprogramming.pub/build-a-discord-bot-with-aws-lambda-api-gateway-cc1cff750292

Configure discord, file registration/.env, add fields:
BOT_TOKEN=MTIx....
APP_ID=1216...
GUILD_ID=1214...

Then:
npm i
node register.js

To publish code, et AWS credentials, paste the to bash, then run ./publishit.sh

