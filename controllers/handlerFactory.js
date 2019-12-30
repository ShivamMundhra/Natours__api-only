const catchAsync = require('./../utils/catchAsync');
const APIFeaturs = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with the given Id', 404));
    }
    res.status(204).json({
      status: 'Success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError('No document found with the given Id', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with the given Id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To use nested Get reviews in tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //

    const features = new APIFeaturs(Model.find(filter), req.query)
      .sort()
      .filter()
      .limitFields()
      .paginate();
    const doc = await features.query;

    //SEND THE RESPONSE
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
