import type { IModelSchema, IProperty, ISchema } from "../interface";

export interface ValidatorAdapter {
  name: string;

  isSchema(schema: ISchema): boolean;

  isNull(schema: ISchema): boolean;

  isUndefined(schema: ISchema): boolean;

  isArray(schema: ISchema): boolean;

  nativeType(
    schema: ISchema,
  ):
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | DateConstructor
    | ArrayConstructor
    | ObjectConstructor
    | null;

  /**
   * Unwrap the schema to get the inner schema, for example, if the schema is an array schema, it will return the item schema.
   */
  unwrap(schema: ISchema): ISchema;

  /**
   * The identifier is used to uniquely identify the schema, it can be a string or a symbol or schema self. It is used to cache the schema and model.
   */
  getIdentifier(schema: ISchema): unknown | null;

  /**
   * Get the properties of the schema, it should return a record of property name and property schema with metadata.
   * If the schema is not an object schema, it should return null.
   */
  getProperties(schema: IModelSchema): Record<string, IProperty> | null;

  parse(schema: ISchema, plain: unknown): unknown;

  check(schema: ISchema, value: unknown): boolean;
}
