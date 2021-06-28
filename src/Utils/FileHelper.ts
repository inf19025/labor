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
						return false;
					}
				} else {
					if (currRoot.name !== node.getNode().name) {
						return false;
					}
				}
			}
		}
		return true;
	}

	private static generateResult() {
		this.nodes.forEach(() => {});
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

	public static simulateNetwork() {
		let done = FileHelper.determineDone();
		while (!done) {
			console.log(done);
			FileHelper.nodes.forEach((node) => {
				node.scanRoutes();
			});
			done = FileHelper.determineDone();
		}
		console.log(FileHelper.nodes);
	}

	public static getNodes() {
		return FileHelper.nodes;
	}

	public static getRoutes() {
		return FileHelper.routes;
	}
}
