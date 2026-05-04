import * as userService from '../services/userService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    return successResponse(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await userService.updateProfile(req.user.id, req.body);
    await userService.createActivityLog(req.user.id, 'PROFILE_UPDATED', { updatedFields: Object.keys(req.body) });
    return successResponse(res, profile, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Avatar image is required', 400);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const profile = await userService.updateProfile(req.user.id, { avatarUrl });
    await userService.createActivityLog(req.user.id, 'AVATAR_UPLOADED', { avatarUrl });
    
    return successResponse(res, profile, 'Avatar uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const searchUser = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return errorResponse(res, 'Username is required', 400);
    }
    const user = await userService.findByUsername(username);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user, 'User found');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const logs = await userService.getActivityLogs(req.user.id, parseInt(limit) || 20, parseInt(offset) || 0);
    return successResponse(res, logs, 'Activity logs retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await userService.getSessions(req.user.id);
    return successResponse(res, sessions, 'Sessions retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const logoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await userService.deleteSession(req.user.id, sessionId);
    return successResponse(res, null, 'Session logged out successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
