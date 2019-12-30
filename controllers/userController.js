const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedfields) => {
  const tempObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedfields.includes(el)) tempObj[el] = obj[el];
  });
  return tempObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   //SEND THE RESPONSE
//   res.status(200).json({
//     status: 'success',
//     requestTime: req.requestTime,
//     results: users.length,
//     data: {
//       users
//     }
//   });
// });

exports.currentUserUpdate = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('For password update head to /updatePassword', 400)
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'this route is not handled. Please Use /signup instead'
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUserById = factory.getOne(User);
exports.deleteUserById = factory.deleteOne(User);
exports.updateUserById = factory.updateOne(User);
