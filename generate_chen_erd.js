const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// Canvas dimensions
const W = 3200;
const H = 2400;

// Escape XML
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper functions for SVG Chen elements
function drawEntity(x, y, w, h, name) {
  return `
    <g class="entity" id="entity_${name}">
      <!-- Double border or clean single border like notebook -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#FFFFFF" stroke="#000000" stroke-width="2.5" />
      <text x="${x + w / 2}" y="${y + h / 2 + 7}" font-family="'Courier New', Courier, monospace, 'Segoe UI', Arial" font-size="20" font-weight="bold" fill="#000000" text-anchor="middle">${escapeXml(name)}</text>
    </g>`;
}

function drawDiamond(cx, cy, rx, ry, name) {
  const p1 = `${cx},${cy - ry}`;
  const p2 = `${cx + rx},${cy}`;
  const p3 = `${cx},${cy + ry}`;
  const p4 = `${cx - rx},${cy}`;
  return `
    <g class="relationship" id="rel_${name}">
      <polygon points="${p1} ${p2} ${p3} ${p4}" fill="#FFFFFF" stroke="#000000" stroke-width="2.2" />
      <text x="${cx}" y="${cy + 5}" font-family="'Courier New', Courier, monospace, 'Segoe UI', Arial" font-size="16" font-weight="bold" font-style="italic" fill="#000000" text-anchor="middle">${escapeXml(name)}</text>
    </g>`;
}

function drawAttribute(cx, cy, rx, ry, name, isKey = false, isMultiValued = false) {
  let doubleOval = '';
  if (isMultiValued) {
    doubleOval = `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 4}" ry="${ry - 4}" fill="#FFFFFF" stroke="#000000" stroke-width="1.2" />`;
  }
  
  const textDecor = isKey ? 'text-decoration="underline"' : '';
  const fontWeight = isKey ? 'bold' : 'normal';

  return `
    <g class="attribute" id="attr_${name}">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFFFFF" stroke="#000000" stroke-width="1.8" />
      ${doubleOval}
      <text x="${cx}" y="${cy + 5}" font-family="'Courier New', Courier, monospace, 'Segoe UI', Arial" font-size="14" font-weight="${fontWeight}" ${textDecor} fill="#000000" text-anchor="middle">${escapeXml(name)}</text>
    </g>`;
}

function drawLine(x1, y1, x2, y2, label = '', labelPos = null) {
  let svgLine = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000000" stroke-width="1.8" />\n`;
  if (label && labelPos) {
    svgLine += `
      <rect x="${labelPos.x - 14}" y="${labelPos.y - 12}" width="28" height="20" fill="#FFFFFF" stroke="none" />
      <text x="${labelPos.x}" y="${labelPos.y + 4}" font-family="'Courier New', Courier, monospace, 'Segoe UI', Arial" font-size="16" font-weight="bold" fill="#000000" text-anchor="middle">${escapeXml(label)}</text>\n`;
  }
  return svgLine;
}

// Entities definition
const entities = [
  { id: 'User', name: 'User', x: 1470, y: 440, w: 220, h: 65, cx: 1580, cy: 472.5 },
  { id: 'UserProfile', name: 'UserProfile', x: 1450, y: 770, w: 260, h: 65, cx: 1580, cy: 802.5 },
  { id: 'DailyHealthLog', name: 'DailyHealthLog', x: 740, y: 440, w: 250, h: 65, cx: 865, cy: 472.5 },
  { id: 'DoshaAssessment', name: 'DoshaAssessment', x: 2210, y: 440, w: 260, h: 65, cx: 2340, cy: 472.5 },
  { id: 'Reminder', name: 'Reminder', x: 750, y: 770, w: 230, h: 65, cx: 865, cy: 802.5 },
  { id: 'WomensHealthProfile', name: 'WomensHealth', x: 2210, y: 770, w: 260, h: 65, cx: 2340, cy: 802.5 },
  { id: 'MealPlan', name: 'MealPlan', x: 1460, y: 1150, w: 240, h: 65, cx: 1580, cy: 1182.5 },
  { id: 'Recipe', name: 'Recipe', x: 750, y: 1500, w: 230, h: 65, cx: 865, cy: 1532.5 },
  { id: 'FoodItem', name: 'FoodItem', x: 2220, y: 1500, w: 240, h: 65, cx: 2340, cy: 1532.5 }
];

