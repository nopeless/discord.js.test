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
        some: [/pong/i],
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
