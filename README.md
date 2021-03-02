# This branch is a special fork to automate discord bot testing

<details>
<summary>Why another package? Why not a wrapper?</summary>
The whole point of this fork is to allow easy testing via replacing all `discord.js` with `discord.js.test` (this will not break anything unless you are not using the latest `discord.js`)

I originally thought about creating a wrapper, but here are reasons why that didn't work

  1. User#bot behavior is not changable by adding a wrapper. Unless you want to rewrite your whole code base, this is the better option
  2. Various methods are injected to make testing easier. This is also not possible with a wrapper
  3. Other packages either do not implement point 1.
</details>


## to test a discord bot, you need at least 2 bots

- a bot to be tested
- a user bot to be used as test
- (optional) a ci bot (has admin perms)

> a lot of the options don't even have a framework. The reason is that everyone has a different bot structure, and implementing a setup for mocha isn't something for a framework

<details><summary>The env file and guild settings used for `setup.js`</summary>

```env
# the bot that is subject to testing
DISCORD_TOKEN=
DISCORD_BOT_ID=

# the manager bot that has admin perms
DISCORD_CI_TOKEN=

# the user bot that will execute commands
DISCORD_USER_TOKEN=

# optional: the guild to test this
DISCORD_GUILD=
```

The guild has a channel named `general` and another named `system` (marked as a systems channel)
</details>

## how to run the tests

check `tests/mocha/README.md` for why this fork exists and

check `example.spec.js` for examples

check `test\mocha\DOCS.md` for update log and docs

> note: if you want to test the bot, you need `mocha` and `dotenv`, which is not included in package.json since i don't want to touch it

do `npm run mocha` with 3 tokens and try the bot

## Example output

![#system](https://cdn.discordapp.com/attachments/814550071328112652/816371239223951430/unknown.png)

![#general](https://cdn.discordapp.com/attachments/807937355074764810/816363065188417566/unknown.png)

```

Logging in...
user client logged in as Discord CI#4505
user client logged in as discord-db tester#4422
user client logged in as Emma P#3648
All clients are logged in. Testing for guild
guild set to 814550070790979645
fetching members...
channels: general, system-channel, afk channel
config==================================
  CI Bot: Discord CI#4505
     Bot: discord-db tester#4422
User Bot: Emma P#3648
========================================
  Basic Test
    ping command
      √ should return pong
    react this
      √ should react to the message with joy

Disconnecting clients...

  2 passing (11s)

```

<div align="center">
  <br />
  <p>
    <a href="https://discord.js.org"><img src="https://discord.js.org/static/logo.svg" width="546" alt="discord.js" /></a>
  </p>
  <br />
  <p>
    <a href="https://discord.gg/bRCvFy9"><img src="https://img.shields.io/discord/222078108977594368?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/discord.js"><img src="https://img.shields.io/npm/v/discord.js.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/discord.js"><img src="https://img.shields.io/npm/dt/discord.js.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://github.com/discordjs/discord.js/actions"><img src="https://github.com/discordjs/discord.js/workflows/Testing/badge.svg" alt="Build status" /></a>
    <a href="https://david-dm.org/discordjs/discord.js"><img src="https://img.shields.io/david/discordjs/discord.js.svg?maxAge=3600" alt="Dependencies" /></a>
    <a href="https://www.patreon.com/discordjs"><img src="https://img.shields.io/badge/donate-patreon-F96854.svg" alt="Patreon" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/discord.js/"><img src="https://nodei.co/npm/discord.js.png?downloads=true&stars=true" alt="npm installnfo" /></a>
  </p>
</div>

## Table of contents

- [About](#about)
- [Installation](#installation)
  - [Audio engines](#audio-engines)
  - [Optional packages](#optional-packages)
- [Example Usage](#example-usage)
- [Links](#links)
  - [Extensions](#extensions)
- [Contributing](#contributing)
- [Help](#help)

## About

discord.js is a powerful [Node.js](https://nodejs.org) module that allows you to easily interact with the
[Discord API](https://discord.com/developers/docs/intro).

- Object-oriented
- Predictable abstractions
- Performant
- 100% coverage of the Discord API

## Installation

**Node.js 12.0.0 or newer is required.**  
Ignore any warnings about unmet peer dependencies, as they're all optional.

Without voice support: `npm install discord.js`  
With voice support ([@discordjs/opus](https://www.npmjs.com/package/@discordjs/opus)): `npm install discord.js @discordjs/opus`  
With voice support ([opusscript](https://www.npmjs.com/package/opusscript)): `npm install discord.js opusscript`

### Audio engines

The preferred audio engine is @discordjs/opus, as it performs significantly better than opusscript. When both are available, discord.js will automatically choose @discordjs/opus.
Using opusscript is only recommended for development environments where @discordjs/opus is tough to get working.
For production bots, using @discordjs/opus should be considered a necessity, especially if they're going to be running on multiple servers.

### Optional packages

- [zlib-sync](https://www.npmjs.com/package/zlib-sync) for WebSocket data compression and inflation (`npm install zlib-sync`)
- [erlpack](https://github.com/discord/erlpack) for significantly faster WebSocket data (de)serialisation (`npm install discord/erlpack`)
- One of the following packages can be installed for faster voice packet encryption and decryption:
  - [sodium](https://www.npmjs.com/package/sodium) (`npm install sodium`)
  - [libsodium.js](https://www.npmjs.com/package/libsodium-wrappers) (`npm install libsodium-wrappers`)
- [bufferutil](https://www.npmjs.com/package/bufferutil) for a much faster WebSocket connection (`npm install bufferutil`)
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate) in combination with `bufferutil` for much faster WebSocket processing (`npm install utf-8-validate`)

## Example usage

```js
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.login('token');
```

## Links

- [Website](https://discord.js.org/) ([source](https://github.com/discordjs/website))
- [Documentation](https://discord.js.org/#/docs/main/master/general/welcome)
- [Guide](https://discordjs.guide/) ([source](https://github.com/discordjs/guide)) - this is still for stable  
  See also the [Update Guide](https://discordjs.guide/additional-info/changes-in-v12.html), including updated and removed items in the library.
- [Discord.js Discord server](https://discord.gg/bRCvFy9)
- [Discord API Discord server](https://discord.gg/discord-api)
- [GitHub](https://github.com/discordjs/discord.js)
- [NPM](https://www.npmjs.com/package/discord.js)
- [Related libraries](https://discordapi.com/unofficial/libs.html)

### Extensions

- [RPC](https://www.npmjs.com/package/discord-rpc) ([source](https://github.com/discordjs/RPC))

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the
[documentation](https://discord.js.org/#/docs).  
See [the contribution guide](https://github.com/discordjs/discord.js/blob/master/.github/CONTRIBUTING.md) if you'd like to submit a PR.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [Discord.js Server](https://discord.gg/bRCvFy9).
