require('dotenv').config();

process.env.YTDLP_DISABLE_UPDATE = 'true';

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
  emitNewSongOnly: true,
  nsfw: true,
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
      console.error(e);
      message.channel.send('❌ Failed to play song');
    }
  }

  if (command === 'stop') {
    const queue = distube.getQueue(message.guildId);
    if (!queue) return message.reply('Nothing playing');

    queue.stop();
    message.channel.send('⏹ Stopped');
  }
});

distube.on('playSong', (queue, song) => {
  queue.textChannel.send(`🎶 Playing: ${song.name}`);
});

distube.on('addSong', (queue, song) => {
  queue.textChannel.send(`➕ Added: ${song.name}`);
});

distube.on('error', (channel, error) => {
  console.error('DisTube Error:', error);
  if (channel) channel.send('⚠️ Error occurred while playing');
});

client.login(process.env.TOKEN);
