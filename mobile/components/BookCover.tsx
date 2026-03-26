import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { resolveBookImage } from '@/utils/bookImageLookup';

type BookCoverProps = {
  title: string;
  author?: string;
  coverUrl?: string;
  width?: number;
  height?: number;
};

const COVER_PALETTES = [
  ['#0B3D3A', '#1E6F68'],
  ['#174A7E', '#4D86C5'],
  ['#6A3B1A', '#B37A43'],
  ['#4B2B73', '#8C6BC1'],
  ['#2E3C2F', '#6A8D73'],
];

const getPalette = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_PALETTES[Math.abs(hash) % COVER_PALETTES.length];
};

const getInitials = (title: string) =>
  title
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  coverUrl,
  width = 120,
  height = 180,
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(coverUrl || null);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      if (coverUrl) {
        setResolvedUrl(coverUrl);
        return;
      }

      const foundImage = await resolveBookImage(title, author);
      if (mounted) setResolvedUrl(foundImage);
    };

    loadImage();
    return () => {
      mounted = false;
    };
  }, [author, coverUrl, title]);

  if (resolvedUrl) {
    return <Image source={{ uri: resolvedUrl }} style={[styles.coverImage, { width, height }]} />;
  }

  const [startColor, endColor] = getPalette(title);

  return (
    <View style={[styles.coverShell, { width, height, backgroundColor: startColor }]}> 
      <View style={[styles.overlay, { backgroundColor: endColor }]} />
      <Text style={styles.initials}>{getInitials(title)}</Text>
      <Text style={styles.title} numberOfLines={3}>
        {title}
      </Text>
      {!!author && (
        <Text style={styles.author} numberOfLines={1}>
          {author}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  coverShell: {
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  initials: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  title: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 18,
  },
  author: {
    fontSize: 11,
    color: '#E7ECEF',
  },
  coverImage: {
    borderRadius: 14,
  },
});

export default BookCover;
