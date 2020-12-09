import mysql from 'serverless-mysql';

export const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
  },
});

export const query = async (
  q: string,
  values: (string | number)[] | string | number = []
): Promise<unknown> => {
  const results = await db.query(q, values);
  await db.end();

  return results;
};
