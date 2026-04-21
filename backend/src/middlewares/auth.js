import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../lib/prisma.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Unauthorized - No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      console.error('Authentication failed: Invalid token', jwtError.message);
      return errorResponse(res, 'Unauthorized - Invalid token', 401);
    }
    
    console.log('Authenticating user with ID:', decoded.id);

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        console.warn('Authentication failed: User not found for ID', decoded.id);
        return errorResponse(res, 'Unauthorized - User not found', 401);
      }

      req.user = user;
      next();
    } catch (dbError) {
      console.error('Database connection error during authentication:', dbError.message);
      return errorResponse(res, 'Internal Server Error - Database unreachable', 500);
    }
  } catch (error) {
    console.error('Unexpected error in auth middleware:', error.message);
    return errorResponse(res, 'Internal Server Error', 500);
  }
};
