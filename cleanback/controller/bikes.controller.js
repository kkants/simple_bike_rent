const HttpException = require('../utils/HttpException.utils');
const { Bike } = require('../models/models');
const { Rentals } = require(`../models/models`);
const { validationResult } = require('express-validator');

class BikesController {
  async createBikes(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new HttpException(422, { message: 'Validation failed!', errors }));
      return;
    }
    const { name, price, biketypeId } = req.body;

    const bike = await Bike.create({ name, price, biketypeId });
    return res.json(bike);
  }

  async getBikes(req, res, next) {
    const bikes = await Bike.findAndCountAll();
    return res.json(bikes);
  }

  async deleteOneBike(req, res, next) {
    const { id } = req.params;
    const rentCheck = await Rentals.findAndCountAll({
      where: {
        bikeId: id,
        returned_on: null,
      },
    });
    const { count } = rentCheck;
    if (count > 0) {
      next(new HttpException(406, 'Bike is busy at the moment'));
      return;
    }
    const bikes = await Bike.destroy({ where: { id } });
    return bikes
      ? res.json(`Bike wiht id:${id} was deleted`)
      : next(new HttpException(404, 'Bike not found'));
  }
  async getRentsActive(req, res, next) {
    const activeRentals = await Rentals.findAndCountAll({
      where: { returned_on: null },
    });
    res.json(activeRentals);
  }

  async rentBike(req, res, next) {
    try {
      const { id } = req.params;
      const rentTime = new Date();
      const rented_on = rentTime.toUTCString();

      const rentCheck = await Rentals.findAndCountAll({
        where: {
          bikeId: id,
          returned_on: null,
        },
      });
      const { count } = rentCheck;
      if (count > 0) {
        next(new HttpException(406, 'Bike is busy at the moment'));
        return;
      }
      const rental = await Rentals.create({
        bikeId: id,
        rented_on,
      });
      return res.json(rental);
    } catch {
      next(new HttpException(404, 'Bike not found'));
      return;
    }
  }
  // async rentCheck(){

  // }
}

module.exports = new BikesController();
