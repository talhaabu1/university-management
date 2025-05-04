import config from '@/lib/config';
import { Video } from '@imagekit/next';
import React from 'react';

const BookVideo = ({ videoUrl }: { videoUrl: string }) => {
  return (
    <Video
      src={videoUrl}
      urlEndpoint={config.env.imagekit.urlEndpoint}
      controls
      className="w-full rounded-lg"
      autoPlay
    />
  );
};

export default BookVideo;
