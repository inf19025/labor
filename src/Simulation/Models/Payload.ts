import { Node } from './Node';

export type Payload = {
  root: Node;
  node?: Node;
  cost: number;
};

export type ResponsePayload = {
  node: Node;
  costs: number;
};
