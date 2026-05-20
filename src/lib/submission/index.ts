import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SubmissionData {
  walletAddress?: string | null;
  twitterUsername?: string | null;
  inviteLink?: string | null;
  artLink?: string | null;
  quoteTweetUrl?: string | null;
  commentUrl?: string | null;
}

export async function getSubmission(userId: string) {
  return await prisma.userSubmission.findUnique({
    where: { userId },
  });
}

export async function saveSubmission(userId: string, data: SubmissionData) {
  return await prisma.userSubmission.upsert({
    where: { userId },
    update: {
      walletAddress: data.walletAddress !== undefined ? data.walletAddress : undefined,
      twitterUsername: data.twitterUsername !== undefined ? data.twitterUsername : undefined,
      inviteLink: data.inviteLink !== undefined ? data.inviteLink : undefined,
      artLink: data.artLink !== undefined ? data.artLink : undefined,
      quoteTweetUrl: data.quoteTweetUrl !== undefined ? data.quoteTweetUrl : undefined,
      commentUrl: data.commentUrl !== undefined ? data.commentUrl : undefined,
      updatedAt: new Date(),
    },
    create: {
      userId,
      walletAddress: data.walletAddress || null,
      twitterUsername: data.twitterUsername || null,
      inviteLink: data.inviteLink || null,
      artLink: data.artLink || null,
      quoteTweetUrl: data.quoteTweetUrl || null,
      commentUrl: data.commentUrl || null,
    },
  });
}

export async function updateSubmission(userId: string, data: SubmissionData) {
  return await saveSubmission(userId, data);
}
