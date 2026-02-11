const { createServer } = require('./app-server');

const port = Number(process.env.PORT || 3000);
const server = createServer();

server.listen(port, '0.0.0.0', () => {
  console.log(`Inventory server listening on http://0.0.0.0:${port}`);
});
