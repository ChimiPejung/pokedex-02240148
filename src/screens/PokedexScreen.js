import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import PokedexHeader from '../components/PokedexHeader';
import PokemonCard from '../components/PokemonCard';
import ErrorView from '../components/ErrorView';
import useDebounce from '../useDebounce';
import {
  START_OFFSET,
  TYPES,
  fetchPokemonPage,
  fetchAllNames,
  fetchPokemonByType,
} from '../api';
import { colors, typeColors } from '../theme';

export default function PokedexScreen({ navigation }) {
  // ---------- infinite scroll (normal browsing) ----------
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [moreStatus, setMoreStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');
  const nextOffset = useRef(START_OFFSET);
  const busy = useRef(false); // stops two page requests running at once

  const loadPage = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const isFirst = nextOffset.current === START_OFFSET;
    if (isFirst) setStatus('loading');
    else setMoreStatus('loading');
    try {
      const page = await fetchPokemonPage(nextOffset.current);
      nextOffset.current += page.items.length;
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.items.filter((p) => !seen.has(p.id))]; // no duplicates
      });
      setHasMore(page.hasMore);
      setStatus('ready');
      setMoreStatus('idle');
    } catch (e) {
      setErrorMsg(e.message);
      if (isFirst) setStatus('error');
      else setMoreStatus('error');
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // ---------- search (debounced) + type filter (own feature) ----------
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query.trim().toLowerCase(), 400);
  const searching = debounced.length > 0;
  const [type, setType] = useState(null);
  const filtering = searching || type !== null;

  const [source, setSource] = useState(null);
  const [filterStatus, setFilterStatus] = useState('idle');
  const [retryKey, setRetryKey] = useState(0);
  const namesCache = useRef(null);
  const typeCache = useRef({});

  useEffect(() => {
    if (!filtering) {
      setFilterStatus('idle');
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setFilterStatus('loading');
      setSource(null);
      try {
        let list;
        if (type) {
          if (!typeCache.current[type]) typeCache.current[type] = await fetchPokemonByType(type);
          list = typeCache.current[type];
        } else {
          if (!namesCache.current) namesCache.current = await fetchAllNames();
          list = namesCache.current;
        }
        if (!cancelled) {
          setSource(list);
          setFilterStatus('ready');
        }
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e.message);
          setFilterStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, searching, filtering, retryKey]);

  const results = useMemo(() => {
    if (!source) return [];
    if (!searching) return source;
    const q = debounced.replace(/\s+/g, '-');
    return source.filter((p) => p.name.includes(q) || String(p.id) === debounced);
  }, [source, searching, debounced]);

  // ---------- rendering ----------
  const renderItem = useCallback(
    ({ item }) => (
      <PokemonCard
        id={item.id}
        name={item.name}
        onPress={() => navigation.navigate('Detail', { id: item.id })}
      />
    ),
    [navigation]
  );

  const onEndReached = () => {
    if (filtering || !hasMore || status !== 'ready' || moreStatus === 'error') return;
    loadPage();
  };

  const footer = () => {
    if (filtering) return null;
    if (moreStatus === 'loading') return <ActivityIndicator style={styles.footer} color={colors.red} />;
    if (moreStatus === 'error') {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Could not load more. {errorMsg}</Text>
          <Pressable onPress={loadPage} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (!hasMore) return <Text style={[styles.footer, styles.footerText]}>End of the Pokédex</Text>;
    return null;
  };

  let body;
  if (!filtering) {
    if (status === 'loading' && items.length === 0) {
      body = <ActivityIndicator size="large" color={colors.red} style={styles.center} />;
    } else if (status === 'error' && items.length === 0) {
      body = <ErrorView message={errorMsg} onRetry={loadPage} />;
    }
  } else if (filterStatus === 'loading' || filterStatus === 'idle') {
    body = <ActivityIndicator size="large" color={colors.red} style={styles.center} />;
  } else if (filterStatus === 'error') {
    body = <ErrorView message={errorMsg} onRetry={() => setRetryKey((k) => k + 1)} />;
  } else if (results.length === 0) {
    body = (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No Pokémon found</Text>
        <Text style={styles.emptyText}>
          {searching ? `Nothing matches "${query.trim()}"` : 'Nothing to show'}
          {type ? ` in the ${type} type.` : '.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <PokedexHeader subtitle="POKÉDEX" />
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search all Pokémon by name or number"
          placeholderTextColor={colors.muted}
          style={styles.search}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          keyboardShouldPersistTaps="handled"
        >
          <Chip label="All" active={type === null} color={colors.bezel} onPress={() => setType(null)} />
          {TYPES.map((t) => (
            <Chip
              key={t}
              label={t}
              active={type === t}
              color={typeColors[t]}
              onPress={() => setType(type === t ? null : t)}
            />
          ))}
        </ScrollView>
      </View>

      {body ? (
        body
      ) : (
        <FlatList
          data={filtering ? results : items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={footer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={10}
          windowSize={7}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

function Chip({ label, active, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: color },
        active && { backgroundColor: color },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? '#fff' : color }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  searchWrap: { paddingHorizontal: 14, paddingTop: 12 },
  search: {
    backgroundColor: colors.bezel,
    color: colors.yellow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    borderWidth: 2,
    borderColor: '#38424F',
  },
  chips: { paddingHorizontal: 14, paddingVertical: 10 },
  chip: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  chipText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  list: { paddingBottom: 24 },
  center: { marginTop: 60 },
  footer: { padding: 18, alignItems: 'center', textAlign: 'center' },
  footerText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  smallBtn: { marginTop: 8, backgroundColor: colors.red, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 8 },
  smallBtnText: { color: '#fff', fontWeight: '800' },
  empty: { alignItems: 'center', padding: 32, marginTop: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  emptyText: { fontSize: 14, color: colors.muted, marginTop: 8, textAlign: 'center' },
});
