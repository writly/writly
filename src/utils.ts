export const hashCode = (str?: string) => {
  const _str = str || "default";
  let hash = 0;
  for (let i = 0, len = _str.length; i < len; i++) {
    let chr = _str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return String(hash);
};
