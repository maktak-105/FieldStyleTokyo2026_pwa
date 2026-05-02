export interface Booth {
  "西展示棟1F"?: string | number;
  "__EMPTY": string;
  x: number;
  y: number;
  mapId: 'map1' | 'map2';
}

export interface AppState {
  currentLocation: Booth | null;
  destination: Booth | null;
  isNavigating: boolean;
}
