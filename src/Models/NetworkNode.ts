export default interface NetworkNode {
  name: string;
  id: number;
  routes: { name: string; cost: number }[];
}
