import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};
