const moongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new moongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Empty Review is not allowed']
    },
    rating: {
      type: Number,
      // required:[true,'A review must have a rating'],
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      // required:[true,'review must a have createdAt timestamp'],
      default: Date.now()
    },
    tour: {
      type: moongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: moongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  //   .populate({
  //     path: 'tour',
  //     select: 'name'
  //   });
  next();
});

reviewSchema.statics.calculateAvgRating = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calculateAvgRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  this.r.constructor.calculateAvgRating(this.r.tour);
});

const Review = moongoose.model('Review', reviewSchema);

module.exports = Review;
