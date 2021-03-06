# Injected features

```js
// gets the first channel with 'general' as the substring.
member.channel(`general`);
member.channel(/general/);

// expecters
// message.expectReaction works too
message.expectMessage({
  ///////////////////////////////////////////////////////////////////////////////////////
  // Options that works for messages and reactions

  // If Message,
  // Context to test (regex, plain string, or functions (async functions will be tested in serial).
  // works with reactions as well. if a function is passed, the reaction itself will be passed
  // plain strings are caseinsensitive. use regex if you want more control
  // there are two strings that will be tested apon. raw, and cleaned
  // for each requirement, both will be tested, and if a requirement passes either a raw or cleaned,
  // it will be marked as a pass.
  // <@12345678910111213> is not going to be in the cleaned, but it will be on the raw
  // if your every has '<@12345678910111213>', it will match on raw, and it will be marked as pass

  // If Reaction
  // checks for id, name, identifier, etc

  // every - every requirement should be met (passing count === total count)
  // some  - some requirements should be met (passing count > 0)
  // none  - no requirements should be met   (passing count === 0)
  // defualt to []
  every: [],
  some: [/pong/i, /cooldown/i],
  none: [/error/i],

  // The message recipient resolvable (val.id || val)
  // default to undefined which means it will accept anyone
  from: process.env.DISCORD_BOT_ID || undefined,

  // Wait x seconds AFTER this test
  // default 1000 (1 second)
  delay: 1000,

  // Accepted timeframe of reply.
  // this method is better than mocha this.timeout because it exposes what actually timed out
  // requires the delay object to be set on tester
  // default 5000
  timeout: 5000,

  // If true, reject if no reply. if false, reject if reply, resolve null
  // if undefined, return resolve(null) if no reply, resolve the message if reply
  // default to true
  reply: true,

  // If true, only resolve when both message is deleted and there is a reply.
  // If set to false, the bot waits timeout to end then resolve with the message
  // If set to undefined, the bot will resolve when the bot replies (default behavior)
  // However, it is not guarenteed to return a specific resolve, since it was pretty controversial when designing this code.
  // If the message is deleted before a reply was created, then this will return an error
  delete: false,

  ///////////////////////////////////////////////////////////////////////////////////////
  // Applies to only messages
  // This config is applied on top of the global config.
  // the type of reply. text, embed, any, attachment
  // text:       assert message.content && !message.embeds.length
  // embed:      assert message.embeds.length && !message.content
  // any:        assert message.content || message.embeds.length
  // attachment: assert message.attachments.size
  // image:      assert message.embeds.some(e => e.image)
  // default to any
  type: 'any',

  // Rejects if message contains 'undefined', 'NaN', 'null', '[object Identifier]',
  // this check will strip out discord notation regexps (emoji, user, channel, role) and urls
  noFalsy: true,

  // Rejects if message contains a zero width space, since this most likely the programmers fault
  // for not inserting these in code blocks for example
  noZeroWidthSpace: true,

  // Rejects if message is exactly 2000 characters, as most of the time this is a split message
  // the developer shouldnt use split messages because it messes up with a lot of formatting
  // and the way it splits lines can be unpredictable
  // defaults to true
  noOverflow: true,

  // If true, noDoubleSpace, checkSpacing, noFalsy will be disabled
  art: false,
  // same as art but only in code blocks
  // default to false
  code: false,

  // If true, double spaces in messages should be rejected
  // like  this, as this is usually a formatting issue
  // this is checked on the stripped, cleaned (but with trailing spaces removed) text
  noDoubleSpace: true,

  // If true, numbers directly in front or behind words will be rejected
  // like1 this or like 1this
  checkSpacing: true,

  // if true, messages containing @everyone and @here will reject
  noEveryone: true,

  // if true, strings are caseless. Default to true
  // However, this ONLY turns the message content into lowercase, and does not apply to discord generated names (usernames, channel names, role names)
  // ex) every: ["apple"] matches tim#1234: Apple
  // but every: ["Apple"] does not match tim#1234: Apple
  caseless: true
});

// Setting up bots
// Please read setup.js as that is a working example of a setup

// Injected option userBots
const botClient = new Discord.Client({
  intents: Intents.ALL,
  // These users will return true for User#bot
  userBots: ['688503512581144657'],
  // userBots: [] or undefined -> every bot will be marked as a user
});

// Use other defaults
userClient.setExpect({
  delay: 5000,
  timeout: 10000,
  noFalsy: true,
  // can accept an array of ids or objects with.id
  // if falsy accept any
  from: process.env.DISCORD_BOT_ID,
  reply: true,
});
```

# Version matching chart

| discord.js | discord.js.test                 |
| ---------- | ------------------------------- |
| \*master   | 1.0.x (do not use this version) |
| 12.5.1     | 1.1.x                           |

# Update logs

# 1.1.6
Add `options.art`
Add `Util.removeCodeBlocks`

# 1.1.5
Fix bug in Util.removeMarkdown
Added a stack trace for data on certain discord api errors (useful for debugging)

# 1.1.4
Fix `options.checkSpacing`

# 1.1.3
Added options.delete

# 1.1.2
Minor fix for options.caseless

## 1.1.1

Features:
(options.from) Now accepts arrays
(options.noEveryone) New option. Rejects with an error if `@here` or `@everyone` is in the string
(options.caseless) New option. if true, all strings are caseless by default. Default to true
(Base.js expect) now has easier to understand error messages

Bug fixes:
(options.from) ID being a falsy value will properly skip from returning false
(setup.js) change invalid flags that I forgot to remove

## 1.1.0

Track 12.5.1 instead of master of discord.js

## 1.0.1

minor md updates

## 1.0.0

Initial release. Every feature is listed on `test/unit/example.spec.js`
