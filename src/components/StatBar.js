import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

// One horizontal stat bar. `max` is the value that fills the whole bar.
export default function StatBar({ label, value, max = 255, color }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barColor = color || (value < 50 ? colors.danger : value < 90 ? colors.yellow : colors.green);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  label: { width: 64, color: colors.muted, fontSize: 13, fontWeight: '700' },
  value: { width: 44, color: colors.ink, fontSize: 14, fontWeight: '800', textAlign: 'right', marginRight: 10 },
  track: { flex: 1, height: 12, borderRadius: 6, backgroundColor: '#E6ECE9', overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6 },
});
