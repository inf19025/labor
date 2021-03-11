import { ReadNode } from '../Simulation/Models/Node';
import { Route } from '../Simulation/Models/Route';
import NetworkNode from '../Simulation/NetworkNode';

export default class FileHelper {
  private static nodes: NetworkNode[] = [];
  private static routes: Route[] = [];

  /**
   *
   * @param file the file to be parsed
   * @returns the parsed content | rejects promise if not right format
   */
  public static async parseFile(file: File): Promise<NetworkNode[]> {
    let content: ReadNode[] = [];
    let valid: boolean = true;

    content = JSON.parse(await file.text());

    content.forEach((value) => {
      if (
        value.node.id === undefined ||
        value.node.name === undefined ||
        value.routes === undefined
      ) {
        valid = false;
      }
    });

    if (valid) {
      const ret = content.map((value) => {
        return new NetworkNode(value.node, value.routes);
      });
      FileHelper.nodes = ret;

      return Promise.resolve(ret);
    }
    return Promise.reject();
  }

  public static simulateNetwork() {}

  public static getNodes() {
    return FileHelper.nodes;
  }

  public static getRoutes() {
    return FileHelper.routes;
  }
}
