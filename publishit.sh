#!/bin/bash

start_dir=$(pwd)

BOT=grok-bot
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
ZIPPIS="dist/${BOT}_${TIMESTAMP}.zip"

pushd $BOT

# Create a zip file in the starting directory
zip -r "$start_dir/${ZIPPIS}" .

popd

echo "Zip file created: ${ZIPPIS}"

aws lambda update-function-code --region=eu-north-1 \
    --function-name discord-grok-bot \
    --zip-file fileb://$ZIPPIS