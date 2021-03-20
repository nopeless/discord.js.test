'use strict';

const Util = require('../util/Util');

/**
 * Represents a data model that is identifiable by a Snowflake (i.e. Discord API data models).
 * @abstract
 */
class Base {
  constructor(client) {
    /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });
  }

  // Injectable to
  // Message
  // Reaction
  expectMessage(options) {
    return this.expect(options, { type: 'message' });
  }

  expectReaction(options) {
    return this.expect(options, { type: 'reaction' });
  }

  expect(options, { type }) {
    function emojiResolvables(emoji) {
      const final = [];
      // Default for both types
      final.push(emoji.name);
      final.push(emoji.id);
      final.push(emoji.identifier);
      final.push(emoji.toString());

      // Might not exist
      if (emoji.name) final.push(emoji.name);
      return final;
    }

    function messageResolvables(message, { lowercase = true }) {
      const final = [];

      message.rawText = Util.messageToRawText(message);
      message.cleanText = Util.messageToText(message);

      // Raw
      final.push(message.rawText);

      // Cleaned
      final.push(message.cleanText);

      if (lowercase) {
        final.forEach((v, i) => (final[i] = v.toLowerCase()));
      }

      return final;
    }

    options = {
      ...this.client._expect,
      ...options,
    };

    function matcher(obj, qualifier) {
      if (typeof obj !== 'string') throw new Error(`expected a string for obj, recieved ${obj}`);
      if (typeof qualifier === 'string') {
        if (options.caseless) {
          return obj.toLowerCase().match(qualifier.toLowerCase());
        }
        return obj.match(qualifier.toLowerCase());
      }
      if (qualifier instanceof RegExp) return obj.match(qualifier);
      if (qualifier instanceof Function) return qualifier(obj);
      throw new Error('expected string/regex or function for qualifier');
    }

    function optionsValidator(o) {
      if (o instanceof Object === false) throw new Error(`expected o to be an object. recieved ${o}`);
      if (typeof o.type !== 'string') {
        throw new Error(`o.type should be a string. recieved ${o.type}`);
      }
      if (!['text', 'embed', 'any', 'attachment', 'image'].includes(o.type)) {
        throw new Error(`o.type is not a valid option. it was ${o.type}`);
      }
      for (const s of ['every', 'some', 'none']) {
        if (!Array.isArray(o[s])) throw new Error(`o.${s} should be an array`);
        for (const item of o[s]) {
          if (typeof item !== 'string' && !(item instanceof RegExp) && !(item instanceof Function)) {
            throw new Error(`${item} of o.${s} is not a string, regexp, nor function`);
          }
        }
      }
      if (o.from) {
        if (typeof o.from !== 'string') {
          if (typeof o.from?.id !== 'string') {
            throw new Error(`o.from was not a string and did not have a string .id property. o.from was ${o.from}`);
          }
        }
        if (Array.isArray(o.from)) {
          if (!o.from.every(v => typeof v === 'string' || typeof v?.id === 'string')) {
            throw new Error(
              `o.from was an array but not all of them were strings or objects with string property 'id'`,
            );
          }
        }
      }
      for (const s of ['delay', 'timeout']) {
        if (o[s]) {
          if (isNaN(o[s])) {
            throw new Error(`o.${s} is not a number. it was ${o[s]}`);
          }
        }
      }
      return true;
    }
    optionsValidator(options);

    if (options.delay) {
      this.client.delay.sleep = options.delay;
    }
    const subjectMessage = this.message || this;

    let resolve;
    let reject;
    let settled = false;

    let isDeleted;
    let delRes;
    let delRej;
    if (options.delete === true || options.delete === false) {
      let deleteListener, deleteBulkListener;
      if (options.delete) {
        deleteListener = m => m.id === subjectMessage.id && delRes(true);
        deleteBulkListener = c => c.has(subjectMessage.id) && delRes(true);
      } else {
        deleteListener = m => m.id === subjectMessage.id && delRej(true);
        deleteBulkListener = c => c.has(subjectMessage.id) && delRej(true);
      }
      isDeleted = new Promise((_res, _rej) => {
        // Assign res and rej here
        delRes = _res;
        delRej = _rej;
        subjectMessage.client.on(`messageDelete`, deleteListener);
        subjectMessage.client.on(`messageDeleteBulk`, deleteBulkListener);
      });

      let timer = setTimeout(() => {
        if (options.delete) {
          delRej(new Error('message was not deleted'));
        } else {
          delRes(true);
        }
      }, options.timeout);

      // Delete the event listeners
      isDeleted.finally(() => {
        subjectMessage.client.removeListener(`messageDelete`, deleteListener);
        subjectMessage.client.removeListener(`messageDeleteBulk`, deleteBulkListener);
        clearTimeout(timer);
      });
    } else {
      isDeleted = null;
    }

    // Resolve this outside
    let returnPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    // To check if its settled
    returnPromise.finally(v => {
      settled = true;
      return v;
    });

    let collector;

    // This option is available on both types of reaction collectors
    const collectorOptions = { time: options.timeout, max: 1 };

    let last;

    // For 'collect', only handle rejections, as resolves will be done on 'end'
    if (type === 'message') {
      const filter = m => {
        if (m.author.id === this.client.user.id) return false;
        // If from is specified, try to match it
        if (options.from) {
          if (Array.isArray(options.from)) {
            for (const o of options.from) {
              if (m.author.id !== o && m.author.id !== o?.id) return false;
            }
          } else {
            const fromId = options.from || options.from?.id;
            if (m.author.id !== fromId) return false;
          }
        }
        return true;
      };
      const channel = subjectMessage.channel;
      /* eslint-disable-next-line no-undef */
      assert(!!channel.createMessageCollector);
      collector = channel.createMessageCollector(filter, collectorOptions);

      const collect = m => {
        // Handle 'type' option =========================================================
        if (options.type === 'text') {
          if (!m.content) {
            return reject(
              new Error("No text field (message.content) was present in the reply with the option type 'text'"),
            );
          }
          if (m.embeds.length) return reject(new Error("An embed field was present with the option type 'text'"));
        } else if (options.type === 'embed') {
          if (!m.content) {
            return reject(
              new Error("A text field (message.content) was present in the reply with the option type 'embed'"),
            );
          }
          if (m.embeds.length) return reject(new Error("Embed fields were not present with the option type 'embed'"));
        } else if (options.type === 'any') {
          // Ingore
        } else if (options.type === 'attachment') {
          if (!m.attachments.size) {
            return reject(new Error("Attachments were not present with the option type 'attachment'"));
          }
        } else if (options.type === 'image') {
          if (!m.embeds.some(e => e.image)) {
            return reject(new Error("Images were not present with the option type 'image'"));
          }
        } else {
          return reject(new Error('INTERNAL ERROR. THIS SHOULDNT HAPPEN'));
        }

        // Handle every, some, none ========================================================
        const resolvables = messageResolvables(m, { lowercase: options.caseless ?? false });

        // Everything in should, should match
        // every option
        for (const every of options.every) {
          if (!resolvables.some(v => matcher(v, every))) {
            // Every option failed
            return reject(new Error(`Expected '${every}' to match the message`));
          }
        }

        // Some option
        let pass = !options.some.length;
        for (const some of options.some) {
          if (resolvables.some(v => matcher(v, some))) {
            // It succeeded
            pass = true;
            break;
          }
        }
        if (!pass) {
          return reject(new Error(`Message resolvables did not match any of '${options.some}'`));
        }

        // None option
        for (const none of options.none) {
          if (resolvables.some(v => matcher(v, none))) {
            return reject(new Error(`Expected message to not match ${none}`));
          }
        }

        // Handle noFalsy ========================================================
        // prevent emojis named undefined, NaN, null, from triggering this error
        let match;
        if (options.noFalsy && !options.art) {
          const noSpecial = Util.stripURL(Util.stripEmojis(m.rawText));
          match = noSpecial.match(/undefined|null|NaN|\[object [_$\w][\d\w_$]*\]/);
          if (match) {
            return reject(new Error(`Text "${match[0]}" was in the message 'options.noFalsy'`));
          }
        }
        if (options.noZeroWidthSpace) {
          if (m.rawText.match('​')) {
            return reject(new Error(`A Zero Width Space was present in the message 'options.noZeroWidthSpace'`));
          }
        }
        if (options.noOverflow) {
          if (m.content.length === 2000) {
            return reject(new Error("The message was exactly 2000 'options.noOverflow'"));
          }
        }
        if (options.noDoubleSpace && !options.art) {
          if (m.cleanText.match(/ {2,}/)) {
            return reject(new Error("The message had two consecutive spaces 'options.noDoubleSpace'"));
          }
        }
        if (options.checkSpacing && !options.art) {
          // Use raw text and pass it into humanize instead
          const humanText = Util.humanize(m.rawText);
          match = humanText.match(/(?:[A-Za-z]\d|\d[A-Za-z]).{0,10}/s);
          if (match) {
            return reject(
              new Error(`The message had a number next to a letter here -> '${match[0]}' 'options.checkSpacing'`),
            );
          }
        }
        if (options.noEveryone) {
          match = m.content.match(/@(everyone|here).{0,10}/s);
          if (match) {
            return reject(new Error(`The message had an '${match[1]} ping here -> ${match[0]} 'options.noEveryone'`));
          }
        }

        last = m;
        collector.stop();
        return undefined;
      };

      // Message collector
      collector.on(`collect`, m => {
        try {
          collect(m);
        } catch (e) {
          reject(e);
        }
      });
    } else if (type === 'reaction') {
      const filter = (r, user) => {
        if (r.me) return false;
        // If from is specified, try to match it
        if (options.from) {
          if (Array.isArray(options.from)) {
            for (const o of options.from) {
              if (user.id !== o && user.id !== o?.id) return false;
            }
          } else {
            const fromId = options.from || options.from?.id;
            if (user.id !== fromId) return false;
          }
        }
        return true;
      };
      collector = subjectMessage.createReactionCollector(filter, collectorOptions);
      const collect = r => {
        const resolvables = emojiResolvables(r.emoji);
        // Everything in should, should match
        // every option
        for (const every of options.every) {
          if (!resolvables.some(v => matcher(v, every))) {
            // Every option failed
            return reject(
              new Error(`Unexpected emoji '${r.emoji}'. Expected '${every}' to match one of '${resolvables}'`),
            );
          }
        }

        // Some option
        let pass = !options.some.length;
        for (const some of options.some) {
          if (resolvables.some(v => matcher(v, some))) {
            // It succeeded
            pass = true;
            break;
          }
        }
        if (!pass) {
          return reject(new Error(`emoji '${r.emoji}' resolvables did not match any of '${options.some}'`));
        }

        // None option
        for (const none of options.none) {
          if (resolvables.some(v => matcher(v, none))) {
            return reject(
              new Error(`Unexpected emoji '${r.emoji}'. Expected '${none}' to not match any of '${resolvables}'`),
            );
          }
        }
        last = r;
        collector.stop();
        return undefined;
      };
      collector.on(`collect`, r => {
        try {
          collect(r);
        } catch (e) {
          reject(e);
        }
      });
    } else {
      throw new Error('unknown type');
    }

    collector.on(`end`, () => {
      if (settled) return undefined;
      if (options.reply === true) {
        if (last) {
          return resolve(last);
        }
        return reject(new Error('expected a reply'));
      }
      if (options.reply === false) {
        // Nothing should happen
        if (last) {
          return reject(new Error('unexpected reply'));
        }
        return resolve(null);
      }
      // Resolve with last or null
      return resolve(last || null);
    });
    if (isDeleted === null) {
      return returnPromise;
    } else if (options.reply === false) {
      return isDeleted;
    }
    // Return return promise anyway
    return Promise.all([returnPromise, isDeleted]).then(() => returnPromise);
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data) {
    return data;
  }

  _update(data) {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }

  toJSON(...props) {
    return Util.flatten(this, ...props);
  }

  valueOf() {
    return this.id;
  }
}

module.exports = Base;
