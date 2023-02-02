const SKIP_AUTH_MODE = require('../config').skipAuth // for dev time
const logger = require('../services/logger.service')


// const SKIP_AUTH_MODE = true;

async function requireAuth(req, res, next) {
  if (SKIP_AUTH_MODE) {
    console.log('SKIP_AUTH_MODE - skip "requireAuth" middleware');
    next();
    return
  }
  if (!req.session?.user?._id) {
    res.status(401).end('Unauthorized!');
    return;
  }
  next();
}

async function requireAdmin(req, res, next) {
  if (SKIP_AUTH_MODE) {
    console.log('SKIP_AUTH_MODE - skip "requireAdmin" middleware');
    next();
    return
  }
  const user = req.session.user;
  if (!user.isAdmin) {
    res.status(403).end('Unauthorized Enough..');
    return;
  }
  next();
}


// module.exports = requireAuth;

module.exports = {
  requireAuth,
  requireAdmin
}
