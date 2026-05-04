import * as authService from '../services/authService.js';
import * as userService from '../services/userService.js';
import { successResponse } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, 'User registered successfully', 201);
  } catch (error) {
    if (error.message === 'User already exists') {
      return next(new ApiError(400, error.message));
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    
    // Create session and log activity
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    
    await userService.createSession(result.user.id, deviceInfo, ipAddress);
    await userService.createActivityLog(result.user.id, 'LOGIN', { deviceInfo, ipAddress });

    return successResponse(res, result, 'Login successful');
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return next(new ApiError(401, error.message));
    }
    next(error);
  }
};

export const updatePasscode = async (req, res, next) => {
  try {
    const { passcode } = req.body;
    const userId = req.user.id;

    if (!passcode || !/^\d{6}$/.test(passcode)) {
      throw new ApiError(400, 'Passcode must be 6 digits');
    }

    const result = await authService.updatePasscode(userId, passcode);
    return successResponse(res, result, 'Passcode updated successfully');
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      throw new ApiError(400, 'Google ID Token is required');
    }

    const result = await authService.googleLogin(idToken);
    return successResponse(res, result, 'Google authentication successful');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyPhone = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    await authService.verifyPhone(req.user.id, phone, otp);
    return successResponse(res, null, 'Phone verified successfully');
  } catch (error) {
    next(error);
  }
};
