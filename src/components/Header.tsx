import React from 'react';
import { Activity, MessageSquare } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-midnight-900/50 border-b border-purple-900/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-neon-purple" />
            <span className="ml-2 text-xl font-bold text-white">MediPredict AI</span>
          </div>
          <button className="flex items-center px-4 py-2 rounded-lg bg-purple-900 hover:bg-purple-800 transition-colors">
            <MessageSquare className="w-5 h-5 text-purple-200 mr-2" />
            <span className="text-purple-100">Open Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
}