// Relationships definition (Diamonds)
const relationships = [
  // User (1) --- <Has> --- (1) UserProfile
  {
    name: 'Has',
    cx: 1580,
    cy: 620,
    rx: 65,
    ry: 40,
    lines: [
      { x1: 1580, y1: 505, x2: 1580, y2: 580, card: '1', cpos: { x: 1600, y: 540 } },
      { x1: 1580, y1: 660, x2: 1580, y2: 770, card: '1', cpos: { x: 1600, y: 715 } }
    ]
  },
  // User (1) --- <Records> --- (N) DailyHealthLog
  {
    name: 'Records',
    cx: 1220,
    cy: 472.5,
    rx: 75,
    ry: 40,
    lines: [
      { x1: 1470, y1: 472.5, x2: 1295, y2: 472.5, card: '1', cpos: { x: 1380, y: 460 } },
      { x1: 1145, y1: 472.5, x2: 990, y2: 472.5, card: 'N', cpos: { x: 1060, y: 460 } }
    ]
  },
  // User (1) --- <Undergoes> --- (N) DoshaAssessment
  {
    name: 'Undergoes',
    cx: 1950,
    cy: 472.5,
    rx: 85,
    ry: 40,
    lines: [
      { x1: 1690, y1: 472.5, x2: 1865, y2: 472.5, card: '1', cpos: { x: 1780, y: 460 } },
      { x1: 2035, y1: 472.5, x2: 2210, y2: 472.5, card: 'N', cpos: { x: 2120, y: 460 } }
    ]
  },
  // User (1) --- <Sets> --- (N) Reminder
  {
    name: 'Sets',
    cx: 1220,
    cy: 802.5,
    rx: 65,
    ry: 40,
    lines: [
      // user down to Y=680, then to diamond, or from UserProfile
      { x1: 1450, y1: 802.5, x2: 1285, y2: 802.5, card: '1', cpos: { x: 1370, y: 790 } },
      { x1: 1155, y1: 802.5, x2: 980, y2: 802.5, card: 'N', cpos: { x: 1070, y: 790 } }
    ]
  },
  // UserProfile (1) --- <Tracks> --- (1) WomensHealth
  {
    name: 'Tracks',
    cx: 1950,
    cy: 802.5,
    rx: 75,
    ry: 40,
    lines: [
      { x1: 1710, y1: 802.5, x2: 1875, y2: 802.5, card: '1', cpos: { x: 1790, y: 790 } },
      { x1: 2025, y1: 802.5, x2: 2210, y2: 802.5, card: '1', cpos: { x: 2120, y: 790 } }
    ]
  },
  // UserProfile (1) --- <Receives> --- (N) MealPlan
  {
    name: 'Receives',
    cx: 1580,
    cy: 985,
    rx: 80,
    ry: 42,
    lines: [
      { x1: 1580, y1: 835, x2: 1580, y2: 943, card: '1', cpos: { x: 1600, y: 885 } },
      { x1: 1580, y1: 1027, x2: 1580, y2: 1150, card: 'N', cpos: { x: 1600, y: 1090 } }
    ]
  },
  // MealPlan (M) --- <Includes> --- (N) Recipe
  {
    name: 'Includes',
    cx: 1220,
    cy: 1350,
    rx: 80,
    ry: 42,
    lines: [
      { x1: 1480, y1: 1215, x2: 1275, y2: 1320, card: 'M', cpos: { x: 1390, y: 1250 } },
      { x1: 1165, y1: 1380, x2: 950, y2: 1500, card: 'N', cpos: { x: 1050, y: 1450 } }
    ],
    // Descriptive attributes on relationship
    relAttrs: [
      { name: 'day_of_week', cx: 1220, cy: 1235, rx: 65, ry: 24 },
      { name: 'meal_type', cx: 1080, cy: 1280, rx: 55, ry: 24 },
      { name: 'portion_grams', cx: 1040, cy: 1350, rx: 65, ry: 24 }
    ]
  },
  // MealPlan (M) --- <Recommends> --- (N) FoodItem
  {
    name: 'Recommends',
    cx: 1950,
    cy: 1350,
    rx: 90,
    ry: 42,
    lines: [
      { x1: 1680, y1: 1215, x2: 1890, y2: 1320, card: 'M', cpos: { x: 1770, y: 1250 } },
      { x1: 2010, y1: 1380, x2: 2240, y2: 1500, card: 'N', cpos: { x: 2130, y: 1450 } }
    ]
  },
  // Recipe (M) --- <Composed_Of> --- (N) FoodItem
  {
    name: 'Composed_Of',
    cx: 1580,
    cy: 1532.5,
    rx: 100,
    ry: 42,
    lines: [
      { x1: 980, y1: 1532.5, x2: 1480, y2: 1532.5, card: 'M', cpos: { x: 1230, y: 1515 } },
      { x1: 1680, y1: 1532.5, x2: 2220, y2: 1532.5, card: 'N', cpos: { x: 1950, y: 1515 } }
    ]
  },
  // FoodItem (M) --- <Viruddha> --- (N) FoodItem (Recursive Relationship)
  {
    name: 'Viruddha',
    cx: 2340,
    cy: 1840,
    rx: 80,
    ry: 42,
    lines: [
      // From bottom-left of FoodItem to left of diamond
      { x1: 2280, y1: 1565, x2: 2280, y2: 1840, card: '', cpos: null },
      { x1: 2280, y1: 1840, x2: 2260, y2: 1840, card: 'food_a (M)', cpos: { x: 2210, y: 1780 } },
      // From right of diamond to bottom-right of FoodItem
      { x1: 2420, y1: 1840, x2: 2440, y2: 1840, card: '', cpos: null },
      { x1: 2440, y1: 1840, x2: 2440, y2: 1565, card: 'food_b (N)', cpos: { x: 2490, y: 1780 } }
    ],
    relAttrs: [
      { name: 'incompatibility', cx: 2150, cy: 1950, rx: 75, ry: 24 },
      { name: 'hazard_reason', cx: 2340, cy: 1970, rx: 70, ry: 24 },
      { name: 'antidote', cx: 2520, cy: 1950, rx: 55, ry: 24 }
    ]
  }
];

