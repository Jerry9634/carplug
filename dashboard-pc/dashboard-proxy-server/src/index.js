//const app = require("./app");
//const findServer = require("./app");
const {
  app,
  findServerIP
} = require("./app");

const port = process.env.PORT || 5000;
app.listen(port, () => {
	/* eslint-disable no-console */
	console.log(`Listening: http://localhost:${port}`);
	/* eslint-enable no-console */
});

findServerIP();
