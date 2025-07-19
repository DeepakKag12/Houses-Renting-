// schema.js
const Joi = require("joi");
const review = require("./models/review");




module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.alternatives().try(
      Joi.string().uri().allow(''), 
      Joi.object({
        url: Joi.string().uri().required(),
        filename: Joi.string().optional()
      })
    ).optional(),
    geometry: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).optional()
  }).required()
});


module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().min(1).required().messages({
      "string.empty": "Comment cannot be empty",
      "string.min": "Comment must be at least 1 character long"
    })
  }).required()
});