// Attributes for each entity
const entityAttributes = [
  // User
  {
    entityId: 'User',
    attachPoint: { x: 1580, y: 440 },
    attrs: [
      { name: 'id', cx: 1580, cy: 260, rx: 45, ry: 24, isKey: true },
      { name: 'email', cx: 1420, cy: 280, rx: 55, ry: 24, isKey: true },
      { name: 'password', cx: 1260, cy: 330, rx: 65, ry: 24 },
      { name: 'full_name', cx: 1740, cy: 280, rx: 65, ry: 24 },
      { name: 'role', cx: 1900, cy: 330, rx: 50, ry: 24 },
      { name: 'active', cx: 1340, cy: 380, rx: 50, ry: 24 },
      { name: 'created_at', cx: 1820, cy: 380, rx: 65, ry: 24 }
    ]
  },
  // UserProfile
  {
    entityId: 'UserProfile',
    attachPoint: { x: 1580, y: 802.5 },
    attrs: [
      { name: 'profile_id', cx: 1350, cy: 720, rx: 65, ry: 24, isKey: true },
      { name: 'age', cx: 1410, cy: 890, rx: 45, ry: 24 },
      { name: 'gender', cx: 1490, cy: 920, rx: 50, ry: 24 },
      { name: 'height', cx: 1580, cy: 920, rx: 50, ry: 24 },
      { name: 'weight', cx: 1670, cy: 920, rx: 50, ry: 24 },
      { name: 'primary_dosha', cx: 1750, cy: 890, rx: 70, ry: 24 },
      { name: 'agni_type', cx: 1810, cy: 720, rx: 60, ry: 24 },
      { name: 'budget_per_day', cx: 1780, cy: 650, rx: 75, ry: 24 },
      { name: 'health_goal', cx: 1380, cy: 650, rx: 65, ry: 24 }
    ]
  },
  // DailyHealthLog
  {
    entityId: 'DailyHealthLog',
    attachPoint: { x: 865, y: 440 },
    attrs: [
      { name: 'log_id', cx: 865, cy: 260, rx: 50, ry: 24, isKey: true },
      { name: 'log_date', cx: 720, cy: 280, rx: 55, ry: 24 },
      { name: 'calories', cx: 1010, cy: 280, rx: 55, ry: 24 },
      { name: 'water_intake', cx: 580, cy: 340, rx: 65, ry: 24 },
      { name: 'energy_rating', cx: 540, cy: 420, rx: 70, ry: 24 },
      { name: 'sleep_hours', cx: 540, cy: 510, rx: 65, ry: 24 },
      { name: 'digestion_quality', cx: 600, cy: 590, rx: 85, ry: 24 },
      { name: 'ayur_score', cx: 770, cy: 600, rx: 60, ry: 24 }
    ]
  },
  // DoshaAssessment
  {
    entityId: 'DoshaAssessment',
    attachPoint: { x: 2340, y: 440 },
    attrs: [
      { name: 'assessment_id', cx: 2340, cy: 260, rx: 75, ry: 24, isKey: true },
      { name: 'vata_score', cx: 2170, cy: 280, rx: 60, ry: 24 },
      { name: 'pitta_score', cx: 2510, cy: 280, rx: 60, ry: 24 },
      { name: 'kapha_score', cx: 2660, cy: 340, rx: 65, ry: 24 },
      { name: 'primary_prakriti', cx: 2680, cy: 430, rx: 80, ry: 24 },
      { name: 'secondary_prakriti', cx: 2680, cy: 520, rx: 85, ry: 24 },
      { name: 'assessed_at', cx: 2530, cy: 590, rx: 65, ry: 24 }
    ]
  },
  // Reminder
  {
    entityId: 'Reminder',
    attachPoint: { x: 865, y: 802.5 },
    attrs: [
      { name: 'reminder_id', cx: 680, cy: 720, rx: 65, ry: 24, isKey: true },
      { name: 'title', cx: 620, cy: 790, rx: 50, ry: 24 },
      { name: 'time', cx: 640, cy: 870, rx: 45, ry: 24 },
      { name: 'category', cx: 740, cy: 930, rx: 55, ry: 24 },
      { name: 'enabled', cx: 865, cy: 940, rx: 50, ry: 24 }
    ]
  },
  // WomensHealthProfile
  {
    entityId: 'WomensHealthProfile',
    attachPoint: { x: 2340, y: 802.5 },
    attrs: [
      { name: 'wh_id', cx: 2510, cy: 710, rx: 50, ry: 24, isKey: true },
      { name: 'health_stage', cx: 2630, cy: 770, rx: 65, ry: 24 },
      { name: 'cycle_phase', cx: 2640, cy: 840, rx: 60, ry: 24 },
      { name: 'last_period_date', cx: 2560, cy: 910, rx: 80, ry: 24 },
      { name: 'cycle_length', cx: 2410, cy: 940, rx: 65, ry: 24 },
      { name: 'iron_target', cx: 2250, cy: 940, rx: 60, ry: 24 }
    ]
  },
  // MealPlan
  {
    entityId: 'MealPlan',
    attachPoint: { x: 1580, y: 1182.5 },
    attrs: [
      { name: 'plan_id', cx: 1360, cy: 1090, rx: 55, ry: 24, isKey: true },
      { name: 'plan_name', cx: 1320, cy: 1160, rx: 60, ry: 24 },
      { name: 'disease', cx: 1350, cy: 1240, rx: 55, ry: 24 },
      { name: 'season', cx: 1800, cy: 1090, rx: 50, ry: 24 },
      { name: 'daily_budget', cx: 1840, cy: 1160, rx: 65, ry: 24 },
      { name: 'total_calories', cx: 1820, cy: 1240, rx: 70, ry: 24 },
      { name: 'nutrition_score', cx: 1580, cy: 1290, rx: 75, ry: 24 }
    ]
  },
  // Recipe
  {
    entityId: 'Recipe',
    attachPoint: { x: 865, y: 1532.5 },
    attrs: [
      { name: 'recipe_id', cx: 865, cy: 1380, rx: 60, ry: 24, isKey: true },
      { name: 'title', cx: 680, cy: 1410, rx: 50, ry: 24 },
      { name: 'suitable_dosha', cx: 580, cy: 1480, rx: 75, ry: 24, isMultiValued: true },
      { name: 'prep_time', cx: 560, cy: 1560, rx: 55, ry: 24 },
      { name: 'cost', cx: 620, cy: 1640, rx: 45, ry: 24 },
      { name: 'calories', cx: 740, cy: 1690, rx: 55, ry: 24 },
      { name: 'instructions', cx: 890, cy: 1690, rx: 65, ry: 24 }
    ]
  },
  // FoodItem
  {
    entityId: 'FoodItem',
    attachPoint: { x: 2340, y: 1532.5 },
    attrs: [
      { name: 'food_id', cx: 2340, cy: 1380, rx: 55, ry: 24, isKey: true },
      { name: 'name', cx: 2520, cy: 1410, rx: 50, ry: 24 },
      { name: 'rasa', cx: 2630, cy: 1470, rx: 45, ry: 24 },
      { name: 'virya', cx: 2650, cy: 1540, rx: 45, ry: 24 },
      { name: 'vipaka', cx: 2610, cy: 1620, rx: 50, ry: 24 },
      { name: 'dosha_effect', cx: 2530, cy: 1690, rx: 65, ry: 24 },
      { name: 'cost', cx: 2400, cy: 1710, rx: 45, ry: 24 }
    ]
  }
];

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<style>
  text {
    user-select: none;
  }
