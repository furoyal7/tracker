import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, 'User registered successfully', 201);
  } catch (error) {
    if (error.message === 'User already exists') {
      return errorResponse(res, error.message, 400);
    }
    console.error('Registration error:', error.message);
    return errorResponse(res, 'Internal Server Error - Registration failed', 500);
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return errorResponse(res, error.message, 401);
    }
    console.error('Login error:', error.message);
    return errorResponse(res, 'Internal Server Error - Database unreachable', 500);
  }
};

export const updatePasscode = async (req, res) => {
  try {
    const { passcode } = req.body;
    const userId = req.user.id;

    if (!passcode || !/^\d{6}$/.test(passcode)) {
      return errorResponse(res, 'Passcode must be 6 digits', 400);
    }

    const result = await authService.updatePasscode(userId, passcode);
    return successResponse(res, result, 'Passcode updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return errorResponse(res, 'Google ID Token is required', 400);
    }

    const result = await authService.googleLogin(idToken);
    return successResponse(res, result, 'Google authentication successful');
  } catch (error) {
    console.error('Google Auth error:', error.message);
    return errorResponse(res, error.message, 401);
  }
};
