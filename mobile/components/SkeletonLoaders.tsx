import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const Skeleton = ({ width: w = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: w,
          height,
          borderRadius,
          backgroundColor: '#333',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const HomeHeaderSkeleton = () => (
  <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
    {/* Header */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View>
          <Skeleton width={100} height={14} style={{ marginBottom: 6 }} />
          <Skeleton width={120} height={18} />
        </View>
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>

    {/* Search Bar */}
    <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 24 }} />
  </View>
);

// Add to SkeletonLoaders.tsx
export const NewReleasesSkeleton = () => (
  <View style={{ paddingHorizontal: 16 }}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={{ flexDirection: 'row', marginBottom: 16 }}>
        <Skeleton width={60} height={90} borderRadius={8} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="80%" height={16} />
          <Skeleton width="60%" height={12} style={{ marginTop: 6 }} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Skeleton width={70} height={20} borderRadius={4} />
            <Skeleton width={60} height={20} />
            <Skeleton width={40} height={20} />
          </View>
        </View>
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
    ))}
  </View>
)

export const ContinueReadingSkeleton = () => (
  <View style={{ paddingLeft: 20, marginBottom: 24 }}>
    <Skeleton width={140} height={20} style={{ marginBottom: 16 }} />
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <View key={i}>
          <Skeleton width={120} height={180} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width={120} height={14} />
        </View>
      ))}
    </View>
  </View>
);

export const AiPicksSkeleton = () => (
  <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
    <Skeleton width={140} height={20} style={{ marginBottom: 16 }} />
    {[1, 2].map((i) => (
      <View key={i} style={{ marginBottom: 16 }}>
        <Skeleton width="100%" height={140} borderRadius={12} />
      </View>
    ))}
  </View>
);

export const PopularBooksSkeleton = () => (
  <View style={{ paddingLeft: 20, marginBottom: 24 }}>
    <Skeleton width={140} height={20} style={{ marginBottom: 16 }} />
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <View key={i}>
          <Skeleton width={140} height={200} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width={140} height={14} />
        </View>
      ))}
    </View>
  </View>
);

export const CommunityUploadsSkeleton = () => (
  <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
    <Skeleton width={160} height={20} style={{ marginBottom: 16 }} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={{ width: (width - 52) / 2 }}>
          <Skeleton width="100%" height={180} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={14} />
        </View>
      ))}
    </View>
  </View>
);

export const LibraryHeaderSkeleton = () => (
  <View style={{ paddingHorizontal: 16 }}>
    {/* Header */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton width={28} height={28} borderRadius={14} />
        <Skeleton width={100} height={24} />
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>

    {/* Search */}
    <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 16 }} />

    {/* View Toggle */}
    <Skeleton width={160} height={40} borderRadius={20} style={{ marginBottom: 20 }} />
  </View>
);

export const LibraryBookGridSkeleton = () => (
  <View style={{ paddingHorizontal: 16 }}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={{ width: (width - 44) / 2 }}>
          <Skeleton width="100%" height={220} borderRadius={12} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="80%" height={12} />
        </View>
      ))}
    </View>
  </View>
);

export const LibrarySectionSkeleton = ({ title }: { title: string }) => (
  <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <Skeleton width={22} height={22} borderRadius={11} />
      <Skeleton width={160} height={18} />
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={{ width: (width - 44) / 2 }}>
          <Skeleton width="100%" height={200} borderRadius={12} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="80%" height={12} />
        </View>
      ))}
    </View>
  </View>
);

export default Skeleton;