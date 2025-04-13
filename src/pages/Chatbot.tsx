
import React from 'react';
import MainLayout from '@/components/MainLayout';
import Chatbot from '@/components/Chatbot';

const ChatbotPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Business Finder Chatbot</h1>
        <p className="text-center text-muted-foreground mb-8">
          Ask questions about local businesses like "Find me a good restaurant in Nagarbhavi" or "What are the top-rated cafes?"
        </p>
        <Chatbot />
      </div>
    </MainLayout>
  );
};

export default ChatbotPage;
