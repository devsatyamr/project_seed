import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';
import ChatbotButton from './components/ChatbotButton';
import { uploadCSVFile } from './utils/api';

function App() {
  const [hasResults, setHasResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const processedResults = await uploadCSVFile(file);
      setResults(processedResults);
      setHasResults(true);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to process file');
      setHasResults(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-700">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=2532')] opacity-[0.02] mix-blend-overlay"></div>
      <Header />
      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Upload Test Results</h2>
            <UploadSection onFileUpload={handleFileUpload} />
            {isLoading && (
              <div className="mt-4 text-center text-neon-purple">
                Processing your file...
              </div>
            )}
            {error && (
              <div className="mt-4 text-center text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-900/20">
                {error}
              </div>
            )}
          </div>
          
          {hasResults && results && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Analysis Results</h2>
              <ResultsSection results={results} />
            </div>
          )}
        </div>
      </main>

      <ChatbotButton />
    </div>
  );
}

export default App;