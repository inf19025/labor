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

	getRootNode = (): Payload | undefined => {
		return this.rootNode;
	};

	getNode = (): Node => {
		return this.node;
	};

	/**
	 * Sends a discovery payload to all known routes
	 * @param nodes list of all known nodes
	 */
	scanRoutes() {
		if (this.rootNode) {
			// to deep clone the object, not reference it
			let sendNode: Payload = JSON.parse(JSON.stringify(this.rootNode));
			sendNode.node = this.node;

			console.log(`sending ${JSON.stringify(sendNode)}`);

			network.broadcast(sendNode, this.collectRoute);
		} else {
			network.broadcast({ root: this.node, cost: 0 }, this.collectRoute);
		}
	}

	/**
	 * this method is called when a payload is sent to them
	 * @param payload
	 * @param ret
	 */
	handleBroadcast(payload: Payload, ret: (res: ResponsePayload) => void) {
		if (
			(payload.node?.id === this.node.id &&
				payload.node.name === this.node.name) ||
			(payload.root.id === this.node.id && payload.root.name === this.node.name)
		) {
			return;
		}
		const routes = this.findRoute(payload);
		if (routes === undefined || routes.new === undefined) return;

		if (this.rootNode) {
			if (
				payload.root.id < this.rootNode.root.id ||
				(payload.cost + routes.new.cost < this.rootNode.cost &&
					payload.root.id === this.rootNode.root.id)
			) {
				if (!routes.direct) {
					console.log('payload: ', payload);
					this.rootNode = payload;
					console.log(
						`von ${this.node.name} nach ${payload.root.name} über ${payload.node?.name}`
					);
					console.log(
						`bei ${this.node.name} ${this.rootNode.node?.name} ${this.rootNode.cost} + ${routes.new.cost}`
					);
					this.rootNode.cost += routes.new.cost;
				} else if (routes.direct.cost < payload.cost + routes.new.cost) {
					this.rootNode = {
						root: payload.root,
						cost: routes.direct.cost,
					};
				}
			} else {
				ret({ node: this.rootNode.root, costs: this.rootNode.cost });
			}
		} else {
			if (payload.root.id < this.node.id) {
				this.rootNode = payload;
				console.log(
					`von ${this.node.name} nach ${payload.root.name} über ${payload.node?.name}`
				);
				console.log(
					`bei ${this.node.name} ${this.rootNode.node} ${this.rootNode.cost} + ${routes.new.cost}`
				);
				this.rootNode.cost += routes.new.cost;
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

	private findRoute(
		payload: Payload
	): { direct: MyRoute; new: MyRoute } | undefined {
		const routeToNew = this.myRoutes
			.filter((value) => {
				if (payload.node) {
					return value.target === payload.node.name;
				} else {
					return value.target === payload.root.name;
				}
			})
			.sort((a, b) => {
				return a.cost - b.cost;
			})[0];

		const direct = this.myRoutes.filter((value) => {
			return value.target === payload.root.name;
		});
		if (direct) {
			direct.sort((a, b) => {
				return a.cost - b.cost;
			});
		}
		return { direct: direct[0], new: routeToNew };
	}
}
