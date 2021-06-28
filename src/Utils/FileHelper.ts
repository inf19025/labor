import { ReadNode, Node } from '../Simulation/Models/Node';
import { Route } from '../Simulation/Models/Route';
import NetworkNode from '../Simulation/NetworkNode';

export default class FileHelper {
	private static nodes: NetworkNode[] = [];
	private static routes: Route[] = [];

	private static determineDone(): boolean {
		let currRoot: Node | undefined = undefined;
		for (let node of FileHelper.nodes) {
			if (!currRoot) {
				let rootNode = node.getRootNode();
				if (rootNode) {
					currRoot = rootNode.root;
				} else {
					currRoot = node.getNode();
				}
			} else {
				if (node.getRootNode()) {
					if (currRoot.name !== node.getRootNode()?.root.name) {
						console.log('currRoot: ', currRoot.name);
						console.log('tested root: ', node.getRootNode()?.root.name);
						return false;
					}
				} else {
					if (currRoot.name !== node.getNode().name) {
						console.log('root: ', currRoot.name);
						return false;
					}
				}
			}
		}
		return true;
	}

	public static generateResult():
		| {
				root: string;
				waysToRoot: {
					startingNode: string;
					path: { node: string; cost: number }[];
				}[];
		  }
		| undefined {
		let root = this.nodes[0]?.getRootNode()?.root.name;
		if (root) {
			let ret: {
				root: string;
				waysToRoot: {
					startingNode: string;
					path: { node: string; cost: number }[];
				}[];
			} = { root: root, waysToRoot: [] };
			this.nodes.forEach((node) => {
				let rootNode = node.getRootNode();
				if (rootNode) {
					ret.waysToRoot.push({
						startingNode: node.getNode().name,
						path: [
							{
								node: rootNode.node ? rootNode.node.name : rootNode.root.name,
								cost: rootNode.cost,
							},
						],
					});

					ret.waysToRoot.forEach((value1) => {
						if (value1.path.length > 0) {
							let latestNode = value1.path[value1.path.length - 1].node;
							if (latestNode === node.getNode().name) {
								if (rootNode) {
									value1.path.push({
										node: rootNode.node
											? rootNode.node.name
											: rootNode.root.name,
										cost: rootNode.cost,
									});
								}
							}
						}
					});
				}
			});
			return ret;
		} else {
			return undefined;
		}
	}

	/**
	 *
	 * @param file the file to be parsed
	 * @returns the parsed content | rejects promise if not right format
	 */
	public static async parseFile(file: File): Promise<NetworkNode[]> {
		let contentNodes: Node[] = [];
		let contentRoutes: Route[] = [];
		let valid: boolean = true;

		const content = JSON.parse(await file.text());
		contentRoutes = content.routes;
		contentNodes = content.nodes;

		contentNodes.forEach((value) => {
			if (value.id === undefined || value.name === undefined) {
				valid = false;
			}
		});

		if (!valid) {
			return Promise.reject();
		}

		contentRoutes.forEach((value) => {
			if (
				value.cost === undefined ||
				value.name1 === undefined ||
				value.name2 === undefined
			) {
				valid = false;
			}
		});

		if (valid) {
			const ret = contentNodes.map((value) => {
				return new NetworkNode(value, contentRoutes);
			});
			FileHelper.nodes = ret;

			return Promise.resolve(ret);
		}
		return Promise.reject();
	}

	public static simulateNetwork(donefn: () => void) {
		let done = FileHelper.determineDone();
		let counter = 0;
		while (!done) {
			counter++;
			console.log(done);
			FileHelper.nodes.forEach((node) => {
				node.scanRoutes();
			});
			done = FileHelper.determineDone();
			if (counter > 100) {
				done = true;
			}
		}
		donefn();
	}

	public static getNodes() {
		return FileHelper.nodes;
	}

	public static getRoutes() {
		return FileHelper.routes;
	}
}
