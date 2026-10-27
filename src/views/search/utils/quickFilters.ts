import type { MenuItem } from '@/ui/Menu';

export type FilterKey = 'scope' | 'kind' | 'platforms';

export interface QuickFilter {
  key: FilterKey;
  title: string;
  multi: boolean;
  options: MenuItem[];
}

export type FilterValues = Record<FilterKey, string[]>;

export const quickFilters: QuickFilter[] = [
  {
    key: 'scope',
    title: 'Show results from',
    multi: false,
    options: [
      { key: 'all', label: 'All', sub: '3 results', icon: 'stack' },
      { key: 'library', label: 'In my library', sub: '1 result', icon: 'library' },
      { key: 'new', label: 'Not in library', sub: '2 results', icon: 'plus' },
    ],
  },
  {
    key: 'kind',
    title: 'Show',
    multi: false,
    options: [
      { key: 'all', label: 'Games & DLC', sub: '3 results', icon: 'stack' },
      { key: 'games', label: 'Games only', sub: '2 results', icon: 'gamepad' },
      { key: 'dlc', label: 'DLC only', sub: '1 result' },
    ],
  },
  {
    key: 'platforms',
    title: 'Your platforms',
    multi: true,
    options: [
      { key: 'ps5', label: 'PS5', sub: '3 results' },
      { key: 'pc', label: 'PC', sub: '3 results' },
      { key: 'ps4', label: 'PS4', sub: '2 results' },
      { key: 'switch', label: 'Switch', sub: 'No results' },
    ],
  },
];

const filterFor = (key: FilterKey) => quickFilters.find((filter) => filter.key === key) as QuickFilter;

export const defaultFilters = (): FilterValues => ({
  scope: ['all'],
  kind: ['all'],
  platforms: filterFor('platforms').options.map((option) => option.key),
});

export const isActive = (key: FilterKey, values: FilterValues) =>
  key === 'platforms'
    ? values.platforms.length < filterFor('platforms').options.length
    : values[key][0] !== 'all';

export const hasActiveFilters = (values: FilterValues) => quickFilters.some((filter) => isActive(filter.key, values));

export const filterLabel = (key: FilterKey, values: FilterValues) => {
  const { options } = filterFor(key);
  const chosen = options.filter((option) => values[key].includes(option.key));
  if (key !== 'platforms') {
    return chosen[0]?.label ?? options[0].label;
  }
  if (!isActive(key, values)) {
    return 'Platforms';
  }
  return chosen.length > 1 ? `${chosen[0].label} +${chosen.length - 1}` : chosen[0].label;
};

export const toggleFilter = (filter: QuickFilter, values: FilterValues, option: string): FilterValues => {
  if (!filter.multi) {
    return { ...values, [filter.key]: [option] };
  }
  const current = values[filter.key];
  const next = current.includes(option) ? current.filter((key) => key !== option) : [...current, option];
  return next.length === 0 ? values : { ...values, [filter.key]: next };
};
