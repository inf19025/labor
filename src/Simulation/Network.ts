import EventEmitter from 'node:events';
import { Payload, ResponsePayload } from './Models/Payload';

type events = {
  broadcast: (p: Payload, r: (res: ResponsePayload) => void) => void;
};

class Network extends EventEmitter {
  // necessary for a typesafe eventEmitter
  private _untypedOn = this.on;
  private _untypedEmit = this.emit;
  public on = <K extends keyof events>(event: K, listener: events[K]): this =>
    this._untypedOn(event, listener);
  public emit = <K extends keyof events>(
    event: K,
    ...args: Parameters<events[K]>
  ): boolean => this._untypedEmit(event, ...args);

  broadcast(payload: Payload, r: (res: ResponsePayload) => void) {
    this.emit('broadcast', payload, r);
  }
}

export const network = new Network();
