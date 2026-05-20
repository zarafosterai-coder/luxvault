import { Composio } from "composio-core";
const c = new Composio({ apiKey: "test" });
async function run() {
  const ent = await c.getEntity("test");
  console.log(ent.execute.toString());
}
run();
