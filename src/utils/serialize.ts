import { FieldInfo } from 'mysql';
import { camelCase, mapKeys } from 'lodash/fp';

export const toCamelCase = (obj: FieldInfo): Record<string, unknown> => {
  return mapKeys(camelCase)(obj);
};

export default {
  toCamelCase,
};
