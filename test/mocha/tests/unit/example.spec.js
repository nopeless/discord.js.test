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
      // Sends to first channel
      return (await member.channel().send(`${prefix}react`)).expectReaction({
        some: ['😂'],
      });
    });
  });
  describe('delete this', function () {
    it('should delete f*ck', async function () {
      return (await member.channel(`general`).send(`fuck you`)).expectMessage({
        delete: true,
        every: [`nsfw`],
      });
    });
    it('should silently delete retard', async function () {
      return (await member.channel(`general`).send(`retarded idiot`)).expectMessage({
        delete: true,
        reply: false,
      });
    });
  });
});
