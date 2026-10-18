import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { artworkUrl } from '../api';
import { padId, prettyName } from '../utils';

// Reusable row: artwork, number and name. `children` renders on the right
// (the Team screen puts its Remove button there).
function PokemonCard({ id, name, onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${prettyName(name)}, number ${id}`}
    >
      <View style={styles.imgWrap}>
        <Image source={{ uri: artworkUrl(id) }} style={styles.img} resizeMode="contain" />
      </View>
      <View style={styles.info}>
        <Text style={styles.num}>No. {padId(id)}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {prettyName(name)}
        </Text>
      </View>
      {children}
    </Pressable>
  );
}

export default React.memo(PokemonCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 6,
    borderLeftColor: colors.red,
    padding: 8,
    marginHorizontal: 14,
    marginVertical: 5,
  },
  pressed: { opacity: 0.75 },
  imgWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.screen,
    borderWidth: 2,
    borderColor: colors.bezel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: 62, height: 62 },
  info: { flex: 1, marginLeft: 12 },
  num: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  name: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: 2 },
});
