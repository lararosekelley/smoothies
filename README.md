# Smoothies

> Next.js-based API for managing recipes

---

Live demo available [here](https://smoothies-psi.vercel.app/api/recipes).

## Getting started

Clone the repository:

```bash
$ git clone git@github.com:tylucaskelley/smoothies
```

### System-level dependencies

Install the following:

- [Node.js 15.3.0](https://nodejs.org/en/download/)
  - Or, run `nodenv install` from the root project folder, if
    using the [Nodenv](https://github.com/nodenv/nodenv) version manager
- [Yarn 1.22.10](https://yarnpkg.com/)

### Local setup

Run `yarn install` to grab project dependencies. Next, configure a MySQL 8.0 database
for use during local development. Copy `.env.example` to `.env` and fill in the database
configuration information.

Then, run database migrations:

```bash
$ yarn migrate
```

Once done, start the local development server:

```bash
$ yarn dev
```

## Testing endpoints

The following examples use the [HTTPie](https://httpie.io/) client:

### POST /api/recipes

Creates a new recipe, can optionally include ingredients as well:

```bash
$ http post http://localhost:3000/api/recipes \
    title="Strawberry Smoothie" author="Ty Kelley" description="A strawberry smoothie" prepTime=15 cookingTime=5 servings=4 \
    ingredients:='[{ "name": "Sugar", "quantity": 5, "unit": "tsp" }, {"name": "Strawberries", "quantity": 2, "unit": "cups"}]' \
    --verbose
```

Request body example:

```json
{
  "author": "Ty Kelley",
  "description": "A strawberry smoothie",
  "ingredients": [
    {
      "name": "Sugar",
      "quantity": 5,
      "unit": "tsp"
    },
    {
      "name": "Strawberries",
      "quantity": 2,
      "unit": "cups"
    }
  ],
  "title": "Strawberry Smoothie",
  "prepTime": 15,
  "cookingTime": 5,
  "servings": 4
}
```

The title of a recipe must be unique within the system.

### GET /api/recipes

Retrieve a list of recipes:

```bash
$ http get http://localhost:3000/api/recipes --verbose
```

### GET /api/recipes/:id

Retrieve a single recipe, by ID:

```bash
$ http get http://localhost:3000/api/recipes/1 --verbose
```

### PATCH /api/recipes/:id

Update a recipe and its ingredients. Only provide the fields you want to update:

```bash
$ http patch http://localhost:3000/api/recipes/1 title="Even better strawberry smoothie" --verbose
```

Request body example (note that new ingredients as well as existing ingredients can be handled):

```json
{
  "ingredients": [
    {
      "name": "Sugar",
      "id": 14,
      "quantity": 3,
      "unit": "tsp"
    },
    {
      "name": "Oranges",
      "quantity": 2,
      "unit": "slices"
    }
  ],
  "title": "Strawberry Smoothie w/ Orange"
}
```

### DELETE /api/recipes/:id

Delete a recipe, by ID:

```bash
$ http delete http://localhost:3000/api/recipes/1 --verbose
```

## Testing

### Code style

Code is formatted automatically with [Prettier](https://prettier.io), via a pre-commit hook. A
few tasks are available as well:

- `yarn lint`: Check code style with ESLint, configured with TypeScript support
- `yarn format`: Format code using Prettier
- `yarn type-check`: Validate TypeScript type annotations and catch errors

### Automated tests

Run `yarn test` to test the API endpoints; note that a working database connection is needed
for tests to function.

## License

See [LICENSE](./LICENSE) file for details.
