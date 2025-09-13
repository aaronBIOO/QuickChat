declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  profilePic?: string;
  // Add other user properties as needed
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  seen: boolean;
  createdAt: string;
  image?: string; // Optional image URL if the message has an image
}

interface Assets {
  avatar_icon: string;
  gallery_icon: string;
  help_icon: string;
  logo_icon: string;
  logo_big: string;
  logo: string;
  profile_richard: string;
  profile_alison: string;
  profile_enrique: string;
  profile_marco: string;
  profile_martin: string;
  search_icon: string;
  send_button: string;
  menu_icon: string;
  arrow_icon: string;
  code: string;
  bgImage: string;
  pic1: string;
  pic2: string;
  pic3: string;
  pic4: string;
  [key: string]: string; // For any additional assets
}

declare const assets: Assets;

export const userDummyData: User[];
export const messagesDummyData: Message[];
export const imagesDummyData: string[];

export default assets;
