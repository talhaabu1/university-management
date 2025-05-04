'use client';

import config from '@/lib/config';
import { ImageKitProvider } from '@imagekit/next';
import { useRef, useState } from 'react';
import { IKImage, IKUpload, IKVideo } from 'imagekitio-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

interface Props {
  type: 'image' | 'video';
  accept: string;
  placeholder: string;
  folder: string;
  variant: 'dark' | 'light';
  value?: string;
  onFileChange: (filePath: string) => void;
}

const FileUpload = ({
  type,
  accept,
  placeholder,
  folder,
  variant,
  value,
  onFileChange,
}: Props) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(
    value ? { filePath: value } : null
  );

  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

  const styles = {
    button: variant === 'dark' ? 'dark' : 'bg-light-300 border-gray-100 border',
    placeholder: variant === 'dark' ? 'text-light-100' : 'text-slate-500',
    text: variant === 'dark' ? 'text-light-100' : 'text-dark-500',
  };

  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);
    console.log(res?.filePath);
    toast({
      title: `${type} uploaded Successfully`,
      description: `${res.filePath} uploaded successfully`,
    });
  };

  const onError = (err: any) => {
    console.log(err);

    toast({
      title: `${type} uploaded failed`,
      description: `Your ${type} could not be uploaded. Please try again`,
      variant: 'destructive',
    });
  };

  const onValidate = (file: File) => {
    if (type === 'image') {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: `${type}  File size too large`,
          description: `Please upload a file that is less than 20MB in size`,
          variant: 'destructive',
        });
        return false;
      }
    } else if (type === 'video') {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: `${type}  File size too large`,
          description: `Please upload a file that is less than 100MB in size`,
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint}>
      <IKUpload
        className="hidden"
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
        ref={ikUploadRef}
        useUniqueFileName={true}
        validateFile={onValidate}
        onUploadStart={() => setProgress(0)}
        onUploadProgress={({
          loaded,
          total,
        }: {
          loaded: number;
          total: number;
        }) => {
          const percent = Math.round((loaded / total) * 100);

          setProgress(percent);
        }}
        folder={folder}
        accept={accept}
        onSuccess={onSuccess}
        onError={onError}
      />
      <button
        className={cn('upload-btn', styles.button)}
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
        <p className={cn('text-base', styles.placeholder)}>{placeholder}</p>

        {file && (
          <p className={cn('upload-filename', styles.text)}>{file.filePath}</p>
        )}
      </button>

      {progress > 0 && progress !== 100 && (
        <div className="w-full rounded-full bg-green-200">
          <div className="progress" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {file &&
        (type === 'image' ? (
          <IKImage
            urlEndpoint={urlEndpoint}
            alt={file.filePath}
            path={file.filePath}
            width={500}
            height={300}
          />
        ) : type === 'video' ? (
          <IKVideo
            urlEndpoint={urlEndpoint}
            path={file.filePath}
            controls={true}
            className="h-69 w-full rounded-xl"
          />
        ) : null)}
    </ImageKitProvider>
  );
};

export default FileUpload;
