'use strict';

const GuildChannel = require('./GuildChannel');
const TextBasedChannel = require('./interfaces/TextBasedChannel');
const MessageManager = require('../managers/MessageManager');
const ThreadManager = require('../managers/ThreadManager');

/**
 * Represents a text-based guild channel on Discord.
 * @extends {GuildChannel}
 * @implements {TextBasedChannel}
 */
class BaseGuildTextChannel extends GuildChannel {
  constructor(guild, data, client) {
    super(guild, data, client, false);

    /**
     * A manager of the messages sent to this channel
     * @type {MessageManager}
     */
    this.messages = new MessageManager(this);

    /**
     * A manager of the threads belonging to this channel
     * @type {ThreadManager}
     */
    this.threads = new ThreadManager(this);

    /**
     * If the guild considers this channel NSFW
     * @type {boolean}
     */
    this.nsfw = Boolean(data.nsfw);

    this._patch(data);
  }

  _patch(data) {
    super._patch(data);

    if ('topic' in data) {
      /**
       * The topic of the text channel
       * @type {?string}
       */
      this.topic = data.topic;
    }

    if ('nsfw' in data) {
      this.nsfw = Boolean(data.nsfw);
    }

    if ('last_message_id' in data) {
      /**
       * The last message id sent in the channel, if one was sent
       * @type {?Snowflake}
       */
      this.lastMessageId = data.last_message_id;
    }

    if ('last_pin_timestamp' in data) {
      /**
       * The timestamp when the last pinned message was pinned, if there was one
       * @type {?number}
       */
      this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
    }

    if ('default_auto_archive_duration' in data) {
      /**
       * The default auto archive duration for newly created threads in this channel
       * @type {?ThreadAutoArchiveDuration}
       */
      this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    }

    if ('messages' in data) {
      for (const message of data.messages) this.messages._add(message);
    }
  }

  /**
   * Sets the default auto archive duration for all newly created threads in this channel.
   * @param {ThreadAutoArchiveDuration} defaultAutoArchiveDuration The new default auto archive duration
   * @param {string} [reason] Reason for changing the channel's default auto archive duration
   * @returns {Promise<TextChannel>}
   */
  setDefaultAutoArchiveDuration(defaultAutoArchiveDuration, reason) {
    return this.edit({ defaultAutoArchiveDuration }, reason);
  }

  /**
   * Sets whether this channel is flagged as NSFW.
   * @param {boolean} [nsfw=true] Whether the channel should be considered NSFW
   * @param {string} [reason] Reason for changing the channel's NSFW flag
   * @returns {Promise<TextChannel>}
   */
  setNSFW(nsfw = true, reason) {
    return this.edit({ nsfw }, reason);
  }

  /**
   * Sets the type of this channel (only conversion between text and news is supported)
   * @param {string} type The new channel type
   * @param {string} [reason] Reason for changing the channel's type
   * @returns {Promise<GuildChannel>}
   */
  setType(type, reason) {
    return this.edit({ type }, reason);
  }

  /**
   * Fetches all webhooks for the channel.
   * @returns {Promise<Collection<Snowflake, Webhook>>}
   * @example
   * // Fetch webhooks
   * channel.fetchWebhooks()
   *   .then(hooks => console.log(`This channel has ${hooks.size} hooks`))
   *   .catch(console.error);
   */
  fetchWebhooks() {
    return this.guild.channels.fetchWebhooks(this.id);
  }

  /**
   * Options used to create a {@link Webhook} in a {@link TextChannel} or a {@link NewsChannel}.
   * @typedef {Object} ChannelWebhookCreateOptions
   * @property {?(BufferResolvable|Base64Resolvable)} [avatar] Avatar for the webhook
   * @property {string} [reason] Reason for creating the webhook
   */

  /**
   * Creates a webhook for the channel.
   * @param {string} name The name of the webhook
   * @param {ChannelWebhookCreateOptions} [options] Options for creating the webhook
   * @returns {Promise<Webhook>} Returns the created Webhook
   * @example
   * // Create a webhook for the current channel
   * channel.createWebhook('Snek', {
   *   avatar: 'https://i.imgur.com/mI8XcpG.jpg',
   *   reason: 'Needed a cool new Webhook'
   * })
   *   .then(console.log)
   *   .catch(console.error)
   */
  createWebhook(name, options = {}) {
    return this.guild.channels.createWebhook(this.id, name, options);
  }

  /**
   * Sets a new topic for the guild channel.
   * @param {?string} topic The new topic for the guild channel
   * @param {string} [reason] Reason for changing the guild channel's topic
   * @returns {Promise<GuildChannel>}
   * @example
   * // Set a new channel topic
   * channel.setTopic('needs more rate limiting')
   *   .then(newChannel => console.log(`Channel's new topic is ${newChannel.topic}`))
   *   .catch(console.error);
   */
  setTopic(topic, reason) {
    return this.edit({ topic }, reason);
  }

  /**
   * Data that can be resolved to an Application. This can be:
   * * An Application
   * * An Activity with associated Application
   * * A Snowflake
   * @typedef {Application|Snowflake} ApplicationResolvable
   */

  /**
   * Options used to create an invite to a guild channel.
   * @typedef {Object} CreateInviteOptions
   * @property {boolean} [temporary=false] Whether members that joined via the invite should be automatically
   * kicked after 24 hours if they have not yet received a role
   * @property {number} [maxAge=86400] How long the invite should last (in seconds, 0 for forever)
   * @property {number} [maxUses=0] Maximum number of uses
   * @property {boolean} [unique=false] Create a unique invite, or use an existing one with similar settings
   * @property {UserResolvable} [targetUser] The user whose stream to display for this invite,
   * required if `targetType` is {@link InviteTargetType.Stream}, the user must be streaming in the channel
   * @property {ApplicationResolvable} [targetApplication] The embedded application to open for this invite,
   * required if `targetType` is {@link InviteTargetType.Stream}, the application must have the
   * {@link InviteTargetType.EmbeddedApplication} flag
   * @property {InviteTargetType} [targetType] The type of the target for this voice channel invite
   * @property {string} [reason] The reason for creating the invite
   */

  /**
   * Creates an invite to this guild channel.
   * @param {CreateInviteOptions} [options={}] The options for creating the invite
   * @returns {Promise<Invite>}
   * @example
   * // Create an invite to a channel
   * channel.createInvite()
   *   .then(invite => console.log(`Created an invite with a code of ${invite.code}`))
   *   .catch(console.error);
   */
  createInvite(options) {
    return this.guild.invites.create(this.id, options);
  }

  /**
   * Fetches a collection of invites to this guild channel.
   * Resolves with a collection mapping invites by their codes.
   * @param {boolean} [cache=true] Whether or not to cache the fetched invites
   * @returns {Promise<Collection<string, Invite>>}
   */
  fetchInvites(cache = true) {
    return this.guild.invites.fetch({ channelId: this.id, cache });
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  /* eslint-disable no-empty-function */
  get lastMessage() {}
  get lastPinAt() {}
  send() {}
  sendTyping() {}
  createMessageCollector() {}
  awaitMessages() {}
  createMessageComponentCollector() {}
  awaitMessageComponent() {}
  bulkDelete() {}
}

TextBasedChannel.applyToClass(BaseGuildTextChannel, true);

module.exports = BaseGuildTextChannel;
