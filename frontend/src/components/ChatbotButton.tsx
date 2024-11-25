import React from 'react';
import { MessageSquareText } from 'lucide-react';

export default function ChatbotButton() {
  return (
    <button className="fixed bottom-6 right-6 bg-purple-900 text-purple-100 p-4 rounded-full shadow-lg hover:bg-purple-800 transition-colors border border-purple-700/30">
      <MessageSquareText className="w-6 h-6" />
    </button>
  );
}