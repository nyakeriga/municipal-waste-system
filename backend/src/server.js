const app = require('./app');
const config = require('./config/default.json');

const PORT = process.env.PORT || config.server.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
