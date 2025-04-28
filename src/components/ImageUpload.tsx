'use client';

import config from '@/lib/config';
import { ImageKitProvider } from '@imagekit/next';
import { useRef, useState } from 'react';
import { IKImage, IKUpload } from 'imagekitio-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const {
  env: {
    imagekit: { urlEndpoint, publicKey },
    apiEndpoint,
  },
} = config;

const authenticator = async () => {
  try {
    const response = await fetch(`${apiEndpoint}/api/auth/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return { signature, expire, token };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message} `);
  }
};

const ImageUpload = ({
  onFileChange,
}: {
  onFileChange: (filePath: string) => void;
}) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const { toast } = useToast();

  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);
    console.log(res?.filePath);
    toast({
      title: 'Image uploaded Successfully',
      description: `${res.filePath} uploaded successfully`,
    });
  };

  const onError = (err: any) => {
    console.log(err);

    toast({
      title: 'Image uploaded failed',
      description: `Your image could not be uploaded. Please try again`,
      variant: 'destructive',
    });
  };

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint}>
      <IKUpload
        className="hidden"
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
        ref={ikUploadRef}
        onSuccess={onSuccess}
        onError={onError}
        fileName="test-upload.png"
      />
      <button
        className="upload-btn"
        onClick={(e) => {
          e.preventDefault();

          if (ikUploadRef.current) {
            // @ts-ignore
            ikUploadRef.current?.click();
          }
        }}>
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className="text-base text-light-100">Upload a File</p>
        {file && <p className="upload-filename">{file.filePath}</p>}
      </button>

      {file && (
        <IKImage
          urlEndpoint={urlEndpoint}
          alt={file.filePath}
          path={file.filePath}
          width={500}
          height={300}
        />
      )}
    </ImageKitProvider>
  );
};

export default ImageUpload;
