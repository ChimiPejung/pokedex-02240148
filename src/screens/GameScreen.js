import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PokedexHeader from '../components/PokedexHeader';
import ErrorView from '../components/ErrorView';
import { fetchFirstGen, artworkUrl } from '../api';
import { prettyName, shuffle } from '../utils';
import { colors } from '../theme';

const BEST_KEY = 'pokedex_best_streak_v1';

function makeRound(pool) {
  const target = pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(pool.filter((p) => p.id !== target.id)).slice(0, 3);
  return { target, options: shuffle([target, ...wrong]) }; // answers in random order
}

export default function GameScreen() {
  const [pool, setPool] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [round, setRound] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [played, setPlayed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await fetchFirstGen();
      setPool(list);
      setRound(makeRound(list));
      setStatus('ready');
    } catch (e) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
    AsyncStorage.getItem(BEST_KEY)
      .then((v) => v && setBest(Number(v) || 0))
      .catch(() => {});
  }, [load]);

  const answered = picked !== null;
  const correct = answered && picked === round.target.id;

  const onAnswer = (option) => {
    if (answered) return;
    setPicked(option.id);
    setPlayed((n) => n + 1);
    if (option.id === round.target.id) {
      const newStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(newStreak);
      if (newStreak > best) {
        setBest(newStreak);
        AsyncStorage.setItem(BEST_KEY, String(newStreak)).catch(() => {});
      }
    } else {
      setStreak(0);
    }
  };

  const onNext = () => {
    setPicked(null);
    setRound(makeRound(pool));
  };

  const optionStyle = (option) => {
    if (!answered) return styles.option;
    if (option.id === round.target.id) return [styles.option, styles.optionCorrect];
    if (option.id === picked) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  };

  let content;
  if (status === 'loading') {
    content = <ActivityIndicator size="large" color={colors.red} style={{ marginTop: 80 }} />;
  } else if (status === 'error') {
    content = <ErrorView message={errorMsg} onRetry={load} />;
  } else {
    content = (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.scoreboard}>
          <Stat label="SCORE" value={`${score}/${played}`} />
          <Stat label="STREAK" value={streak} />
          <Stat label="BEST" value={best} />
        </View>

        <View style={styles.screenBox}>
          <Image
            key={round.target.id}
            source={{ uri: artworkUrl(round.target.id) }}
            style={[styles.art, !answered && styles.silhouette]}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.prompt}>
          {!answered
            ? "Who's that Pokémon?"
            : correct
            ? `Correct! It's ${prettyName(round.target.name)}!`
            : `Not quite. It's ${prettyName(round.target.name)}.`}
        </Text>

        {round.options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => onAnswer(option)}
            disabled={answered}
            style={({ pressed }) => [optionStyle(option), pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.optionText}>{prettyName(option.name)}</Text>
          </Pressable>
        ))}

        {answered ? (
          <Pressable onPress={onNext} style={({ pressed }) => [styles.next, pressed && { opacity: 0.85 }]}>
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <PokedexHeader subtitle="GAME" />
      {content}
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  scoreboard: {
    flexDirection: 'row',
    backgroundColor: colors.bezel,
    borderRadius: 14,
    paddingVertical: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.yellow, fontSize: 24, fontWeight: '900' },
  statLabel: { color: '#9AA5B1', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  screenBox: {
    marginTop: 16,
    backgroundColor: colors.screen,
    borderWidth: 5,
    borderColor: colors.bezel,
    borderRadius: 18,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { width: 220, height: 220 },
  silhouette: { tintColor: '#000' }, // black shape from the transparent artwork
  prompt: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
    marginVertical: 16,
  },
  option: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.bezel,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionCorrect: { backgroundColor: '#2ECC71', borderColor: '#1E9D52' },
  optionWrong: { backgroundColor: '#E74C3C', borderColor: '#B83A2E' },
  optionDim: { opacity: 0.45 },
  optionText: { fontSize: 18, fontWeight: '800', color: colors.ink },
  next: {
    marginTop: 8,
    backgroundColor: colors.red,
    borderRadius: 26,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.redDark,
  },
  nextText: { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 1 },
});