</style>

<!-- Clean White Background -->
<rect width="${W}" height="${H}" fill="#FFFFFF" />

<!-- Outer Notebook Page Border -->
<rect x="30" y="30" width="${W - 60}" height="${H - 60}" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" />

<!-- Header Title block matching hand-drawn practical notebook -->
<g id="header_title">
  <!-- Title Box -->
  <text x="70" y="85" font-family="'Courier New', Courier, monospace, 'Segoe UI', Arial" font-size="28" font-weight="bold" fill="#000000">Aim: Entity-Relationship (ER) Diagram for AyurWell Healthcare System</text>
  <text x="70" y="118" font-family="'Courier New', Courier, monospace, 'Segoe UI', Arial" font-size="16" fill="#333333">Standard Peter Chen Notation — Entities (Rectangles), Relationships (Diamonds), Attributes (Ovals)</text>
  <line x1="70" y1="135" x2="${W - 70}" y2="135" stroke="#000000" stroke-width="1.8" />
</g>
`;

// Draw Attribute connecting lines first
svg += `\n<!-- Attribute Connector Lines -->\n<g id="attr_lines">\n`;
for (const eg of entityAttributes) {
  for (const a of eg.attrs) {
    svg += `  <line x1="${eg.attachPoint.x}" y1="${eg.attachPoint.y}" x2="${a.cx}" y2="${a.cy}" stroke="#000000" stroke-width="1.4" />\n`;
  }
}
// Relationship attribute lines
for (const rel of relationships) {
  if (rel.relAttrs) {
    for (const ra of rel.relAttrs) {
      svg += `  <line x1="${rel.cx}" y1="${rel.cy}" x2="${ra.cx}" y2="${ra.cy}" stroke="#000000" stroke-width="1.4" stroke-dasharray="4,3" />\n`;
    }
  }
}
svg += `</g>\n`;

// Draw Relationship lines
svg += `\n<!-- Relationship Connecting Lines -->\n<g id="rel_lines">\n`;
for (const rel of relationships) {
  for (const l of rel.lines) {
    svg += drawLine(l.x1, l.y1, l.x2, l.y2, l.card, l.cpos);
  }
}
svg += `</g>\n`;

// Draw Entities (Rectangles)
svg += `\n<!-- Entity Rectangles -->\n<g id="entities">\n`;
for (const ent of entities) {
  svg += drawEntity(ent.x, ent.y, ent.w, ent.h, ent.name);
}
svg += `</g>\n`;

// Draw Relationships (Diamonds)
svg += `\n<!-- Relationship Diamonds -->\n<g id="diamonds">\n`;
for (const rel of relationships) {
  svg += drawDiamond(rel.cx, rel.cy, rel.rx, rel.ry, rel.name);
}
svg += `</g>\n`;

// Draw Entity Attributes (Ovals)
svg += `\n<!-- Entity Attributes (Ovals) -->\n<g id="attributes">\n`;
for (const eg of entityAttributes) {
  for (const a of eg.attrs) {
    svg += drawAttribute(a.cx, a.cy, a.rx, a.ry, a.name, a.isKey, a.isMultiValued);
  }
}
// Draw Relationship Attributes
for (const rel of relationships) {
  if (rel.relAttrs) {
    for (const ra of rel.relAttrs) {
      svg += drawAttribute(ra.cx, ra.cy, ra.rx, ra.ry, ra.name, false, false);
    }
  }
}
svg += `</g>\n`;

// Draw Chen Notation Legend Box at Bottom Left
const legX = 80;
const legY = 1880;
const legW = 540;
const legH = 420;

svg += `\n<!-- Chen Notation Legend -->
<g id="chen_legend">
  <rect x="${legX}" y="${legY}" width="${legW}" height="${legH}" rx="4" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
  <text x="${legX + 20}" y="${legY + 36}" font-family="'Courier New', Courier, monospace, 'Segoe UI', Arial" font-size="20" font-weight="bold" fill="#000000">NOTATION LEGEND (Chen Model)</text>
  <line x1="${legX}" y1="${legY + 50}" x2="${legX + legW}" y2="${legY + 50}" stroke="#000000" stroke-width="1.5" />

  <!-- Entity: Rectangle -->
  <rect x="${legX + 30}" y="${legY + 75}" width="100" height="35" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
  <text x="${legX + 80}" y="${legY + 98}" font-family="'Courier New', Courier, monospace, Arial" font-size="14" font-weight="bold" text-anchor="middle">Entity</text>
  <text x="${legX + 160}" y="${legY + 98}" font-family="'Courier New', Courier, monospace, Arial" font-size="15">Rectangle: Primary Entity</text>

  <!-- Relationship: Diamond -->
  <polygon points="${legX + 80},${legY + 130} ${legX + 130},${legY + 150} ${legX + 80},${legY + 170} ${legX + 30},${legY + 150}" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
  <text x="${legX + 80}" y="${legY + 155}" font-family="'Courier New', Courier, monospace, Arial" font-size="12" font-weight="bold" font-style="italic" text-anchor="middle">Rel</text>
  <text x="${legX + 160}" y="${legY + 155}" font-family="'Courier New', Courier, monospace, Arial" font-size="15">Diamond: Relationship</text>

  <!-- Attribute: Oval -->
  <ellipse cx="${legX + 80}" cy="${legY + 205}" rx="50" ry="18" fill="#FFFFFF" stroke="#000000" stroke-width="1.8" />
  <text x="${legX + 80}" y="${legY + 210}" font-family="'Courier New', Courier, monospace, Arial" font-size="13" text-anchor="middle">Attr</text>
  <text x="${legX + 160}" y="${legY + 210}" font-family="'Courier New', Courier, monospace, Arial" font-size="15">Oval: Standard Attribute</text>

  <!-- Key Attribute: Underlined Oval -->
  <ellipse cx="${legX + 80}" cy="${legY + 260}" rx="50" ry="18" fill="#FFFFFF" stroke="#000000" stroke-width="1.8" />
  <text x="${legX + 80}" y="${legY + 265}" font-family="'Courier New', Courier, monospace, Arial" font-size="13" font-weight="bold" text-decoration="underline" text-anchor="middle">Key</text>
  <text x="${legX + 160}" y="${legY + 265}" font-family="'Courier New', Courier, monospace, Arial" font-size="15">Underline: Primary Key (PK)</text>

  <!-- Multivalued Attribute: Double Oval -->
  <ellipse cx="${legX + 80}" cy="${legY + 315}" rx="50" ry="18" fill="#FFFFFF" stroke="#000000" stroke-width="1.8" />
  <ellipse cx="${legX + 80}" cy="${legY + 315}" rx="44" ry="14" fill="#FFFFFF" stroke="#000000" stroke-width="1.2" />
  <text x="${legX + 80}" y="${legY + 320}" font-family="'Courier New', Courier, monospace, Arial" font-size="12" text-anchor="middle">Multi</text>
  <text x="${legX + 160}" y="${legY + 320}" font-family="'Courier New', Courier, monospace, Arial" font-size="15">Double Oval: Multi-valued Attr</text>

  <!-- Cardinality Line -->
  <line x1="${legX + 40}" y1="${legY + 375}" x2="${legX + 120}" y2="${legY + 375}" stroke="#000000" stroke-width="2" />
  <text x="${legX + 50}" y="${legY + 368}" font-family="'Courier New', Courier, monospace, Arial" font-size="14" font-weight="bold">1</text>
  <text x="${legX + 110}" y="${legY + 368}" font-family="'Courier New', Courier, monospace, Arial" font-size="14" font-weight="bold">N</text>
  <text x="${legX + 160}" y="${legY + 375}" font-family="'Courier New', Courier, monospace, Arial" font-size="15">Numbers/Letters: Cardinality Ratio</text>
