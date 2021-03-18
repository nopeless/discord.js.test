'use strict';
// Use this file as a template for your custom tests

// require auth from root
const Discord = require(`${process.cwd()}/src`);
require(`dotenv`).config({ path: `${__dirname}/.env` });

const Intents = Discord.Intents;

globalThis.assert = require('assert');

const delay = {
  // Basic sleep in milliseconds
  _sleep: 0,
  set sleep(t) {
    if (isNaN(t)) {
      throw new Error('Duration must be a number!');
    }
    this._sleep = t;
  },
  get sleep() {
    return this._sleep || 0;
  },
};
// Set up clients
const botClient = new Discord.Client({
  intents: Intents.ALL,
  userBots: ['688503512581144657'],
});

// Set up basic ping command
botClient.on(`message`, m => {
  if (m.content === '!ping' && !m.author.bot) {
    m.channel.send('pong\nYour output is pong');
  }
  if (m.content === '!react' && !m.author.bot) {
    m.react('😂');
  }
  if (m.content.match(/fuck|shit/i)) {
    m.delete().catch(console.error);
    m.channel.send('nsfw word detected');
  }
  if (m.content.match(/retard|bitch/i)) {
    m.delete().catch(console.error);
  }
});

const ciClient = new Discord.Client({
  intents: Intents.ALL,
});

// Inject delay option
const userClient = new Discord.Client({
  intents: Intents.ALL,
  delay,
});
userClient.setExpect({
  delay: 1000,
  noFalsy: true,
  from: process.env.DISCORD_BOT_ID,
  timeout: 10000,
  reply: true,
});

function readyHook(client) {
  return new Promise(r => {
    client.on('ready', r);
  });
}

globalThis.sleep = t => new Promise(r => setTimeout(r, t));

exports.mochaHooks = {
  async beforeAll() {
    console.log('Logging in...');
    try {
      await ciClient.login(process.env.DISCORD_CI_TOKEN);
      await readyHook(ciClient);
      console.log(`user client logged in as ${ciClient.user.tag}`);

      await botClient.login(process.env.DISCORD_TOKEN);
      await readyHook(botClient);
      console.log(`user client logged in as ${botClient.user.tag}`);

      await userClient.login(process.env.DISCORD_USER_TOKEN);
      await readyHook(userClient);
      console.log(`user client logged in as ${userClient.user.tag}`);

      console.log('All clients are logged in. Testing for guild');

      let testGuild = null;
      const gid = process.env.DISCORD_GUILD;
      if (gid) {
        // The guild is set
        testGuild = ciClient.guilds.cache.get(gid);
      } else {
        // First guild in cache
        testGuild = ciClient.guilds.cache.first();
      }
      if (!testGuild) {
        // The test guild is falsy
        throw new Error('Test guild is falsy');
      }

      console.log(`guild set to ${testGuild.id}`);
      console.log('fetching members...');
      await testGuild.members.fetch();
      await testGuild.members.fetch();
      await testGuild.members.fetch();

      console.log(`channels: ${testGuild.channels.cache.map(v => v.name).join(', ')}`);
      const ch = testGuild.systemChannel || testGuild.channels.cache.first();
      if (!ch) {
        throw new Error('couldnt find a channel to send messages');
      }
      ch.send('Starting CI...');

      const mguild = userClient.guilds.resolve(testGuild.id);
      await mguild.members.fetch();
      const bguild = botClient.guilds.resolve(testGuild.id);
      await bguild.members.fetch();

      // Set the trio. these are clients
      globalThis.member = mguild.me;
      globalThis.bot = bguild.me;
      globalThis.guild = testGuild;

      // Deal with errors
      if (!member) {
        console.log(member);
        throw new Error('member is not a member of guild');
      }
      if (!bot) {
        console.log(bot);
        throw new Error('bot is not a member of guild');
      }

      console.log('config==================================');
      console.log(`  CI Bot: ${guild.me.user.tag}`);
      console.log(`     Bot: ${bot.user.tag}`);
      console.log(`User Bot: ${member.user.tag}`);
      console.log('========================================');
      // Set bot as a member
    } catch (e) {
      console.error('a login failed!');
      console.error(e);
      process.exit(1);
    }
  },
  async beforeEach() {
    if (delay.sleep) {
      if (delay.sleep > 0) {
        await sleep(delay.sleep);
      }
    }
  },
  afterAll() {
    try {
      console.log('Disconnecting clients...');
      botClient.destroy();
      ciClient.destroy();
      userClient.destroy();
    } catch (e) {
      console.log('Failed to disconnect clients. Silently exiting...');
      process.exit(1);
    }
  },
};
