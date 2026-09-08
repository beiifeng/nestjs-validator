import { Model, ModelZ } from "@beiifeng/nestjs-validator";
import t from "typebox";

const $Role = t.Object(
  {
    name: t.String({ minLength: 1, maxLength: 20 }),
    description: t.Optional(t.String({ maxLength: 100 })),
  },
  { $id: "urn:uuid:9aee8306-7fb1-41cc-a6e5-5bd829172ea3" },
);

@Model($Role)
export class Role extends ModelZ($Role) {}

const $User = t.Object(
  {
    username: t.String({ minLength: 1, maxLength: 20 }),
    gender: t.Enum({ male: "male", female: "female", other: "other" }),
    age: t.Number({ minimum: 0, maximum: 150 }),
    email: t.String({ format: "email" }),
    roles: t.Optional(t.Array($Role)),
  },
  { $id: "urn:uuid:96a62b19-1bca-4869-b441-8e7a82dcd2cb" },
);

@Model($User)
export class User extends ModelZ($User) {}
