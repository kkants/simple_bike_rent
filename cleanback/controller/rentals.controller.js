const { Rentals } = require('../models/models');
const { Op } = require('sequelize');
const HttpException = require('../utils/HttpException.utils');

class RentalsController {
  async returnBike(req, res, next) {
    const { id } = req.params;

    const returnTime = new Date();
    const returned_on = returnTime.toUTCString();
    const rentCheck = await Rentals.findAndCountAll({
      where: {
        id: id,
        returned_on: { [Op.ne]: null },
      },
    });
    const { count } = rentCheck;
    if (count > 0) {
      next(new HttpException(406, 'The bike is free at the moment '));
      return;
    }
    const returnning = await Rentals.update(
      { returned_on: returned_on },
      {
        where: {
          id: id,
        },
      }
    );
    return res.json(`Bike with rentId:${id} returned`);
  }
}

module.exports = new RentalsController();
