import app, { findServerIP } from("./app.js");

const port = process.env.PROXY_SERVER_PORT;
app.listen(port, () => {
	/* eslint-disable no-console */
	console.log(`Listening: http://localhost:${port}`);
	/* eslint-enable no-console */
});

findServerIP();
