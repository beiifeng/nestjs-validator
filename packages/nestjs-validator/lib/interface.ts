export type ISchema = unknown;
export type IModelSchema = unknown;
export interface IProperty<S> {
  name: string;
  schema: S;
  required?: boolean;
}
export interface IAdapter<S> {
  name: string;

  /**
   * Check if the schema is a valid schema for this adapter.
   */
  isSchema(schema: S): boolean;

  /**
   * Check if the schema represents a null value.
   */
  isNull(schema: S): boolean;

  /**
   * Check if the schema represents an undefined value.
   */
  isUndefined(schema: S): boolean;

  /**
   * Unwrap the schema to get the underlying type.
   * Remove optional, nullable, array, or default wrappers to get the core schema type.
   *
   * @example
   * ```js
   * unwrap(z.string().optional()); // returns z.string()
   * unwrap(z.number().nullable()); // returns z.number()
   * unwrap(z.array(z.string()));   // returns z.string()
   * unwrap(z.object({ name: z.string() })); // returns z.object({ name: z.string() })
   * ```
   */
  unwrap(schema: S): S;

  /**
   * Get the native JavaScript type that corresponds to the schema.
   *
   * @example
   * ```js
   * native(z.string());  // returns String
   * native(z.number());  // returns Number
   * native(z.boolean()); // returns Boolean
   * native(z.date());    // returns Date
   * native(z.array(z.string())); // returns Array
   * native(z.object({ name: z.string() })); // returns Object
   *
   * native(z.string().optional());   // returns String
   * native(z.number().nullable());   // returns Number
   * native(z.array(z.string()).optional());  // returns Array
   * native(z.object({ name: z.string() }).nullable());   // returns Object
   *
   * native(z.union([z.string(), z.number()])); // returns null (no single native type)
   * native(z.any()); // returns null (no single native type)
   * native(z.unknown()); // returns null (no single native type)
   * native(z.never()); // returns null (no single native type)
   * ```
   */
  native(
    schema: S,
  ):
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | DateConstructor
    | ArrayConstructor
    | ObjectConstructor
    | null;

  /**
   * Get the identifier for the schema.
   *
   * This identifier is used to map schemas to their corresponding models.
   * It can be a string, number, or any other value that uniquely identifies the schema.
   * Suggested identifiers should be stable.
   */
  getIdentifier(schema: S): unknown | null;

  /**
   * Get the properties of a model schema.
   *
   * This method returns a record of property names to their corresponding Property definitions.
   * If the schema does not represent a model, it returns null.
   */
  getProperties(schema: S): Record<string, IProperty<S> | null>;

  /**
   * Parse a plain object into a value that matches the schema.
   * This is useful for converting data from external sources (like JSON) into the expected types defined by the schema.
   */
  parse(schema: S, plain: unknown): unknown;

  /**
   * Check if a value matches the schema.
   */
  check(schema: S, value: unknown): boolean;
}
export interface IModelZ<T> {
  new (): T;
  new (plain: Partial<T>): T;
}
export interface ModelOption<S> {
  name?: string;
  /**
   * For example, use this to apply `ApiExtraModels` or other decorators to the model class.
   *
   * ```js
   * const options = {
   *  decorators: [({ givenName, uniqueName }) => givenName !== uniqueName ? ApiExtraModels(uniqueName) : null]
   * };
   * ```
   */
  decorators?: Array<({ givenName, uniqueName }: { givenName: string; uniqueName: string }) => ClassDecorator | null>;
  /**
   * For example, use this to apply `ApiProperty`, `ApiPropertyOptional`, or other decorators to the properties of the model.
   */
  propertyProcessor?: (target: object, name: string, schema: S) => void;
}
