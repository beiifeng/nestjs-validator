import type { AcceptedModelSchema, AcceptedSchema } from "../interface";

export interface ValidatorAdapter {
  name: string;

  isSchema(schema: AcceptedModelSchema): boolean;
  /**
   * The identifier is used to uniquely identify the schema, it can be a string or a symbol or schema self. It is used to cache the schema and model.
   */
  getIdentifier(schema: AcceptedModelSchema): unknown;
  /**
   * Get the properties of the schema, it should return a record of property name and property schema with metadata.
   * If the schema is not an object schema, it should return null.
   */
  getProperties(
    schema: AcceptedModelSchema,
  ): Record<string, { name: string; schema: AcceptedSchema; required: boolean }> | null;

  parse(schema: AcceptedModelSchema, plain: unknown): unknown;
}
