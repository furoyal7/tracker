import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`ERROR: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || '*',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
};
