import Joi from 'joi';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { FieldInfo, OkPacket } from 'mysql';
import { query } from '@/db/index';
import { Recipe } from '@/db/schemas';
import { CREATE_RECIPE, CREATE_INGREDIENTS, LIST_RECIPES } from '@/db/queries';
import {
  httpHeaders,
  httpMethods,
  mysqlErrors,
  statusCodes,
} from '@/utils/constants';
import serialize from '@/utils/serialize';

const listRecipes: NextApiHandler = async (
  _: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const result = (await query(LIST_RECIPES)) as FieldInfo[];

  const recipes = result.map(
    (r: FieldInfo): Record<string, unknown> => serialize.toCamelCase(r)
  );

  return res.json({ items: recipes, count: recipes.length });
};

const createRecipe: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    Joi.assert(req.body, Recipe);
  } catch (e) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .end('Request body contains invalid or missing parameters.');
  }

  const {
    title,
    author,
    description,
    ingredients = [],
    prepTime = null,
    cookingTime = null,
    servings = null,
  } = req.body;

  try {
    const result = (await query(CREATE_RECIPE, [
      title,
      author,
      description,
      prepTime,
      cookingTime,
      servings,
    ])) as OkPacket;

    if (ingredients.length > 0) {
      const ingredientsList = [
        ingredients.map(
          (i: { name: string; quantity: number; unit: string }) => [
            i.name,
            result.insertId,
            i.quantity,
            i.unit,
          ]
        ),
      ];

      await query(CREATE_INGREDIENTS, ingredientsList);
    }

    return res.status(statusCodes.CREATED).json({ id: result.insertId });
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

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;

  switch (method) {
    case httpMethods.GET:
      return listRecipes(req, res);
    case httpMethods.POST:
      return createRecipe(req, res);
    default:
      res.setHeader(httpHeaders.ALLOW, [httpMethods.GET, httpMethods.POST]);
      res
        .status(statusCodes.METHOD_NOT_ALLOWED)
        .end(`Method ${method} not allowed.`);
  }
};

export default handler;
