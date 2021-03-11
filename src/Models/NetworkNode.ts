export default class NetworkNode {
  private node: Node;
  private routes: Route[];

  constructor(node: Node, routes: Route[]) {
    this.node = node;
    this.routes = routes;
  }

  scanRoutes = (nodes: NetworkNode[]) => {};

  receiveScan = (payload: Payload, ret: () => void) => {};

  private collectRoute = () => {};
}

type Payload = {};

type Node = {
  name: string;
  id: number;
};

type Route = {
  name: string;
  cost: number;
};

export type ReadNode = {
  node: Node;
  routes: Route[];
};
