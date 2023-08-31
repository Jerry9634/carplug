//const app = require("./app");
//const findServer = require("./app");
const {
  app,
  findServerIP
} = require("./app");

const port = process.env.PROXY_SERVER_PORT;
app.listen(port, () => {
	/* eslint-disable no-console */
	console.log(`Listening: http://localhost:${port}`);
	/* eslint-enable no-console */
});

findServerIP();
