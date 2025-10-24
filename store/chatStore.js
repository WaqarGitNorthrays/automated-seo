import { create } from 'zustand';
import axiosInstance from '@/lib/axiosInstance';

export const useChatStore = create((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
  tokens: {
    total: 0,
    input: 0,
    output: 0
  },
  
  // Toggle chat modal
  toggleChat: () => set(state => ({ isOpen: !state.isOpen })),
  
  // Send message to the chatbot
  sendMessage: async (message) => {
    if (!message.trim()) return;
    
    const userMessage = { role: 'user', content: message };
    
    // Add user message to chat
    set(state => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null
    }));
    
    try {
      const response = await axiosInstance.post('get-response/', {
        message: message
      });
      
      if (response.data) {
        const botMessage = { 
          role: 'assistant', 
          content: response.data.response,
          tokens: {
            total: response.data.tokens || 0,
            input: response.data.input_tokens || 0,
            output: response.data.output_tokens || 0
          }
        };
        
        set(state => ({
          messages: [...state.messages, botMessage],
          tokens: {
            total: (state.tokens.total + (response.data.tokens || 0)),
            input: (state.tokens.input + (response.data.input_tokens || 0)),
            output: (state.tokens.output + (response.data.output_tokens || 0))
          },
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      set({
        error: 'Failed to send message. Please try again.',
        isLoading: false
      });
    }
  },
  
  // Clear chat history
  clearChat: () => set({ 
    messages: [],
    tokens: { total: 0, input: 0, output: 0 },
    error: null 
  })
}));
