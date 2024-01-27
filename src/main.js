require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] });
const folderPath = 'C:\\Users\\PC\\Desktop\\crdataabot\\partlar';

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
})

client.on('messageCreate', async event => {
    if (event.channel.id == process.env.CHANNEL_ID && !event.member.roles.cache.has('1172600505571233912')) event.delete();
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand) return;

    const { commandName, options } = interaction;

    const CHANNEL_ID = process.env.CHANNEL_ID;
    const ROLE_ID = process.env.ROLE_ID;

    if (interaction.channel.id !== CHANNEL_ID) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply('Bu kanalda botu kullanamazsın!');
        return;
    }

    if (!interaction.member.roles.cache.has(ROLE_ID)) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply('Bu komutu kullanmak için yetkin yok!');
        return;
    }

    if (commandName === 'cr') {
        await interaction.deferReply({ephemeral: true });
        const startTime = new Date();

        const usernameToFind = options.getString('name').toLowerCase();

        let files = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

        const searchInFile = file => new Promise((resolve, reject) => {
            let firstCharacterOfFile = file.charAt(0);
            let firstCharacterOfUsername = usernameToFind.charAt(0);


            if (firstCharacterOfUsername !== firstCharacterOfFile) {
                return resolve(null);
            }

            let data = fs.readFileSync(path.join(folderPath, file));
            let users = JSON.parse(data);

            for (let user of users) {
                if (user.username.toLowerCase() === usernameToFind) {
                    return resolve(user);
                }
            }

            return resolve(null);
        });

        let searchPromises = files.map(file => searchInFile(file));

        let foundUser = null;

        for(let promise of searchPromises){
            let user = await promise;
            if(user){
                foundUser = user;
                break;
            }
        }

        if (foundUser) {
            await interaction.editReply({ content: `Kullanıcı Adı: ${foundUser.username}\nŞifre: ${foundUser.password}\nMail: ${foundUser.email}`, ephemeral: true });
            const endTime = new Date();
            const elapsedTimeInMs = endTime - startTime;
            console.log(`buldu kral: ${elapsedTimeInMs} milliseconds`);
        } else {
            await interaction.editReply({ content: 'User not found.', ephemeral: true });
            const endTime = new Date();
            const elapsedTimeInMs = endTime - startTime;
            console.log(`bulunamadı salak maymun: ${elapsedTimeInMs} milliseconds`);
        }
    }
});



client.login(process.env.DISCORD_BOT_TOKEN);
