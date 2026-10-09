
import { Router } from "express";
import TokenController from "../controllers/token.controller.ts";

const router = Router();
const tokenController = new TokenController();

router.post(
  "/validate",
  tokenController.validateRefreshToken,
);

router.post(
  "/revoke",
  tokenController.revokeRefreshToken,
);

// Add your authentication middleware before this route.
router.post(
  "/revoke-all",
  tokenController.revokeAllUserTokens,
);

// Do not expose this publicly; protect it or run cleanup via a scheduled job.
router.post(
  "/cleanup",
  tokenController.cleanupExpiredTokens,
);

export default router;