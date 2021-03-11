import NetworkNode, { ReadNode } from '../Models/NetworkNode';

export default class FileHelper {
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
      return Promise.resolve(ret);
    }
    return Promise.reject();
  }

  public static simulateNetwork(nodes: NetworkNode[]) {}
}
