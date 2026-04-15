require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin()],
});

client.on('ready', () => {
  console.log('Ariel is online 🎶');
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).split(' ');
  const command = args.shift();

  if (command === 'play') {
    const vc = message.member.voice.channel;
    if (!vc) return message.reply('Join VC first');

    distube.play(vc, args.join(' '), {
      member: message.member,
      textChannel: message.channel,
    });
  }

  if (command === 'stop') {
    distube.stop(message);
    message.channel.send('Stopped');
  }
});

distube.on('playSong', (queue, song) => {
  queue.textChannel.send(`Playing: ${song.name}`);
});

client.login(process.env.TOKEN);
