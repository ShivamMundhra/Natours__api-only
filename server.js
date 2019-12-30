const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('Uncaugh exceptions. SHUTTING DOWN...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection Successful'));

const port = process.env.PORT || 1000;
const server = app.listen(port, () => {
  console.log(process.env.NODE_ENV);
  console.log(`App running on port ${port}..`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLERD REJECTIONS. SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
