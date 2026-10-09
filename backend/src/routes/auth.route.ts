import { Router } from "express";
import AuthController from "../controllers/auth.controller.ts";
import authMiddleware from "../middlewares/auth.middleware.ts";
import authOriginMiddleware from "../middlewares/auth.origin.middleware.ts";
import {
  loginLimiter,
  refreshLimiter,
} from "../middlewares/ratelimit.middleware.ts";

const router = Router();
const controller = new AuthController();

// Browser-origin check protects cookie-setting and cookie-using auth actions.
router.use(authOriginMiddleware);

router.post("/register", loginLimiter, controller.register);
router.post("/login", loginLimiter, controller.login);
router.post("/refresh", refreshLimiter, controller.refresh);
router.post("/logout", controller.logout);
router.post("/logout-all", authMiddleware, controller.logoutAll);

export default router;