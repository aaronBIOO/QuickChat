import bcrypt from "bcryptjs";

const CLERK_PLACEHOLDER_PASSWORD = "CLERK_MANAGED_PASSWORD"; 
let CLERK_PASSWORD_HASH: string;

export const getClerkPasswordHash = async (): Promise<string> => {
  if (!CLERK_PASSWORD_HASH) {
      CLERK_PASSWORD_HASH = await bcrypt.hash(CLERK_PLACEHOLDER_PASSWORD, 10);
  }
  return CLERK_PASSWORD_HASH;
};


