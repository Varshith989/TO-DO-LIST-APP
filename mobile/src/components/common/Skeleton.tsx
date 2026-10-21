import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? '#374151' : '#E2E8F0',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const TaskCardSkeleton: React.FC = () => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Skeleton width={70} height={22} borderRadius={11} />
        <Skeleton width={90} height={22} borderRadius={11} />
      </View>
      <Skeleton width="85%" height={20} style={{ marginVertical: 10 }} />
      <Skeleton width="60%" height={14} style={{ marginBottom: 12 }} />
      <View style={styles.bottomRow}>
        <Skeleton width={110} height={16} />
        <Skeleton width={32} height={32} borderRadius={16} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
});
