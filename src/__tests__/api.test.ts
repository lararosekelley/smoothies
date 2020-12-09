import { createMocks } from 'node-mocks-http';
import handleRecipes from '@/pages/api/recipes/index';

describe('Recipes API', () => {
  describe('GET /api/recipes', () => {
    test('Returns a 200 response with the proper structure', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handleRecipes(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({
        items: expect.any(Array),
        count: expect.any(Number),
      });
    });
  });
});
