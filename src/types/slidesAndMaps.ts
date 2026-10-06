export type SlideVisualTheme =
  | 'gradient-indigo'
  | 'gradient-purple'
  | 'gradient-teal'
  | 'gradient-amber'
  | 'gradient-rose'
  | 'dark-nebula'
  | 'clean-minimal';

export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle: string;
  bullets: string[];
  highlight?: string;
  iconName: string;
  bgTheme: SlideVisualTheme;
  narrationText: string; // Narration script for audio voice in video mode
  durationSeconds: number; // e.g. 7-10 seconds
  animation: 'fade' | 'slide' | 'zoom';
}

export interface SlidePresentation {
  id: string;
  title: string;
  subtitle: string;
  topic: string;
  grade: string;
  subject: string;
  createdAt: string;
  slides: SlideItem[];
}

export interface GeoMapLegendItem {
  label: string;
  color: string;
  description: string;
}

export interface GeoMapPointOfInterest {
  id: string;
  name: string;
  category: 'capital' | 'river' | 'peak' | 'port' | 'biome' | 'climate' | 'city';
  xPercent: number; // 0 - 100% position on map
  yPercent: number; // 0 - 100% position on map
  detail: string;
}

export interface GeoMapRegionZone {
  id: string;
  name: string;
  color: string;
  areaKm2?: string;
  climate?: string;
  characteristics: string[];
}

export interface GeoMapData {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  scale: string;
  projection: string;
  orientation: string;
  summary: string;
  legend: GeoMapLegendItem[];
  regionsOrZones: GeoMapRegionZone[];
  pointsOfInterest: GeoMapPointOfInterest[];
  curiosities: string[];
  svgMarkup: string; // Scalable SVG vector map
  createdAt: string;
}
