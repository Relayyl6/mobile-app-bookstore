import React, { useMemo } from 'react';
import { Image, Text, View } from 'react-native';

type BookCoverProps = {
  title: string;
  author?: string;
  coverUrl?: string;
  width?: number;
  height?: number;
};

const COLOR_SETS = [
  ['#0E3B43', '#1C6B6B'],
  ['#2E2A6E', '#5546A3'],
  ['#355C7D', '#6C5B7B'],
  ['#2D3A3A', '#4A6A5D'],
  ['#7A3E65', '#B56BA2'],
];

const getPaletteFromTitle = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }

  return COLOR_SETS[Math.abs(hash) % COLOR_SETS.length];
};

const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  coverUrl,
  width = 92,
  height = 140,
}) => {
  const colors = useMemo(() => getPaletteFromTitle(title || 'Book'), [title]);
  const initials = useMemo(
    () =>
      (title || 'Book')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [title]
  );

  if (coverUrl) {
    return (
      <Image
        source={{ uri: coverUrl }}
        style={{ width, height, borderRadius: 14 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width,
        height,
        borderRadius: 14,
        padding: 10,
        justifyContent: 'space-between',
        backgroundColor: colors[0],
        borderWidth: 1,
        borderColor: colors[1],
      }}
    >
      <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '800' }}>{initials}</Text>
      <View>
        <Text numberOfLines={3} style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>
          {title}
        </Text>
        {author ? (
          <Text numberOfLines={1} style={{ color: '#DCE7E7', fontSize: 10, marginTop: 4 }}>
            {author}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default BookCover;
