export interface Submission {
  walletAddress: string;
  savedWalletAddress?: string | null;
  twitterUsername?: string | null;
  inviteLink?: string | null;
  artLink?: string | null;
  quoteTweetUrl?: string | null;
  commentUrl?: string | null;
  verifiedFollow?: boolean;
  verifiedRetweet?: boolean;
  verifiedTweet?: boolean;
}
