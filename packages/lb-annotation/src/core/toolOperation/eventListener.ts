export default class EventListener {
  public events: any;

  constructor() {
    this.events = {};
  }

  public on(eventName: string, event: (...arg0: any[]) => void) {
    this.events[eventName] = event;
  }

  public emit(eventName: string, ...args: any[]) {
    if (this.events[eventName]) {
      this.events[eventName](...args);
    }
  }
}
