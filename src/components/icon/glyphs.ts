import type { Glyph } from '@/components/icon/types';

export const glyphs = {
  plus: { outline: { strokes: [{ kind: 'path', d: 'M12 5.5v13M5.5 12h13' }] } },
  check: { outline: { strokes: [{ kind: 'path', d: 'm5.5 12.5 4 4 9-9.5' }] } },
  close: { outline: { strokes: [{ kind: 'path', d: 'm7 7 10 10M17 7 7 17' }] } },
  chevronDown: { outline: { strokes: [{ kind: 'path', d: 'm7 10 5 5 5-5' }] } },
  chevronRight: { outline: { strokes: [{ kind: 'path', d: 'm10 7 5 5-5 5' }] } },
  back: { outline: { strokes: [{ kind: 'path', d: 'm14.5 6.5-5.5 5.5 5.5 5.5' }] } },
  search: {
    outline: { strokes: [{ kind: 'circle', cx: 10.75, cy: 10.75, r: 6.25 }, { kind: 'path', d: 'm15.5 15.5 4 4' }] },
  },
  filter: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M5 8h6.5M16.5 8H19M5 16h2.5M12.5 16H19' },
        { kind: 'circle', cx: 14, cy: 8, r: 2.25 },
        { kind: 'circle', cx: 10, cy: 16, r: 2.25 },
      ],
    },
  },
  sort: { outline: { strokes: [{ kind: 'path', d: 'M5.5 8h13M8 12h8M10.5 16h3' }] } },
  more: {
    outline: {
      dots: [
        { kind: 'circle', cx: 6, cy: 12, r: 1.5 },
        { kind: 'circle', cx: 12, cy: 12, r: 1.5 },
        { kind: 'circle', cx: 18, cy: 12, r: 1.5 },
      ],
    },
  },
  bookmark: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M7 6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V19.2a.6.6 0 0 1-.95.5L12 16.8l-4.05 2.9a.6.6 0 0 1-.95-.5z' },
      ],
    },
    fill: {
      shapes: [
        { kind: 'path', d: 'M7 6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V19.2a.6.6 0 0 1-.95.5L12 16.8l-4.05 2.9a.6.6 0 0 1-.95-.5z' },
      ],
    },
  },
  edit: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M14.6 5.6a2.1 2.1 0 0 1 3 0l.8.8a2.1 2.1 0 0 1 0 3L9.3 18.5 5 19.5l1-4.3z' },
        { kind: 'path', d: 'm13 7.2 3.8 3.8' },
      ],
    },
    fill: {
      shapes: [{ kind: 'path', d: 'M14.6 5.6a2.1 2.1 0 0 1 3 0l.8.8a2.1 2.1 0 0 1 0 3L9.3 18.5 5 19.5l1-4.3z' }],
      knockouts: [{ kind: 'path', d: 'm13 7.2 3.8 3.8' }],
    },
  },
  trash: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M5 7h14M10 4h4M7 7l.75 11.1A2 2 0 0 0 9.75 20h4.5a2 2 0 0 0 2-1.9L17 7M10.5 11v5M13.5 11v5' },
      ],
    },
    fill: {
      shapes: [{ kind: 'path', d: 'M7 7l.75 11.1A2 2 0 0 0 9.75 20h4.5a2 2 0 0 0 2-1.9L17 7z' }],
      knockouts: [{ kind: 'path', d: 'M10.5 11v5M13.5 11v5' }],
      strokes: [{ kind: 'path', d: 'M5 7h14M10 4h4' }],
    },
  },
  share: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M12 4v10.5M8.5 7.5 12 4l3.5 3.5M7 11H6.5A1.5 1.5 0 0 0 5 12.5v5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-5a1.5 1.5 0 0 0-1.5-1.5H17' },
      ],
    },
  },
  clock: {
    outline: { strokes: [{ kind: 'circle', cx: 12, cy: 12, r: 8.25 }, { kind: 'path', d: 'M12 8v4l2.75 1.75' }] },
    fill: {
      shapes: [{ kind: 'circle', cx: 12, cy: 12, r: 8.25 }],
      knockouts: [{ kind: 'path', d: 'M12 8v4l2.75 1.75' }],
    },
  },
  calendar: {
    outline: {
      strokes: [
        { kind: 'rect', x: 4, y: 5.5, width: 16, height: 14.5, rx: 3.5 },
        { kind: 'path', d: 'M4 10.5h16M8.5 3.5v3.5M15.5 3.5v3.5' },
      ],
    },
    fill: {
      shapes: [{ kind: 'rect', x: 4, y: 5.5, width: 16, height: 14.5, rx: 3.5 }],
      knockouts: [{ kind: 'path', d: 'M4 10.5h16' }],
      strokes: [{ kind: 'path', d: 'M8.5 3.5v3.5M15.5 3.5v3.5' }],
    },
  },
  star: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M11.1 4.3a1 1 0 0 1 1.8 0l1.9 3.9 4.3.6a1 1 0 0 1 .55 1.7l-3.1 3 .73 4.3a1 1 0 0 1-1.45 1.05L12 16.8l-3.83 2.05a1 1 0 0 1-1.45-1.05l.73-4.3-3.1-3a1 1 0 0 1 .55-1.7l4.3-.6z' },
      ],
    },
    fill: {
      shapes: [
        { kind: 'path', d: 'M11.1 4.3a1 1 0 0 1 1.8 0l1.9 3.9 4.3.6a1 1 0 0 1 .55 1.7l-3.1 3 .73 4.3a1 1 0 0 1-1.45 1.05L12 16.8l-3.83 2.05a1 1 0 0 1-1.45-1.05l.73-4.3-3.1-3a1 1 0 0 1 .55-1.7l4.3-.6z' },
      ],
    },
  },
  trophy: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M8 4.5h8V10a4 4 0 0 1-8 0zM8 6.5H6.5a2 2 0 0 0 0 4h1.8M16 6.5h1.5a2 2 0 0 1 0 4h-1.8M12 14v3.5M9 19.5h6' },
      ],
    },
    fill: {
      shapes: [{ kind: 'path', d: 'M8 4.5h8V10a4 4 0 0 1-8 0z' }],
      strokes: [{ kind: 'path', d: 'M8 6.5H6.5a2 2 0 0 0 0 4h1.8M16 6.5h1.5a2 2 0 0 1 0 4h-1.8M12 14v3.5M9 19.5h6' }],
    },
  },
  gamepad: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M8.5 7h7a5 5 0 0 1 5 5v1.6a3.4 3.4 0 0 1-6.1 2.1l-.9-1.2h-3l-.9 1.2a3.4 3.4 0 0 1-6.1-2.1V12a5 5 0 0 1 5-5z' },
        { kind: 'path', d: 'M8.5 9.75v3.5M6.75 11.5h3.5' },
      ],
      dots: [{ kind: 'circle', cx: 15.5, cy: 10.5, r: 1 }, { kind: 'circle', cx: 17, cy: 12.75, r: 1 }],
    },
    fill: {
      shapes: [
        { kind: 'path', d: 'M8.5 7h7a5 5 0 0 1 5 5v1.6a3.4 3.4 0 0 1-6.1 2.1l-.9-1.2h-3l-.9 1.2a3.4 3.4 0 0 1-6.1-2.1V12a5 5 0 0 1 5-5z' },
      ],
      knockouts: [{ kind: 'path', d: 'M8.5 9.75v3.5M6.75 11.5h3.5' }],
      knockoutDots: [{ kind: 'circle', cx: 15.5, cy: 10.5, r: 1.1 }, { kind: 'circle', cx: 17, cy: 12.75, r: 1.1 }],
    },
  },
  info: {
    outline: {
      strokes: [{ kind: 'circle', cx: 12, cy: 12, r: 8.25 }, { kind: 'path', d: 'M12 11v5' }],
      dots: [{ kind: 'circle', cx: 12, cy: 8, r: 1.1 }],
    },
    fill: {
      shapes: [{ kind: 'circle', cx: 12, cy: 12, r: 8.25 }],
      knockouts: [{ kind: 'path', d: 'M12 11v5' }],
      knockoutDots: [{ kind: 'circle', cx: 12, cy: 8, r: 1.2 }],
    },
  },
  warning: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M10.27 5.1a2 2 0 0 1 3.46 0l6.4 11.15A2 2 0 0 1 18.4 19.25H5.6a2 2 0 0 1-1.73-3z' },
        { kind: 'path', d: 'M12 10v3.5' },
      ],
      dots: [{ kind: 'circle', cx: 12, cy: 16.25, r: 1.1 }],
    },
    fill: {
      shapes: [
        { kind: 'path', d: 'M10.27 5.1a2 2 0 0 1 3.46 0l6.4 11.15A2 2 0 0 1 18.4 19.25H5.6a2 2 0 0 1-1.73-3z' },
      ],
      knockouts: [{ kind: 'path', d: 'M12 10v3.5' }],
      knockoutDots: [{ kind: 'circle', cx: 12, cy: 16.25, r: 1.2 }],
    },
  },
  error: {
    outline: {
      strokes: [{ kind: 'circle', cx: 12, cy: 12, r: 8.25 }, { kind: 'path', d: 'm9.5 9.5 5 5M14.5 9.5l-5 5' }],
    },
    fill: {
      shapes: [{ kind: 'circle', cx: 12, cy: 12, r: 8.25 }],
      knockouts: [{ kind: 'path', d: 'm9.5 9.5 5 5M14.5 9.5l-5 5' }],
    },
  },
  gear: {
    outline: {
      strokes: [
        { kind: 'circle', cx: 12, cy: 12, r: 2.75 },
        { kind: 'path', d: 'M19.4 13.5a7.6 7.6 0 0 0 0-3l1.6-1.3-1.8-3.1-2 .7a7.5 7.5 0 0 0-2.6-1.5L14.2 3.2h-3.6l-.4 2.1a7.5 7.5 0 0 0-2.6 1.5l-2-.7-1.8 3.1 1.6 1.3a7.6 7.6 0 0 0 0 3l-1.6 1.3 1.8 3.1 2-.7a7.5 7.5 0 0 0 2.6 1.5l.4 2.1h3.6l.4-2.1a7.5 7.5 0 0 0 2.6-1.5l2 .7 1.8-3.1z' },
      ],
    },
    fill: {
      shapes: [
        { kind: 'path', d: 'M19.4 13.5a7.6 7.6 0 0 0 0-3l1.6-1.3-1.8-3.1-2 .7a7.5 7.5 0 0 0-2.6-1.5L14.2 3.2h-3.6l-.4 2.1a7.5 7.5 0 0 0-2.6 1.5l-2-.7-1.8 3.1 1.6 1.3a7.6 7.6 0 0 0 0 3l-1.6 1.3 1.8 3.1 2-.7a7.5 7.5 0 0 0 2.6 1.5l.4 2.1h3.6l.4-2.1a7.5 7.5 0 0 0 2.6-1.5l2 .7 1.8-3.1z' },
      ],
      knockoutDots: [{ kind: 'circle', cx: 12, cy: 12, r: 2.75 }],
    },
  },
  link: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M10 14a4 4 0 0 0 5.66 0l2.6-2.6a4 4 0 0 0-5.66-5.66l-.8.8M14 10a4 4 0 0 0-5.66 0l-2.6 2.6a4 4 0 0 0 5.66 5.66l.8-.8' },
      ],
    },
  },
  lock: {
    outline: {
      strokes: [
        { kind: 'rect', x: 5.5, y: 10.5, width: 13, height: 10, rx: 3 },
        { kind: 'path', d: 'M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5' },
      ],
    },
    fill: {
      shapes: [{ kind: 'rect', x: 5.5, y: 10.5, width: 13, height: 10, rx: 3 }],
      strokes: [{ kind: 'path', d: 'M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5' }],
    },
  },
  home: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M4.5 10.6a2 2 0 0 1 .73-1.55l5.5-4.5a2 2 0 0 1 2.54 0l5.5 4.5a2 2 0 0 1 .73 1.55V18a2 2 0 0 1-2 2h-2.5v-4.5a1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5V20H6.5a2 2 0 0 1-2-2z' },
      ],
    },
    fill: {
      shapes: [
        { kind: 'path', d: 'M4.5 10.6a2 2 0 0 1 .73-1.55l5.5-4.5a2 2 0 0 1 2.54 0l5.5 4.5a2 2 0 0 1 .73 1.55V18a2 2 0 0 1-2 2h-2.5v-4.5a1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5V20H6.5a2 2 0 0 1-2-2z' },
      ],
    },
  },
  library: {
    outline: {
      strokes: [
        { kind: 'rect', x: 4, y: 4.5, width: 4.5, height: 15, rx: 1.75 },
        { kind: 'rect', x: 10.5, y: 4.5, width: 4.5, height: 15, rx: 1.75 },
        { kind: 'path', d: 'm17.4 6.1 1.8.5a1.2 1.2 0 0 1 .85 1.47l-2.9 10.8a1.2 1.2 0 0 1-1.47.85l-.68-.18' },
      ],
    },
    fill: {
      shapes: [
        { kind: 'rect', x: 4, y: 4.5, width: 4.5, height: 15, rx: 1.75 },
        { kind: 'rect', x: 10.5, y: 4.5, width: 4.5, height: 15, rx: 1.75 },
      ],
      strokes: [
        { kind: 'path', d: 'm17.4 6.1 1.8.5a1.2 1.2 0 0 1 .85 1.47l-2.9 10.8a1.2 1.2 0 0 1-1.47.85l-.68-.18' },
      ],
    },
  },
  person: {
    outline: {
      strokes: [
        { kind: 'circle', cx: 12, cy: 8.5, r: 3.75 },
        { kind: 'path', d: 'M5.5 19.5c1.1-3.1 3.6-5 6.5-5s5.4 1.9 6.5 5' },
      ],
    },
    fill: {
      shapes: [
        { kind: 'circle', cx: 12, cy: 8.5, r: 3.75 },
        { kind: 'path', d: 'M5.5 19.5c1.1-3.1 3.6-5 6.5-5s5.4 1.9 6.5 5z' },
      ],
    },
  },
  flag: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M6 20.5V5M6 5c2.6-1.6 4.6-.4 6.4.4 1.9.8 3.6 1.4 5.6.1v8.4c-2 1.3-3.7.7-5.6-.1-1.8-.8-3.8-2-6.4-.4' },
      ],
    },
    fill: {
      shapes: [
        { kind: 'path', d: 'M6 5c2.6-1.6 4.6-.4 6.4.4 1.9.8 3.6 1.4 5.6.1v8.4c-2 1.3-3.7.7-5.6-.1-1.8-.8-3.8-2-6.4-.4z' },
      ],
      strokes: [{ kind: 'path', d: 'M6 20.5V5' }],
    },
  },
  archive: {
    outline: {
      strokes: [
        { kind: 'rect', x: 3.5, y: 4.5, width: 17, height: 5, rx: 2 },
        { kind: 'path', d: 'M5.5 9.5V17a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V9.5M10 13.5h4' },
      ],
    },
    fill: {
      shapes: [
        { kind: 'rect', x: 3.5, y: 4.5, width: 17, height: 5, rx: 2 },
        { kind: 'path', d: 'M5.5 11.5V17a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-5.5z' },
      ],
      knockouts: [{ kind: 'path', d: 'M10 14.5h4' }],
    },
  },
  stack: {
    outline: {
      strokes: [{ kind: 'rect', x: 4.5, y: 9, width: 15, height: 11, rx: 3.25 }, { kind: 'path', d: 'M7.5 6h9' }],
    },
    fill: {
      shapes: [{ kind: 'rect', x: 4.5, y: 9, width: 15, height: 11, rx: 3.25 }],
      strokes: [{ kind: 'path', d: 'M7.5 6h9' }],
    },
  },
  activity: {
    outline: {
      strokes: [
        { kind: 'rect', x: 4.5, y: 12, width: 3.5, height: 7.5, rx: 1.5 },
        { kind: 'rect', x: 10.25, y: 4.5, width: 3.5, height: 15, rx: 1.5 },
        { kind: 'rect', x: 16, y: 8.5, width: 3.5, height: 11, rx: 1.5 },
      ],
    },
    fill: {
      shapes: [
        { kind: 'rect', x: 4.5, y: 12, width: 3.5, height: 7.5, rx: 1.5 },
        { kind: 'rect', x: 10.25, y: 4.5, width: 3.5, height: 15, rx: 1.5 },
        { kind: 'rect', x: 16, y: 8.5, width: 3.5, height: 11, rx: 1.5 },
      ],
    },
  },
  flame: {
    outline: {
      strokes: [
        { kind: 'path', d: 'M12 3.5c.9 3.1 4.75 5 4.75 9.6a4.75 4.75 0 0 1-9.5 0c0-2.1.95-3.6 2.3-4.75.2 1.5.85 2.45 2 2.95C11 8.6 11.25 5.6 12 3.5z' },
      ],
    },
  },
  chart: { outline: { strokes: [{ kind: 'path', d: 'M4.5 19.5h15M7 16v-4M12 16V7M17 16v-6.5' }] } },
  refresh: { outline: { strokes: [{ kind: 'path', d: 'M19 12a7 7 0 1 1-2.05-4.95M19 4.5v4h-4' }] } },
  download: { outline: { strokes: [{ kind: 'path', d: 'M12 4.5v10M8 10.5l4 4 4-4M5.5 19.5h13' }] } },
  medal: {
    outline: {
      strokes: [
        { kind: 'circle', cx: 12, cy: 14.5, r: 5 },
        { kind: 'path', d: 'M9 9.9 6.5 4.5h4l1.5 3M15 9.9l2.5-5.4h-4L12 7.5' },
      ],
    },
  },
  mail: {
    outline: {
      strokes: [
        { kind: 'rect', x: 3.75, y: 5.75, width: 16.5, height: 12.5, rx: 3 },
        { kind: 'path', d: 'm4.5 7.5 7.5 5.5 7.5-5.5' },
      ],
    },
  },
  logout: {
    outline: {
      strokes: [{ kind: 'path', d: 'M14 5.5h2.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H14M10 8.5 6.5 12l3.5 3.5M6.5 12h9' }],
    },
  },
  minus: { outline: { strokes: [{ kind: 'path', d: 'M5.5 12h13' }] } },
} as const satisfies Record<string, Glyph>;

export type IconName = keyof typeof glyphs;
