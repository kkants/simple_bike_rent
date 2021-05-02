const { body } = require('express-validator');
exports.bikeTypeSchema = [
  body('name')
    .exists()
    .withMessage('name is required')
    .isLength({ min: 3 })
    .withMessage('Must be at least 3 chars long'),
];
