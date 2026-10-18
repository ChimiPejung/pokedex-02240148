import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import PokedexHeader from '../components/PokedexHeader';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';
import ErrorView from '../components/ErrorView';
import { useTeam, MAX_TEAM } from '../TeamContext';
import { fetchPokemonDetail, artworkUrl, STAT_ORDER, STAT_LABELS } from '../api';
import { padId, prettyName } from '../utils';
import { colors } from '../theme';

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params; // the id arrives through route params
  const { team, add, remove, has, isFull } = useTeam();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setData(await fetchPokemonDetail(id));
      setStatus('ready');
    } catch (e) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const inTeam = data ? has(data.id) : false;
  const blocked = !inTeam && isFull; // team is full and this one is not in it

  const onToggle = () => {
    if (!data) return;
    if (inTeam) remove(data.id);
    else add({ id: data.id, name: data.name, types: data.types, stats: data.stats });
  };

  let content;
  if (status === 'loading') {
    content = <ActivityIndicator size="large" color={colors.red} style={{ marginTop: 80 }} />;
  } else if (status === 'error') {
    content = <ErrorView message={errorMsg} onRetry={load} />;
  } else {
    content = (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.screenBox}>
          <Image source={{ uri: artworkUrl(data.id) }} style={styles.art} resizeMode="contain" />
        </View>
        <Text style={styles.num}>No. {padId(data.id)}</Text>
        <Text style={styles.name}>{prettyName(data.name)}</Text>
        <View style={styles.types}>
          {data.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </View>

        <View style={styles.facts}>
          <View style={styles.fact}>
            <Text style={styles.factValue}>{data.height.toFixed(1)} m</Text>
            <Text style={styles.factLabel}>HEIGHT</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.fact}>
            <Text style={styles.factValue}>{data.weight.toFixed(1)} kg</Text>
            <Text style={styles.factLabel}>WEIGHT</Text>
          </View>
        </View>

        <Text style={styles.section}>BASE STATS</Text>
        <View style={styles.statsCard}>
          {STAT_ORDER.map((key) => (
            <StatBar key={key} label={STAT_LABELS[key]} value={data.stats[key]} />
          ))}
        </View>

        <Pressable
          onPress={onToggle}
          disabled={blocked}
          style={({ pressed }) => [
            styles.btn,
            inTeam && styles.btnRemove,
            blocked && styles.btnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.btnText}>
            {inTeam
              ? 'Remove from team'
              : blocked
              ? `Team is full (${MAX_TEAM}/${MAX_TEAM})`
              : `Add to team (${team.length}/${MAX_TEAM})`}
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <PokedexHeader subtitle="DETAILS" onBack={() => navigation.goBack()} />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  screenBox: {
    backgroundColor: colors.screen,
    borderWidth: 5,
    borderColor: colors.bezel,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    height: 260,
  },
  art: { width: 230, height: 230 },
  num: { marginTop: 14, color: colors.muted, fontWeight: '800', letterSpacing: 1.5 },
  name: { fontSize: 32, fontWeight: '900', color: colors.ink, marginTop: 2 },
  types: { flexDirection: 'row', marginTop: 10 },
  facts: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 16,
    paddingVertical: 14,
  },
  fact: { flex: 1, alignItems: 'center' },
  factValue: { fontSize: 20, fontWeight: '800', color: colors.ink },
  factLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1.5, marginTop: 2 },
  divider: { width: 1, backgroundColor: colors.line },
  section: { marginTop: 22, marginBottom: 8, fontWeight: '900', letterSpacing: 2, color: colors.redDark },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  btn: {
    marginTop: 24,
    backgroundColor: colors.red,
    borderRadius: 26,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.redDark,
  },
  btnRemove: { backgroundColor: colors.bezel, borderBottomColor: '#0E141B' },
  btnDisabled: { backgroundColor: '#B9B9BF', borderBottomColor: '#9A9AA1' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});
