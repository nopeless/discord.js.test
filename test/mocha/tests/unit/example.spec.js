'use strict';
/* eslint-disable space-before-function-paren */

const prefix = '!';

// Globals are (Discord.Guild) 'guild', (Discord.GuildMember) 'member', (Discord.GuildMember) 'bot'
describe('Basic Test', function () {
  // If you have to split files, use
  // describe('ping module', require('./ping'))
  describe('ping command', function () {
    it('should return pong', async function () {
      return (await member.channel(`general`).send(`${prefix}ping`)).expectMessage({
        // This config is applied on top of the global config.
        // the type of reply. text, embed, any, attachment
        // text:       assert message.content && !message.embeds.length
        // embed:      assert message.embeds.length && !message.content
        // any:        assert message.content || message.embeds.length
        // attachment: assert message.attachments.size
        // image:      assert message.embeds.some(e => e.image)
        // default to any
        type: 'any',

        // Context to test (regex, plain string, or functions (async functions will be tested in serial).
        // works with reactions as well. if a function is passed, the reaction itself will be passed
        // plain strings are caseinsensitive. use regex if you want more control
        // there are two strings that will be tested apon. raw, and cleaned
        // for each requirement, both will be tested, and if a requirement passes either a raw or cleaned,
        // it will be marked as a pass.
        // <@12345678910111213> is not going to be in the cleaned, but it will be on the raw
        // if your every has '<@12345678910111213>', it will match on raw, and it will be marked as pass
        // every - every requirement should be met (passing count === total count)
        // some  - some requirements should be met (passing count > 0)
        // none  - no requirements should be met   (passing count === 0)
        // defualt to []
        every: [],
        some: [/pong/i, /cooldown/i],
        none: [/error/i],

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

        // The message recipient resolvable (val.id || val)
        // default to undefined which means it will accept anyone
        from: process.env.DISCORD_BOT_ID,

        // Wait 5 seconds AFTER this test
        // default 0
        delay: 5000,

        // Accepted timeframe of reply.
        // this method is better than mocha this.timeout because it exposes what actually timed out
        // requires the delay object to be set on tester
        // default 5000
        timeout: 10000,

        // If true, reject if no reply. if false, reject if reply, resolve null
        // if undefined, return resolve(null) if no reply, resolve the message if reply
        // default to true
        reply: true,

        // If true, double spaces in messages should be rejected
        // like  this, as this is usually a formatting issue
        // this is checked on the stripped, cleaned (but with trailing spaces removed) text
        noDoubleSpace: true,

        // If true, numbers directly in front or behind words will be rejected
        // like1 this or like 1this
        checkSpacing: true,
      });
    });
  });
  describe('react this', function () {
    it('should react to the message with joy', async function () {
      // Sends to every channel
      return (await member.channel().send(`${prefix}react`)).expectReaction({
        some: ['😂'],
      });
    });
  });
});
