const Router = require('express');
const router = new Router();
const rentalsController = require('../controller/rentals.controller');

router.post('/rentals/:id/return', rentalsController.returnBike);

module.exports = router;
