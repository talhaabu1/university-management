'use client';

import { cn } from '@/lib/utils';
import BookCoverSvg from './BookCoverSvg';
import config from '@/lib/config';
import { Image } from '@imagekit/next';

type BookCoverVariant = 'extraSmall' | 'small' | 'medium' | 'regular' | 'wide';

const variantStyle: Record<BookCoverVariant, string> = {
  extraSmall: 'book-cover_extra_small',
  small: 'book-cover_small',
  medium: 'book-cover_medium',
  regular: 'book-cover_regular',
  wide: 'book-cover_wide',
};

interface Props {
  className?: string;
  variant?: BookCoverVariant;
  coverColor: string;
  coverImage: string;
}

const BookCover = ({
  className,
  variant = 'regular',
  coverColor = '#012b48',
  coverImage = 'https://placehold.co/400x600.png', // ✅ ঠিক করা হয়েছে
}: Props) => {
  return (
    <div
      className={cn(
        'relative transition-all duration-300 ',
        variantStyle[variant],
        className
      )}>
      <BookCoverSvg coverColor={coverColor} />
      <div
        className="absolute z-10"
        style={{ left: '12%', width: '87.5%', height: '88%' }}>
        <Image
          className="rounded-sm object-fill"
          src={coverImage}
          urlEndpoint={config.env.imagekit.urlEndpoint}
          alt="book cover"
          loading="lazy"
          fill
          // lqip={{ active: true }}
        />
      </div>
    </div>
  );
};

export default BookCover;
