import type { SitesList } from "../types";

const sitesKey = "sites:list";

export const getSitesList = async (kv: KVNamespace): Promise<SitesList> => {
  const data = await kv.get<SitesList>(sitesKey, "json");
  if (!(data && Array.isArray(data.sites))) {
    return { sites: [] };
  }
  return { sites: data.sites };
};

export const saveSitesList = async (
  kv: KVNamespace,
  sitesList: SitesList
): Promise<void> => {
  await kv.put(sitesKey, JSON.stringify(sitesList));
};
