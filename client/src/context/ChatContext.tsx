import { createContext } from "react";
import type { ChatContextType } from "@/types/chat.types";

export const ChatContext = createContext<ChatContextType | null>(null);
