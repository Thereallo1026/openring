export interface Site {
  url: string;
  name: string;
  // 88x31 image
  image?: string;
  description?: string;
}

export interface SitesList {
  sites: Site[];
}

export interface NavigationResult {
  site: Site;
  position: number;
  total: number;
}
