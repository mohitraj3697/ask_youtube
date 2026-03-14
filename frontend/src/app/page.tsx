'use client';

import { useState } from 'react';
import VideoLoader from '../../components/VideoLoader';
import ChatBox from '../../components/ChatBox';
import { loadVideo } from '../../services/api';

export default function Home() {
  const [videoId, setVideoId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVideoLoad = async (id: string) => {
    setVideoId(id);
    setIsProcessing(true);
    try {
      // call backend to fetch/index video
      const result = await loadVideo(id);
      if (result.detail) {
        throw new Error(result.detail);
      }
    } catch (err: any) {
      console.error('Failed to load video on backend', err);
      alert('Error loading video on server: ' + err.message);
      setVideoId(''); // clean up failed id
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        {/* header format */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-black">
            YouTube Video Chat
          </h1>
          <p className="text-gray-500 text-lg font-medium tracking-wide">
            Ask questions about any YouTube video.
          </p>
        </header>

        {/* video element */}
        <VideoLoader onVideoLoad={handleVideoLoad} />

        {/* main chat */}
        <ChatBox disabled={!videoId || isProcessing} isProcessing={isProcessing} disabledPrompt={!videoId ? "Load a video first to start chatting" : "Generating embeddings, please wait..."} />
      </div>
    </main>
  );
}
