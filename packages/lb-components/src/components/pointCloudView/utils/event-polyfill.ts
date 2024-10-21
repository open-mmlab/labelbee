/**
 * Extend `isImmediatePropagationStopped` in Event
 */

interface Event {
  /** Detect it has been call `stopImmediatePropagation`  or not? */
  isImmediatePropagationStopped: () => boolean;
}

const stopImmediatePropagationOriginal = Event.prototype.stopImmediatePropagation;
Event.prototype.isImmediatePropagationStopped = () => false;
Event.prototype.stopImmediatePropagation = function (event?: Event) {
  stopImmediatePropagationOriginal.bind(this).call(event);
  this.isImmediatePropagationStopped = () => true;
};
