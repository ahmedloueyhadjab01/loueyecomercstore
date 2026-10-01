const { JSDOM } = require("jsdom");
const dom = new JSDOM(`
  <script>function escapeHtml() {}</script>
  <script>const escapeHtml = () => {}; console.log("SUCCESS");</script>
`, { runScripts: "dangerously" });
