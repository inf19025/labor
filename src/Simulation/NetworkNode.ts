import FileHelper from '../Utils/FileHelper';
import { Node } from './Models/Node';
import { MyRoute, Route } from './Models/Route';
import { Payload, ResponsePayload } from './Models/Payload';
import { network } from './Network';
export default class NetworkNode {
  private node: Node;
  private myRoutes: MyRoute[] = [];
  private rootNode?: Payload;

  constructor(node: Node, routes: Route[]) {
    this.node = node;
    this.scanRoutes = this.scanRoutes.bind(this);
    this.handleBroadcast = this.handleBroadcast.bind(this);
    network.on('broadcast', this.handleBroadcast);
    this.loadRoutes(routes);
  }

  getNode = (): Node => {
    return this.node;
  };

  /**
   * Sends a discovery payload to all known routes
   * @param nodes list of all known nodes
   */
  scanRoutes() {
    network.broadcast(
      this.rootNode ?? { root: this.node, cost: 0 },
      this.collectRoute
    );
  }

  /**
   * this method is called when a payload is sent to them
   * @param payload
   * @param ret
   */
  handleBroadcast(payload: Payload, ret: (res: ResponsePayload) => void) {
    if (
      payload.node?.id === this.node.id &&
      payload.node.name === this.node.name
    ) {
      return;
    }
    if (this.rootNode) {
      if (
        payload.root.id < this.rootNode.root.id &&
        payload.cost < this.rootNode.cost
      ) {
        this.setRootNode(payload);
        this.scanRoutes();
      } else {
        ret({ node: this.rootNode.root, costs: this.rootNode.cost });
      }
    } else {
      if (payload.root.id < this.node.id) {
        this.setRootNode(payload);
        this.scanRoutes();
      }
    }
  }

  private loadRoutes(routes: Route[]) {
    routes.forEach((value) => {
      if (value.name1 === this.node.name) {
        this.myRoutes.push({ target: value.name2, cost: value.cost });
      }
      if (value.name2 === this.node.name) {
        this.myRoutes.push({ target: value.name1, cost: value.cost });
      }
    });
  }

  private collectRoute = (res: ResponsePayload) => {};

  private setRootNode = (newNode: Payload) => {
    if (this.rootNode === undefined) {
      this.rootNode = newNode;
      return;
    }

    const routes = this.findRoute(newNode);

    if (routes === undefined) return;
    if (
      newNode.cost + routes.new.cost <
      this.rootNode.cost + routes.current.cost
    ) {
      this.rootNode = newNode;
    }
  };

  private findRoute(
    node: Payload
  ): { current: MyRoute; new: MyRoute } | undefined {
    const routeToNew = this.myRoutes.find((value) => {
      return value.target === (node.node?.name ?? node.root.name);
    });

    if (this.rootNode === undefined && routeToNew) {
      return { current: { target: this.node.name, cost: 0 }, new: routeToNew };
    }

    const routeToCurrent = this.myRoutes.find((value) => {
      if (this.rootNode) {
        return (
          value.target === (this.rootNode.node?.name ?? this.rootNode.root.name)
        );
      }
    });

    if (routeToCurrent && routeToNew) {
      return { current: routeToCurrent, new: routeToNew };
    }
  }
}
