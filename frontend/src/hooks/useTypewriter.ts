import { useEffect, useState } from 'react';

/**
 * Custom hook that progressively reveals a target string one character at a time.
 */
export function useTypewriter(
  fullText: string,
  speedMs = 15
): { displayedText: string; isTyping: boolean } {
  const [revealState, setRevealState] = useState<{
    text: string;
    count: number;
  }>({ text: fullText, count: 0 });

  const currentCount =
    speedMs <= 0
      ? fullText.length
      : revealState.text === fullText
        ? revealState.count
        : 0;

  useEffect(() => {
    if (speedMs <= 0) {
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setRevealState({ text: fullText, count: index });
      if (index >= fullText.length) {
        clearInterval(timer);
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [fullText, speedMs]);

  return {
    displayedText: fullText.slice(0, currentCount),
    isTyping: currentCount < fullText.length,
  };
}

