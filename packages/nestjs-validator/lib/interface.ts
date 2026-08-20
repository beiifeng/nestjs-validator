import type { Type } from "@nestjs/common";

export type ISchema = unknown;
export type IModelSchema = unknown;
export type NativeType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | BigIntConstructor
  | ArrayConstructor
  | ObjectConstructor;
export type MixedType = NativeType | Type;

export interface IProperty<S> {
  name: string;
  schema: S;
  required?: boolean;
  description?: string;
  example?: unknown;
  examples?: unknown[] | Record<string, unknown>;
}
export interface IAdapter<S> {
  readonly name: string;

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
   * Check if the schema represents an enumeration type (enum).
   */
  isEnum(schema: S): boolean;

  /**
   * Unwrap the schema to get the underlying type.
   * Remove optional, nullable, array, or default wrappers to get the core schema type.
   *
   * @example Zod
   * ```js
   * // Zod
   * unwrap(z.string().optional()); // returns z.string()
   * unwrap(z.number().nullable()); // returns z.number()
   * unwrap(z.array(z.string()));   // returns z.string()
   * unwrap(z.object({ name: z.string() })); // returns z.object({ name: z.string() })
   * ```
   *
   * @example TypeBox
   * ```js
   * // TypeBox
   * unwrap(t.Union([t.String(), t.Null()])); // returns t.String()
   * unwrap(t.Array(t.String()));     // returns t.String()
   * unwrap(t.Optional(t.String()));  // returns t.Optional(t.String())
   * unwrap(t.Object({ name: t.String() }));  // returns t.Object({ name: t.String() })
   * ```
   */
  unwrap(schema: S): S;

  /**
   * Get the native JavaScript type that corresponds to the schema.
   *
   * @example Zod
   * ```js
   * native(z.string());  // returns String
   * native(z.number());  // returns Number
   * native(z.boolean()); // returns Boolean
   * native(z.date());    // returns Date
   * native(z.bigint());  // returns BigInt
   * native(z.array(z.string())); // returns Array
   * native(z.object({ name: z.string() })); // returns Object
   *
   * native(z.string().optional());   // returns String
   * native(z.number().nullable());   // returns Number
   * native(z.boolean().optional());  // returns Boolean
   * native(z.date().nullable());     // returns Date
   * native(z.array(z.string()).optional());  // returns Array
   * native(z.object({ name: z.string() }).nullable()); // returns Object
   *
   * native(z.union([z.string(), z.number()])); // returns null (no single native type)
   * native(z.any());     // returns null (no single native type)
   * native(z.unknown()); // returns null (no single native type)
   * native(z.never());   // returns null (no single native type)
   * ```
   *
   * @example TypeBox
   * ```js
   * native(t.String());  // returns String
   * native(t.Number());  // returns Number
   * native(t.Boolean()); // returns Boolean
   * native(t.Date());    // returns Date
   * native(t.BigInt());  // returns BigInt
   * native(t.Array(t.String())); // returns Array
   * native(t.Object({ name: t.String() })); // returns Object
   *
   * native(t.Union([t.String(), t.Null()])); // returns String
   * native(t.Union([t.String(), t.Undefined()])); // returns String
   *
   * native(t.Union([t.String(), t.Number()])); // returns null (no single native type)
   * native(t.Any());     // returns null (no single native type)
   * native(t.Unknown()); // returns null (no single native type)
   * native(t.Never());   // returns null (no single native type)
   * ```
   */
  native(schema: S): NativeType | null;

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
   * Get the enumeration values of a schema if it represents an enum type.
   *
   * Returns an array of enum values if the schema is an enum, otherwise returns null.
   */
  getEnumValues(schema: S): unknown[] | null;

  /**
   * Get the JSON schema.
   *
   * Recommended to return `JSON Schema 2020-12` standard.
   */
  getJSONSchema(schema: S): unknown;

  /**
   * Parse a plain object into a value that matches the schema.
   * This is useful for converting data from external sources (like JSON) into the expected types defined by the schema.
   *
   * TODO: throw Error
   */
  parse(schema: S, plain: unknown): unknown;

  /**
   * Check if a value matches the schema.
   *
   * TODO: throw Error
   */
  check(schema: S, value: unknown): boolean;
}
export interface IModelZ<T> {
  new (): T;
  new (plain: Partial<T>): T;
}
export interface ModelOptions {
  name?: string;
  description?: string;
}

export type PluginType = "onModel" | "doModel" | "onModelZ";
export interface IPluginRt {
  readonly adapter: IAdapter<ISchema>;
  readonly schema: IModelSchema;
  readonly getType: (schema: ISchema) => MixedType | null;
}
export interface IPluginCtx {
  readonly target: Type;
  /** The name from the target class, generated by `Function.name` */
  readonly targetName: string;
  /** The name that will be used for the model, which may be modified by plugins */
  name: string;
  description?: string;
}
export interface IPlugin {
  readonly type: PluginType;
  readonly name: string;

  // // biome-ignore lint/suspicious/noConfusingVoidType: Void is used to indicate that the plugin does not return a context, which is valid for certain plugin types.
  apply: (rt: IPluginRt, ctx: IPluginCtx) => IPluginCtx | undefined;
}
