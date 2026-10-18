import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

export const OWNER_TITLE = "Pejung's Pokédex";

// Red casing, blue lens and the three indicator lights of the classic Pokédex.
export default function PokedexHeader({ subtitle, onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.back} accessibilityLabel="Go back">
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : null}
        <View style={styles.lensRing}>
          <View style={styles.lens}>
            <View style={styles.glint} />
          </View>
        </View>
        <View style={styles.lights}>
          <View style={[styles.light, { backgroundColor: '#FF5252' }]} />
          <View style={[styles.light, { backgroundColor: '#FFD740' }]} />
          <View style={[styles.light, { backgroundColor: '#3DDC84' }]} />
        </View>
        <View style={styles.spacer} />
        {subtitle ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{subtitle}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title}>{OWNER_TITLE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.red,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 5,
    borderBottomColor: colors.redDark,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.redDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backText: { color: '#fff', fontSize: 26, lineHeight: 30, fontWeight: '700' },
  lensRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#C9CED6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lens: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.blue,
    borderWidth: 2,
    borderColor: colors.blueDark,
  },
  glint: {
    position: 'absolute',
    top: 5,
    left: 7,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    opacity: 0.75,
  },
  lights: { flexDirection: 'row', marginLeft: 12, gap: 8 },
  light: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.redDark,
  },
  spacer: { flex: 1 },
  pill: {
    backgroundColor: colors.bezel,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { color: colors.yellow, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 10,
  },
});