</g>
`;

svg += `</svg>`;

// Write SVG and render PNG
const outSvg = path.join(__dirname, 'ayurwell_chen_erd.svg');
const outPng = path.join(__dirname, 'ayurwell_chen_erd.png');
const outHtml = path.join(__dirname, 'ayurwell_chen_erd.html');

fs.writeFileSync(outSvg, svg, 'utf8');
console.log(`Saved Chen ERD SVG to ${outSvg}`);

try {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 3600 }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.writeFileSync(outPng, pngBuffer);
  console.log(`Saved Chen ERD PNG (${pngBuffer.length} bytes) to ${outPng}`);

  // Copy to Artifact directory
  const artifactDir = path.join('C:', 'Users', 'dubey', '.gemini', 'antigravity-ide', 'brain', '4355294f-e04a-4d18-be9d-696a72e71e5d');
  if (fs.existsSync(artifactDir)) {
    fs.writeFileSync(path.join(artifactDir, 'ayurwell_chen_erd.png'), pngBuffer);
    fs.writeFileSync(path.join(artifactDir, 'ayurwell_chen_erd.svg'), svg, 'utf8');
    console.log(`Copied Chen ERD to artifact directory`);
  }
} catch (err) {
  console.error('Failed to render PNG:', err);
}

// Generate HTML preview
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AyurWell — Chen ER Diagram</title>
  <style>
    body {
      margin: 0;
      padding: 30px;
      background: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .header-bar {
      width: 100%;
      max-width: 1400px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
      font-size: 24px;
      color: #1a202c;
    }
    .canvas-container {
      background: #ffffff;
      padding: 30px;
      border-radius: 6px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      max-width: 98vw;
      overflow: auto;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <h1>AyurWell — Classical Peter Chen ER Diagram</h1>
    <span>Entities • Relationships • Attribute Ovals • Keys Underlined</span>
  </div>
  <div class="canvas-container">
    <img src="ayurwell_chen_erd.png" alt="AyurWell Chen ER Diagram" />
  </div>
</body>
</html>`;

fs.writeFileSync(outHtml, html, 'utf8');
console.log(`Saved HTML to ${outHtml}`);
