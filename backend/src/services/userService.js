import prisma from '../lib/prisma.js';

export const getProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      age: true,
      bio: true,
      avatarUrl: true,
      role: true,
      preferredLanguage: true,
      createdAt: true
    }
  });
};

export const updateProfile = async (userId, profileData) => {
  const { username, name, age, bio, avatarUrl, preferredLanguage } = profileData;

  // Check if username is already taken by another user
  if (username) {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error('Username is already taken');
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      username,
      name,
      age: age ? parseInt(age) : null,
      bio,
      avatarUrl,
      preferredLanguage
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      age: true,
      bio: true,
      avatarUrl: true,
      role: true,
      preferredLanguage: true,
      createdAt: true
    }
  });
};

export const findByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true
    }
  });
};
