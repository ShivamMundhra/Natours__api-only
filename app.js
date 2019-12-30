const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//serve static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//MIDDLEWARES
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 150,
  windowMs: 60 * 60 * 1000,
  message: 'Number of requests exceeded the limit.Try again in one hour'
});
app.use('/api', limiter);
//parse the data  then clean the data
app.use(express.json({ limit: '10kb' }));
//sanitize the data(NoSQL Query injection and Xss attack)
app.use(mongoSanitize());
app.use(xss());

//to prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// app.get('/api/v1/tours',getAllTours );
// app.get('/api/v1/tours/:id', getTourById);
// app.post('/api/v1/tours',createTour);
// app.patch('/api/v1/tours/:id',updatedTourById);
// app.delete('/api/v1/tours/:id', deleteTourById);
//Routes

//MOUNTING THE ROUTER
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: ` Cannot find ${req.originalUrl} on this server`
  // });
  //next();
  next(new AppError(` Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
