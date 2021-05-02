const { body } = require('express-validator');

exports.createBikeSchema = [
  body('name')
    .exists()
    .withMessage('title is required')
    .isLength({ min: 3 })
    .withMessage('Must be at least 3 chars long'),
  body('price')
    .exists()
    .withMessage('price is required')
    .isNumeric()
    .withMessage('Must be a number'),
  body('biketypeId')
    .exists()
    .withMessage('biketypeId is required')
    .isNumeric()
    .withMessage('Must be a number'),
];
