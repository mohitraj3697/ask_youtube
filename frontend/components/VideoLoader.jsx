'use client';
import { useState } from 'react';

export default function VideoLoader({ onVideoLoad }) {
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  //handle starting the video indexing process
  const handleLoad = () => {
    if (!videoId.trim()) return;

    //immediately show the video iframe
    setIsLoaded(true);
    // pass video string up to start background processing
    onVideoLoad(videoId.trim());
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-3xl mx-auto border-b border-gray-200 pb-8 mb-8">
      <div className="flex w-full gap-2">
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="Enter YouTube Video ID (e.g. dQw4w9WgXcQ)"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
          disabled={loading || isLoaded}
        />
        <button
          onClick={handleLoad}
          disabled={loading || !videoId || isLoaded}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? 'Loading...' : isLoaded ? 'Loaded' : 'Load Video'}
        </button>
      </div>

      {isLoaded && (
        <div className="w-full flex flex-col items-center gap-4">
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-sm text-gray-600 font-medium">Video indexed successfully. You can now ask questions.</p>
        </div>
      )}
    </div>
  );
}
