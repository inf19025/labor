import { Route } from './Route';

export type ReadNode = {
  node: Node;
  routes: Route[];
};

export type Node = {
  name: string;
  id: number;
};
