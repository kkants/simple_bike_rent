const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const BikeType = sequelize.define(
  'biketypes',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  {
    timestamps: false,
  }
);

const Bike = sequelize.define(
  'bikes',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    timestamps: false,
  }
);

const Rentals = sequelize.define(
  'rentals',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rented_on: { type: DataTypes.DATE, allowNull: false },
    returned_on: { type: DataTypes.DATE, defaultValue: null },
  },
  {
    timestamps: false,
  }
);

BikeType.hasMany(Bike);
Bike.belongsTo(BikeType);

Bike.hasMany(Rentals);
Rentals.belongsTo(Bike);

module.exports = { BikeType, Bike, Rentals };
