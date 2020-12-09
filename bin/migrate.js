/* eslint-disable */

const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');

require('dotenv').config({ path: envPath });

const mysql = require('serverless-mysql');

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
  },
});

const createRecipes = `
  CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    prep_time INT,
    cooking_time INT,
    servings INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createIngredients = `
  CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    name TEXT NOT NULL,
    quantity INT NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
`;

async function query(q) {
  try {
    const results = await db.query(q);
    await db.end();
    return results;
  } catch (e) {
    throw Error(e.message);
  }
}

async function migrate() {
  try {
    await query(createRecipes);
    await query(createIngredients);

    console.log('Finished running database migration!');
  } catch (e) {
    console.error(e);
    console.error(
      'Unable to run migration. Are your credentials specified in .env correct?'
    );
    process.exit(1);
  }
}

migrate().then(() => process.exit());
