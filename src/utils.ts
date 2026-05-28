const BOOTH_EXCLUDE_KEYS = ['mapId', 'x', 'y', '__EMPTY', 'x_pixel', 'y_pixel'];

export const getBoothNo = (b: any): string => {
  if (!b) return '';
  const key = Object.keys(b).find(k => !BOOTH_EXCLUDE_KEYS.includes(k));
  return key ? String(b[key]) : '';
};
