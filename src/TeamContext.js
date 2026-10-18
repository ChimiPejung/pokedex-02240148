import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pokedex_team_v1';
export const MAX_TEAM = 6;

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Restore the saved team once, when the app starts.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setTeam(parsed.slice(0, MAX_TEAM));
        }
      } catch (e) {
        // A corrupt or missing value just means an empty team.
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save on every change, but only after the restore finished,
  // otherwise the empty initial state would overwrite the saved team.
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(team)).catch(() => {});
  }, [team, loaded]);

  const add = useCallback((member) => {
    setTeam((prev) => {
      if (prev.length >= MAX_TEAM) return prev;
      if (prev.some((m) => m.id === member.id)) return prev;
      return [...prev, member];
    });
  }, []);

  const remove = useCallback((id) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      team,
      loaded,
      add,
      remove,
      has: (id) => team.some((m) => m.id === id),
      isFull: team.length >= MAX_TEAM,
    }),
    [team, loaded, add, remove]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used inside <TeamProvider>');
  return ctx;
}
