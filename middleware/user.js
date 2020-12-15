const User = require('../models/user');

module.exports = async function(request, response, next) {
  if (!request.session.user) {
    return next();
  }
  request.user = await User.findById(request.session.user._id);
  next();
}