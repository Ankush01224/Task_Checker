// Central error handler. Any controller that calls next(err) lands here,
// so error responses stay in one consistent shape across the whole API.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong on our end' : err.message;

  res.status(status).json({ message });
}

function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

module.exports = { errorHandler, notFound };
