export {};

declare module "express-serve-static-core" {
  interface Request {
    session?: { user: { id: string } & Record<string, unknown> };
  }
}
