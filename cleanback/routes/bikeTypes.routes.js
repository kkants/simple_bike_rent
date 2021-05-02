const Router = require('express');
const router = new Router();
const {
  bikeTypeSchema,
} = require('../middleware/bikeTypeValidator.middleware');
const bikeTypesController = require('../controller/bikeTypes.controller');

router.post('/bikeTypes', bikeTypeSchema, bikeTypesController.createBikeType);
router.get('/bikeTypes', bikeTypesController.getBikeTypes);

module.exports = router;
