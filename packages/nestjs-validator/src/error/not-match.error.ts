export class NotMatchError extends Error {
  path: string[];

  constructor(message: string, path: string[]) {
    super(message);
    this.name = "NotMatchError";
    this.path = path;
  }

  toJSON() {
    return {
      path: this.path,
      message: this.message,
    };
  }
}
