import Joi from 'joi';

export const Ingredient = Joi.object({
  name: Joi.string().required(),
  quantity: Joi.number().greater(0).required(),
  unit: Joi.string().required(),
  recipeId: Joi.number().integer(),
});

export const Recipe = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().max(255).required(),
  description: Joi.string().required(),
  ingredients: Joi.array().items(Ingredient),
  prepTime: Joi.number().integer().min(0).allow(null),
  cookingTime: Joi.number().integer().min(0).allow(null),
  servings: Joi.number().integer().min(0).allow(null),
});
