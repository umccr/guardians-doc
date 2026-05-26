import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  req.app.get("logger")?.error?.(error);
  res.status(500).json({ error: "Internal server error" });
}
