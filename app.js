import express, { json, urlencoded } from 'express';
import compression from 'compression';
import favicon from 'serve-favicon';

import logger from 'morgan';
import router from './route';

import { createServer } from 'http';
import Debug from 'debug';

let app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
});

app.use(logger('common'));
app.use(compression());
app.use(json({
  limit: '10mb'
}));
app.use(urlencoded({ extended: false }));

app.use('/', router);
const debug = Debug('myapp:server');

app.use(favicon('./static/favicon.ico'));

/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val; // named pipe
  if (port >= 0) return port; // port number
  return false;
};
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/**
 * Create HTTP server.
 */

let server = createServer(app);

/**
 * Event listener for HTTP server 'listening' event.
 */

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
};

/**
 * Event listener for HTTP server 'error' event.
 */

const onError = (error) => {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  /**
   *  handle specific listen errors with friendly messages
   */
  switch (error.code) {
  case 'EACCES':
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
  case 'EADDRINUSE':
    console.error(bind + ' is already in use');
    process.exit(1);
  default:
    throw error;
  }
};

/**
 * Listen on provided port, on all network interfaces.
 */
const env = process.env.NODE_ENV || 'devel';
server.listen(port, () => {
  console.log(`Express is running on port ${port} / ${env}`);
});
server.on('error', onError);
server.on('listening', onListening);
