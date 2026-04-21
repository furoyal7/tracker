import express from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { authMiddleware } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const passcodeSchema = z.object({
  body: z.object({
    passcode: z.string().regex(/^\d{6}$/, 'Passcode must be 6 digits'),
  }),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', authController.googleAuth);
router.post('/passcode', authMiddleware, validate(passcodeSchema), authController.updatePasscode);

export default router;
