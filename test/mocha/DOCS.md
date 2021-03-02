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

	// If true, double spaces in messages should be rejected
	// like  this, as this is usually a formatting issue
	// this is checked on the stripped, cleaned (but with trailing spaces removed) text
	noDoubleSpace: true,

	// If true, numbers directly in front or behind words will be rejected
	// like1 this or like 1this
	checkSpacing: true,
})

// Setting up bots
// Please read setup.js as that is a working example of a setup

// Injected option userBots
const botClient = new Discord.Client({
  intents: Intents.ALL,
  // These users will return true for User#bot
  userBots: ['688503512581144657'],
});

// Use other defaults
userClient.setExpect({
  delay: 5000,
  timeout: 10000,
  noFalsy: true,
  from: process.env.DISCORD_BOT_ID,
  reply: true,
});

```

# Update logs

## 1.0.0

Initial release. Every feature is listed on `test/unit/example.spec.js`