// @flow

// avoids a bug in flowtype: https://github.com/facebook/flow/issues/545

const events = require('events');
const EventEmitterOut = events.EventEmitter;

export default class EventEmitter extends EventEmitterOut {
}
