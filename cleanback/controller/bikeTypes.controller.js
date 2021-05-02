const { BikeType } = require('../models/models');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');

class BikeTypesController {
  async createBikeType(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new HttpException(422, { message: 'Validation failed!', errors }));
      return;
    }
    const { name } = req.body;
    const checkTypeExist = await BikeType.findOne({ name });
    if (checkTypeExist) {
      next(new HttpException(422, 'This type name is already exist'));
      return;
    }
    const type = await BikeType.create({ name });
    return res.json(type);
  }

  async getBikeTypes(req, res) {
    const bikeTypes = await BikeType.findAll();
    return res.json(bikeTypes);
  }
}

module.exports = new BikeTypesController();
