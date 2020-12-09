import Joi from 'joi';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { FieldInfo } from 'mysql';
import { query } from '@/db/index';
import { Recipe } from '@/db/schemas';
import {
  CREATE_INGREDIENTS,
  DELETE_RECIPE,
  DELETE_INGREDIENT,
  GET_RECIPE,
  GET_RECIPE_INGREDIENTS,
  GET_RECIPE_INGREDIENTS_LIMITED,
  UPDATE_RECIPE,
  UPDATE_INGREDIENT,
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
    ingredients = [],
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

    // Update ingredients for recipe; delete ones omitted and add new ones
    const existingIds = currentIngredients.map(
      (i: Record<string, unknown>) => i.id
    ) as number[];
    const updatedIds = ingredients
      .filter(
        (i: Record<string, unknown>) =>
          typeof i.id === 'number' && existingIds.includes(i.id)
      )
      .map((i: Record<string, unknown>) => i.id) as number[];
    const omittedIngredients = currentIngredients
      .filter(
        (i: Record<string, unknown>) =>
          typeof i.id === 'number' && !updatedIds.includes(i.id)
      )
      .map((i: Record<string, unknown>) => i.id) as number[];

    // Insert or update
    for (const ingredient of ingredients) {
      if (!updatedIds.includes(ingredient.id)) {
        if (
          !ingredient.name ||
          typeof ingredient.quantity !== 'number' ||
          !ingredient.unit
        ) {
          return res
            .status(statusCodes.BAD_REQUEST)
            .end(
              'New ingredients are missing required fields: name, quantity, or number'
            );
        }

        await query(CREATE_INGREDIENTS, [
          [
            [
              ingredient.name,
              Number.parseInt(recipeId as string),
              ingredient.quantity,
              ingredient.unit,
            ],
          ],
        ]);
      } else {
        const currentIngredient = currentIngredients.filter(
          (i: { id: number; name: string; quantity: number; unit: string }) =>
            i.id === ingredient.id
        )[0];

        await query(UPDATE_INGREDIENT, [
          ingredient.name || currentIngredient.name,
          Number.parseInt(recipeId as string),
          typeof ingredient.quantity === 'number'
            ? ingredient.quantity
            : currentIngredient.quantity,
          ingredient.unit || currentIngredient.unit,
        ]);
      }
    }

    // Delete
    for (const oi of omittedIngredients) {
      await query(DELETE_INGREDIENT, oi);
    }

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
