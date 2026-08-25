function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[\s\-_./]+/g, "");
}

export function fuzzyMatchScore(query: string, searchable: string) {
  const needle = normalize(query);
  const haystack = normalize(searchable);
  if (!needle) return 0;
  if (!haystack) return -1;
  const exactIndex = haystack.indexOf(needle);
  if (exactIndex >= 0) return 1000 - exactIndex * 2 - Math.max(0, haystack.length - needle.length);

  let searchIndex = 0;
  let firstMatch = -1;
  let previousMatch = -1;
  let gapPenalty = 0;
  for (const character of needle) {
    const matchIndex = haystack.indexOf(character, searchIndex);
    if (matchIndex < 0) return -1;
    if (firstMatch < 0) firstMatch = matchIndex;
    if (previousMatch >= 0) gapPenalty += Math.max(0, matchIndex - previousMatch - 1);
    previousMatch = matchIndex;
    searchIndex = matchIndex + 1;
  }
  return 500 - firstMatch * 2 - gapPenalty * 4;
}

export function fuzzyFilter<T>(items: T[], query: string, searchable: (item: T) => string) {
  if (!query.trim()) return items;
  return items
    .map((item, index) => ({ item, index, score: fuzzyMatchScore(query, searchable(item)) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}
