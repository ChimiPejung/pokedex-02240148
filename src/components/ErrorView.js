import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.msg}>{message || 'Please try again.'}</Text>
      <Pressable onPress={onRetry} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}>
        <Text style={styles.btnText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 28, marginTop: 24 },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  msg: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 18 },
  btn: { backgroundColor: colors.red, borderRadius: 22, paddingHorizontal: 30, paddingVertical: 12 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
});
