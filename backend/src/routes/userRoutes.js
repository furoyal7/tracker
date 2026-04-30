import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import upload from '../middlewares/upload.middleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.get('/search', userController.searchUser);
router.patch('/profile', userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

export default router;
