import { Router } from "express";

export function createApiRouter(): Router {
  const router = Router();

  router.get("/me", (req, res) => {
    const user = req.session.user;

    res.json({
      authenticated: Boolean(user),
      user: user ?? null,
    });
  });

  router.get("/protected", (req, res) => {
    const user = req.session.user;

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    res.json({
      message: "This is protected data from the backend.",
      user,
    });
  });

  return router;
}
