export const CREATE_RECIPE = `
  INSERT INTO recipes
    (
      title,
      author,
      description,
      prep_time,
      cooking_time,
      servings
    )
  VALUES
    (?, ?, ?, ?, ?, ?);
`;

export const CREATE_INGREDIENTS = `
  INSERT INTO ingredients
    (
      name,
      recipe_id,
      quantity,
      unit
    )
  VALUES
    ?;
`;

export const DELETE_RECIPE = `
  DELETE FROM
    recipes
  WHERE
    id = ?;
`;

export const GET_RECIPE = `
  SELECT
    *
  FROM
    recipes
  WHERE
    id = ?;
`;

export const GET_RECIPE_INGREDIENTS = `
  SELECT
    *
  FROM
    ingredients
  WHERE
    recipe_id = ?;
`;

export const GET_RECIPE_INGREDIENTS_LIMITED = `
  SELECT
    id,
    name,
    recipe_id,
    quantity,
    unit
  FROM
    ingredients
  WHERE
    recipe_id = ?;
`;

export const LIST_RECIPES = `
  SELECT
    *
  FROM
    recipes;
`;

export const UPDATE_RECIPE = `
  UPDATE
    recipes
  SET
    title = ?,
    author = ?,
    description = ?,
    prep_time = ?,
    cooking_time = ?,
    servings = ?
  WHERE
    id = ?;
`;

export const UPDATE_INGREDIENT = `
  UPDATE
    ingredients
  SET
    name = ?,
    quantity = ?,
    unit = ?
  WHERE
    id = ?;
`;

export const DELETE_INGREDIENT = `
  DELETE FROM
    ingredients
  WHERE
    id = ?;
`;
