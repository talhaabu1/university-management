import ImageKit from 'imagekit';
import dummyBooks from '../../dummyBooks.json';
import { books } from './schema';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

const uploadToImageKit = async (
  url: string,
  fileName: string,
  folder: string
) => {
  try {
    const response = await imagekit.upload({
      file: url,
      fileName: fileName,
      folder: folder,
    });

    return response.filePath;
  } catch (error) {
    console.log('Error uploading image', error);
  }
};

const seed = async () => {
  console.log('seeding data.....');

  try {
    for (const book of dummyBooks) {
      const coverUrl = await uploadToImageKit(
        book.coverUrl,
        `${book.title}.jpg`,
        '/books/covers'
      );

      const videoUrl = await uploadToImageKit(
        book.videoUrl,
        `${book.title}.mp4`,
        '/books/videos'
      );

      if (!coverUrl || !videoUrl) {
        console.warn(`Skipping book "${book.title}" due to missing uploads`);
        continue;
      }

      await db.insert(books).values({
        ...book,
        coverUrl,
        videoUrl,
      });
    }

    console.log('Data seeded successfully');
  } catch (error) {
    console.log('Error seeding data', error);
  }
};

seed();
