const { validationResult } = require('express-validator');

// Runs a set of express-validator chains, then short-circuits with a
// clean 400 response if any of them failed instead of letting bad
// input reach a controller.
function runValidation(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  };
}

module.exports = { runValidation };
