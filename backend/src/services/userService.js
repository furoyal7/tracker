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
      phone: true,
      businessName: true,
      businessType: true,
      address: true,
      isVerified: true,
      status: true,
      createdAt: true
    }
  });
};

export const updateProfile = async (userId, profileData) => {
  const { username, name, age, bio, avatarUrl, preferredLanguage } = profileData;

  if (username) {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error('Username is already taken');
    }
  }

  const { phone, businessName, businessType, address } = profileData;

  return prisma.user.update({
    where: { id: userId },
    data: {
      username,
      name,
      age: age ? parseInt(age) : null,
      bio,
      avatarUrl,
      preferredLanguage,
      phone,
      businessName,
      businessType,
      address
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
      phone: true,
      businessName: true,
      businessType: true,
      address: true,
      isVerified: true,
      status: true,
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
    }
  });
};

export const getActivityLogs = async (userId, limit = 20, offset = 0) => {
  return prisma.activityLog.findMany({
    where: { userId },
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' }
  });
};

export const createActivityLog = async (userId, actionType, metadata = {}) => {
  return prisma.activityLog.create({
    data: {
      userId,
      actionType,
      metadata
    }
  });
};

export const getSessions = async (userId) => {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { lastActive: 'desc' }
  });
};

export const deleteSession = async (userId, sessionId) => {
  return prisma.session.delete({
    where: { id: sessionId, userId }
  });
};

export const createSession = async (userId, deviceInfo, ipAddress) => {
  return prisma.session.create({
    data: {
      userId,
      deviceInfo,
      ipAddress
    }
  });
};
