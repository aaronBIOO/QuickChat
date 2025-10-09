// data sanitization
export const sanitizeUser = (user: any) => ({
  _id: user._id?.toString(),
  email: user.email,
  fullName: user.fullName,
  bio: user.bio,
  profilePic: user.profilePic
});