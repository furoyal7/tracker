import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/hashing.js';
import { generateToken } from '../utils/jwt.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (userData) => {
  const { email, password, name, username } = userData;
  
  // If email is missing, use username as email (Prisma requires a unique email currently)
  const finalEmail = email || `${username}@money.manager`;

  const existingUser = await prisma.user.findFirst({ 
    where: { 
      OR: [
        { email: finalEmail },
        { username: username }
      ]
    } 
  });
  
  if (existingUser) {
    throw new Error('User with this username or email already exists');
  }

  const hashedPassword = password ? await hashPassword(password) : null;

  const user = await prisma.user.create({
    data: {
      email: finalEmail,
      password: hashedPassword,
      name: name || username,
      username,
    },
  });

  const token = generateToken({ id: user.id });

  return { 
    user: { 
      id: user.id, 
      email: user.email,
      username: user.username,
      name: user.name,
      age: user.age,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt
    }, 
    token 
  };
};

export const login = async (credentials) => {
  const { email, password, username } = credentials;

  // Find user by email OR username
  const user = await prisma.user.findFirst({ 
    where: { 
      OR: [
        { email: email || 'never-match' },
        { username: username || 'never-match' }
      ]
    } 
  });

  if (!user || (user.password && !password)) {
    throw new Error('Invalid credentials');
  }

  if (user.password) {
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
  } else if (!user.password && password) {
     throw new Error('This account uses Google Login. Please sign in with Google.');
  }

  const token = generateToken({ id: user.id });

  return { 
    user: { 
      id: user.id, 
      email: user.email,
      username: user.username,
      name: user.name,
      age: user.age,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt
    }, 
    token 
  };
};

export const googleLogin = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google Token');
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create a new user if it doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl: picture,
          username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        },
      });
    }

    const token = generateToken({ id: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  } catch (error) {
    throw new Error('Google Authentication failed: ' + error.message);
  }
};

export const updatePasscode = async (userId, passcode) => {
  // Passcode must be 6 digits (numeric only validation is handled at the controller/frontend)
  const hashedPasscode = await hashPassword(passcode);

  await prisma.user.update({
    where: { id: userId },
    data: { passcode: hashedPasscode },
  });

  return { success: true };
};
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    throw new Error('User not found or using social login');
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return { success: true };
};

export const verifyPhone = async (userId, phone, otp) => {
  // MOCK: In a real app, verify OTP from Redis/DB
  if (otp !== '123456') {
    throw new Error('Invalid OTP');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { phone, isVerified: true }
  });

  return { success: true };
};
