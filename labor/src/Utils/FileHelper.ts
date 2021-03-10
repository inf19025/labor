import NetworkNode from '../Models/NetworkNode';

export default class FileHelper {
  /**
   *
   * @param file the file to be parsed
   * @returns the parsed content | rejects promise if not right format
   */
  public static async parseFile(file: File): Promise<NetworkNode[]> {
    let content: NetworkNode[] = [];
    let valid: boolean = true;

    content = JSON.parse(await file.text());

    content.forEach((value) => {
      if (
        value.id === undefined ||
        value.name === undefined ||
        value.routes === undefined
      ) {
        valid = false;
      }
    });

    if (valid) {
      return Promise.resolve(content);
    }
    return Promise.reject();
  }
}
