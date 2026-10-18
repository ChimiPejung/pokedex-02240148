import React from 'react';
import { View, Text, Image, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import PokedexHeader from '../components/PokedexHeader';
import PokemonCard from '../components/PokemonCard';
import StatBar from '../components/StatBar';
import { useTeam, MAX_TEAM } from '../TeamContext';
import { artworkUrl, STAT_ORDER, STAT_LABELS } from '../api';
import { colors } from '../theme';

// A full team of six at roughly 180 per stat fills the combined bars.
const COMBINED_MAX = MAX_TEAM * 180;

export default function TeamScreen({ navigation }) {
  const { team, loaded, remove } = useTeam();

  const totals = STAT_ORDER.map((key) => ({
    key,
    value: team.reduce((sum, m) => sum + (m.stats?.[key] || 0), 0),
  }));
  const grandTotal = totals.reduce((sum, t) => sum + t.value, 0);

  const slots = Array.from({ length: MAX_TEAM }, (_, i) => team[i] || null);

  const header = (
    <View style={styles.summary}>
      <View style={styles.countRow}>
        <Text style={styles.countLabel}>TEAM</Text>
        <Text style={styles.count}>
          {team.length}/{MAX_TEAM}
        </Text>
      </View>
      <View style={styles.slots}>
        {slots.map((m, i) => (
          <View key={i} style={[styles.slot, m && styles.slotFilled]}>
            {m ? <Image source={{ uri: artworkUrl(m.id) }} style={styles.slotImg} resizeMode="contain" /> : null}
          </View>
        ))}
      </View>
      {team.length > 0 ? (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>COMBINED BASE STATS</Text>
          {totals.map((t) => (
            <StatBar
              key={t.key}
              label={STAT_LABELS[t.key]}
              value={t.value}
              max={COMBINED_MAX}
              color={colors.blue}
            />
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{grandTotal}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <PokedexHeader subtitle="MY TEAM" />
      {!loaded ? (
        <ActivityIndicator size="large" color={colors.red} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={team}
          keyExtractor={(m) => String(m.id)}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <PokemonCard
              id={item.id}
              name={item.name}
              onPress={() => navigation.navigate('Detail', { id: item.id })}
            >
              <Pressable
                onPress={() => remove(item.id)}
                hitSlop={8}
                style={({ pressed }) => [styles.remove, pressed && { opacity: 0.7 }]}
                accessibilityLabel={`Remove ${item.name} from team`}
              >
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </PokemonCard>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Your team is empty</Text>
              <Text style={styles.emptyText}>
                Open any Pokémon in the Pokédex and tap "Add to team". You can pick up to {MAX_TEAM}.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  summary: { padding: 14, paddingBottom: 6 },
  countRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  countLabel: { fontWeight: '900', letterSpacing: 2, color: colors.redDark },
  count: { fontSize: 34, fontWeight: '900', color: colors.ink },
  slots: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  slot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#C9CED6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  slotFilled: { borderStyle: 'solid', borderColor: colors.red, backgroundColor: colors.screen },
  slotImg: { width: 40, height: 40 },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginTop: 14,
  },
  statsTitle: { fontWeight: '900', letterSpacing: 1.5, color: colors.muted, fontSize: 12, marginBottom: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: { fontWeight: '800', color: colors.ink },
  totalValue: { fontWeight: '900', color: colors.ink, fontSize: 18 },
  remove: { backgroundColor: colors.bezel, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 6 },
  removeText: { color: colors.yellow, fontWeight: '800', fontSize: 12 },
  empty: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 8 },
});
