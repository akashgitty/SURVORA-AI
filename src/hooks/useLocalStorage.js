import { useEffect, useState } from 'react';

// Same as useState, but the value survives page reloads.
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage may be blocked; the app still works */
    }
  }, [key, value]);

  return [value, setValue];
}
