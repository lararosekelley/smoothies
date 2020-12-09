import Joi from 'joi';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { FieldInfo, OkPacket } from 'mysql';
import { query } from '@/db/index';
import { Recipe } from '@/db/schemas';
import {
  DELETE_RECIPE,
  GET_RECIPE,
  GET_RECIPE_INGREDIENTS,
  GET_RECIPE_INGREDIENTS_LIMITED,
  UPDATE_RECIPE,
} from '@/db/queries';
import {
  httpHeaders,
  httpMethods,
  mysqlErrors,
  statusCodes,
} from '@/utils/constants';
import serialize from '@/utils/serialize';

const getRecipe: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const {
    query: { recipeId },
  } = req;

  try {
    const recipeResult = (await query(GET_RECIPE, recipeId)) as FieldInfo[];
    const ingredientsResult = (await query(
      GET_RECIPE_INGREDIENTS,
      recipeId
    )) as FieldInfo[];

    if (!recipeResult.length) {
      return res
        .status(statusCodes.NOT_FOUND)
        .end(`Recipe with ID ${recipeId} not found.`);
    }

    const recipe = serialize.toCamelCase(recipeResult[0]);
    const ingredients = ingredientsResult.map(
      (r: FieldInfo): Record<string, unknown> => serialize.toCamelCase(r)
    );

    recipe.ingredients = ingredients;

    return res.json(recipe);
  } catch (e) {
    switch (e.code) {
      default:
        return res
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .end(`An unknown error occurred: ${e.message}`);
    }
  }
};

const updateRecipe: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const {
    query: { recipeId },
  } = req;

  const recipeResult = (await query(GET_RECIPE, recipeId)) as FieldInfo[];
  const ingredientsResult = (await query(
    GET_RECIPE_INGREDIENTS_LIMITED,
    recipeId
  )) as FieldInfo[];

  if (!recipeResult.length) {
    return res
      .status(statusCodes.NOT_FOUND)
      .end(`Recipe with ID ${recipeId} not found.`);
  }

  const currentRecipe = serialize.toCamelCase(recipeResult[0]);
  const currentIngredients = ingredientsResult.map(
    (r: FieldInfo): Record<string, unknown> => serialize.toCamelCase(r)
  );

  currentRecipe.ingredients = currentIngredients;

  const {
    title = currentRecipe.title,
    author = currentRecipe.author,
    description = currentRecipe.description,
    prepTime = currentRecipe.prepTime,
    cookingTime = currentRecipe.cookingTime,
    servings = currentRecipe.servings,
  } = req.body;

  const updatedRecipe = {
    title,
    author,
    description,
    ingredients: [],
    prepTime,
    cookingTime,
    servings,
  };

  try {
    Joi.assert(updatedRecipe, Recipe);
  } catch (e) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .end('Request body contains invalid or missing parameters.');
  }

  try {
    await query(UPDATE_RECIPE, [
      title,
      author,
      description,
      prepTime,
      cookingTime,
      servings,
      recipeId,
    ]);

    return res.json({ id: recipeId });
  } catch (e) {
    switch (e.code) {
      case mysqlErrors.DUPLICATE:
        return res
          .status(statusCodes.CONFLICT)
          .end(`Recipe with title '${title}' already exists.`);
      default:
        return res
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .end(`An unknown error occurred: ${e.message}`);
    }
  }
};

const deleteRecipe: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const {
    query: { recipeId },
  } = req;

  try {
    await query(DELETE_RECIPE, recipeId);

    return res.status(statusCodes.NO_CONTENT).end();
  } catch (e) {
    switch (e.code) {
      default:
        return res
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .end(`An unknown error occurred: ${e.message}`);
    }
  }
};

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;

  switch (method) {
    case httpMethods.GET:
      return getRecipe(req, res);
    case httpMethods.PATCH:
      return updateRecipe(req, res);
    case httpMethods.DELETE:
      return deleteRecipe(req, res);
    default:
      res.setHeader(httpHeaders.ALLOW, [
        httpMethods.GET,
        httpMethods.PATCH,
        httpMethods.DELETE,
      ]);
      res
        .status(statusCodes.METHOD_NOT_ALLOWED)
        .end(`Method ${method} not allowed.`);
  }
};

export default handler;
