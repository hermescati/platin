import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

import { igdb, IgdbError } from '../_shared/igdb.ts';

interface IgdbPlatform {
  id: number;
  name: string;
  abbreviation?: string;
  slug?: string;
  generation?: number;
  platform_family?: { name: string };
  platform_type?: { name: string };
  platform_logo?: { image_id: string };
  updated_at?: number;
}

const PAGE_SIZE = 500;
const FIELDS = 'name, abbreviation, slug, generation, platform_family.name, platform_type.name, platform_logo.image_id, updated_at';

const toRecord = (platform: IgdbPlatform) => ({
  igdbId: platform.id,
  name: platform.name,
  abbreviation: platform.abbreviation ?? null,
  slug: platform.slug ?? null,
  generation: platform.generation ?? null,
  family: platform.platform_family?.name ?? null,
  type: platform.platform_type?.name ?? null,
  logoImageId: platform.platform_logo?.image_id ?? null,
  igdbUpdatedAt: platform.updated_at ?? null,
});

export default {
  fetch: withSupabase({ auth: ['publishable'] }, async (req) => {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Use POST' }, { status: 405 });
    }

    try {
      const platforms: IgdbPlatform[] = [];
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const page = await igdb<IgdbPlatform[]>(
          'platforms',
          `fields ${FIELDS}; sort id asc; limit ${PAGE_SIZE}; offset ${offset};`,
        );
        platforms.push(...page);
        if (page.length < PAGE_SIZE) {
          break;
        }
      }
      return Response.json({ platforms: platforms.map(toRecord) });
    } catch (error) {
      if (error instanceof IgdbError) {
        return Response.json({ error: error.message }, { status: 502 });
      }
      return Response.json({ error: error instanceof Error ? error.message : 'Lookup failed' }, { status: 500 });
    }
  }),
};
