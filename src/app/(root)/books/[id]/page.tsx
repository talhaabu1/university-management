import { auth } from '@/auth';
import BookOverview from '@/components/BookOverview';
import BookVideo from '@/components/BookVideo';
import { db } from '@/database/drizzle';
import { books } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const session = await auth();
  const [bookDetails] = await db
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  if (!bookDetails) return redirect('/404');

  return (
    <>
      <BookOverview {...bookDetails} />

      <div className="book-details">
        <div className="flex-[1.5]">
          <section className="flex flex-col gap-7">
            <h3>Video</h3>
            <BookVideo videoUrl={bookDetails.videoUrl} />
          </section>
          <section className=" mt-10 flex flex-col gap-7">
            <h3>Summry</h3>

            <div className="space-y-5 text-xl text-light-100">
              {bookDetails.summary.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        </div>
        {/* Similar Books */}
      </div>
    </>
  );
};

export default Page;
