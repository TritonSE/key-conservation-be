const express = require('express');
const server = express();

const helmet = require('helmet');
const cors = require('cors');
const checkJwt = require('../middleware/authJwt.js')

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(express());
server.use(helmet());
server.use(cors());

server.get('/', (req, res) => {
  res.send(`<h1>Server live</h1>`);
});

// defined routes
server.use('/api/users', require('../users/usersRouter'));
server.use('/api/campaigns', checkJwt, require('../campaigns/campRouter'));
server.use(
  '/api/updates',
  checkJwt,
  require('../campaignUpdates/updateRouter')
);
server.use('/api/comments', checkJwt, require('../comments/commentsRouter'));
server.use('/api/social', checkJwt, require('../social/socialRouter'));

module.exports = server