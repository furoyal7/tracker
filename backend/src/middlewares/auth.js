import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized - No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      throw new ApiError(401, 'Unauthorized - Invalid token format');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      console.warn(`[AUTH] Invalid token attempt from ${req.ip}: ${jwtError.message}`);
      throw new ApiError(401, 'Unauthorized - Invalid or expired token');
    }
    
    if (!decoded || !decoded.id) {
      throw new ApiError(401, 'Unauthorized - Token payload missing user ID');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passcode: true,
      }
    });

    if (!user) {
      console.warn(`[AUTH] User not found for ID: ${decoded.id}`);
      throw new ApiError(401, 'Unauthorized - User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
