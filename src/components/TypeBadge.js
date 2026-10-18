import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { typeColors } from '../theme';

export default function TypeBadge({ type }) {
  return (
    <View style={[styles.badge, { backgroundColor: typeColors[type] || '#888' }]}>
      <Text style={styles.text}>{type.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8 },
  text: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
