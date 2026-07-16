import api from "./axiosConfig";

export const sendAiChat = (message, conversationId = null) =>
  api.post("/ai/chat", { message, conversation_id: conversationId });

export const getAiSuggestions = () => api.get("/ai/suggestions");

export const getAiConversations = () => api.get("/ai/conversations");

export const getAiConversation = (id) => api.get(`/ai/conversations/${id}`);
