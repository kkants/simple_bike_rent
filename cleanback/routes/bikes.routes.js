const Router = require('express');
const router = new Router();
const { createBikeSchema } = require('../middleware/bikeValidator.middleware');
const bikesController = require('../controller/bikes.controller');

router.post('/bikes', createBikeSchema, bikesController.createBikes);
router.get('/bikes', bikesController.getBikes);
// router.get('/bikes/:id', bikesController.getOneBike);

router.get('/bikes/rentActive', bikesController.getRentsActive);

router.delete('/bikes/:id', bikesController.deleteOneBike);

//router.get('/bikesByType/:id', bikesController.getBikesbyType);

router.post('/bikes/:id/rent', bikesController.rentBike);

module.exports = router;
