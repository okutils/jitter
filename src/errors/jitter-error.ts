export class JitterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JitterError";
  }
}
