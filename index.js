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

client.once('ready', () => {
  console.log('Ariel is online 🎶');
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).split(' ');
  const command = args.shift();

  if (command === 'play') {
    const vc = message.member.voice.channel;
    if (!vc) return message.reply('Join VC first');

    try {
      await distube.play(vc, args.join(' '), {
        member: message.member,
        textChannel: message.channel,
      });
    } catch (e) {
      message.channel.send('Error playing song');
    }
  }

  if (command === 'stop') {
    const queue = distube.getQueue(message.guildId);
    if (!queue) return message.reply('Nothing playing');

    queue.stop();
    message.channel.send('Stopped');
  }
});

distube.on('playSong', (queue, song) => {
  queue.textChannel.send(`🎶 Playing: ${song.name}`);
});

distube.on('addSong', (queue, song) => {
  queue.textChannel.send(`➕ Added: ${song.name}`);
});

distube.on('error', (channel, error) => {
  console.error(error);
  if (channel) channel.send('Error occurred');
});

client.login(process.env.TOKEN);
