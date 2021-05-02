const express = require('express');
const HttpException = require('./utils/HttpException.utils');
const cors = require('cors');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const sequelize = require('./config/db');
const models = require('./models/models');
const bikesRouter = require('./routes/bikes.routes');
const bikeTypesRouter = require('./routes/bikeTypes.routes');
const rentalsRouter = require('./routes/rental.routes');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', bikesRouter);
app.use('/api', bikeTypesRouter);
app.use('/api', rentalsRouter);

app.all('*', (req, res, next) => {
  const err = new HttpException(404, 'Endpoint Not Found');
  console.log(err);
  next(err);
});

app.use(errorHandler);
const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();

module.exports = app;
