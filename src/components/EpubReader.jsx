import React, { useState } from 'react';
import { ReactReader } from 'react-reader';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getChapterContent } from '../services/api';

const EpubReader = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [size, setSize] = useState('100%');

  // Fetch chapter content (this should be updated to fetch the EPUB file)
  const { data: chapterData, isLoading, error } = useQuery(
    ['chapter', novelId, chapterId],
    () => getChapterContent(novelId, chapterId),
    {
      enabled: !!novelId && !!chapterId,
    }
  );

  const locationChanged = (epubcifi) => {
    setLocation(epubcifi);
    // You can save reading progress here
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-red-500">Error loading chapter: {error.message}</div>
    </div>
  );

  // This should be updated to use the actual EPUB file URL
  const epubUrl = chapterData?.epubUrl || '';

  return (
    <div className="container mx-auto h-screen">
      <div className="flex mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Back
        </button>
        <div className="ml-auto">
          <button 
            onClick={() => setSize(size === '100%' ? '80%' : '100%')}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            {size === '100%' ? 'Reduce Size' : 'Full Size'}
          </button>
        </div>
      </div>
      <div style={{ height: 'calc(100vh - 100px)', width: size }}>
        {epubUrl ? (
          <ReactReader
            url={epubUrl}
            title={chapterData?.title || 'Chapter'}
            location={location}
            locationChanged={locationChanged}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>No EPUB file available for this chapter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpubReader; 