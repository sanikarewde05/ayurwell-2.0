const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// Canvas Dimensions
const W = 2600;
const H = 2200;

// All 15 AyurWell Tables
const tables = [
  {
    id: 'USERS',
    title: 'USERS',
    x: 1160,
    y: 110,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: '',   name: 'email', type: 'String' },
      { key: '',   name: 'password', type: 'String' },
      { key: '',   name: 'full_name', type: 'String' },
      { key: '',   name: 'role', type: 'String' },
      { key: '',   name: 'active', type: 'Boolean' },
      { key: '',   name: 'email_verified', type: 'Boolean' },
      { key: '',   name: 'created_at', type: 'DateTime' }
    ]
  },
  {
    id: 'EMAIL_OTPS',
    title: 'EMAIL_OTPS',
    x: 680,
    y: 110,
    w: 260,
    colDivX: 165,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: '',   name: 'email', type: 'String' },
      { key: '',   name: 'otp_hash', type: 'String' },
      { key: '',   name: 'expires_at', type: 'DateTime' },
      { key: '',   name: 'verified', type: 'Boolean' },
      { key: '',   name: 'attempts', type: 'Integer' },
      { key: '',   name: 'created_at', type: 'DateTime' }
    ]
  },
  {
    id: 'DOSHA_ASSESSMENTS',
    title: 'DOSHA_ASSESSMENTS',
    x: 1660,
    y: 110,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'user_id', type: 'Integer' },
      { key: '',   name: 'vata_score', type: 'Integer' },
      { key: '',   name: 'pitta_score', type: 'Integer' },
      { key: '',   name: 'kapha_score', type: 'Integer' },
      { key: '',   name: 'primary_prakriti', type: 'String' },
      { key: '',   name: 'secondary_prakriti', type: 'String' },
      { key: '',   name: 'assessed_at', type: 'DateTime' }
    ]
  },
  {
    id: 'USER_PROFILES',
    title: 'USER_PROFILES',
    x: 1160,
    y: 430,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'user_id', type: 'Integer' },
      { key: '',   name: 'age', type: 'Integer' },
      { key: '',   name: 'gender', type: 'String' },
      { key: '',   name: 'height_cm', type: 'Float' },
      { key: '',   name: 'weight_kg', type: 'Float' },
      { key: '',   name: 'activity_level', type: 'String' },
      { key: '',   name: 'budget_per_day', type: 'Float' },
      { key: '',   name: 'health_goal', type: 'String' },
      { key: '',   name: 'primary_dosha', type: 'String' },
      { key: '',   name: 'digestive_fire', type: 'String' },
      { key: '',   name: 'target_disease', type: 'String' },
      { key: '',   name: 'profile_done', type: 'Boolean' }
    ]
  },
  {
    id: 'DAILY_HEALTH_LOGS',
    title: 'DAILY_HEALTH_LOGS',
    x: 200,
    y: 460,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'user_id', type: 'Integer' },
      { key: '',   name: 'log_date', type: 'Date' },
      { key: '',   name: 'calories_consumed', type: 'Float' },
      { key: '',   name: 'water_intake_l', type: 'Float' },
      { key: '',   name: 'energy_rating', type: 'Integer' },
      { key: '',   name: 'digestion_quality', type: 'Integer' },
      { key: '',   name: 'ayur_score', type: 'Integer' },
      { key: '',   name: 'iron_intake_mg', type: 'Float' },
      { key: '',   name: 'calcium_intake_mg', type: 'Float' }
    ]
  },
  {
    id: 'REMINDERS',
    title: 'REMINDERS',
    x: 680,
    y: 490,
    w: 260,
    colDivX: 165,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'user_id', type: 'Integer' },
      { key: '',   name: 'title', type: 'String' },
      { key: '',   name: 'reminder_time', type: 'Time' },
      { key: '',   name: 'category', type: 'String' },
      { key: '',   name: 'description', type: 'String' },
      { key: '',   name: 'enabled', type: 'Boolean' }
    ]
  },
  {
    id: 'WOMENS_HEALTH_PROFILES',
    title: 'WOMENS_HEALTH_PROFILES',
    x: 1660,
    y: 440,
    w: 290,
    colDivX: 190,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'user_id', type: 'Integer' },
      { key: '',   name: 'health_stage', type: 'String' },
      { key: '',   name: 'pregnancy_trimester', type: 'Integer' },
      { key: '',   name: 'cycle_phase', type: 'String' },
      { key: '',   name: 'last_period_date', type: 'Date' },
      { key: '',   name: 'cycle_length', type: 'Integer' },
      { key: '',   name: 'flow_level', type: 'String' },
      { key: '',   name: 'cramps_severity', type: 'String' },
      { key: '',   name: 'mood', type: 'String' },
      { key: '',   name: 'iron_target_mg', type: 'Float' },
      { key: '',   name: 'iron_intake_mg', type: 'Float' }
    ]
  },
  {
    id: 'WOMENS_HEALTH_LOGS',
    title: 'WOMENS_HEALTH_LOGS',
    x: 2130,
    y: 450,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'user_id', type: 'Integer' },
      { key: '',   name: 'log_date', type: 'Date' },
      { key: '',   name: 'log_type', type: 'String' },
      { key: '',   name: 'flow_level', type: 'String' },
      { key: '',   name: 'cramps_severity', type: 'String' },
      { key: '',   name: 'mood', type: 'String' },
      { key: '',   name: 'energy', type: 'String' },
      { key: '',   name: 'iron_intake_mg', type: 'Float' },
      { key: '',   name: 'sleep_hours', type: 'Integer' },
      { key: '',   name: 'wellness_score', type: 'Integer' }
    ]
  },
  {
    id: 'MEAL_PLANS',
    title: 'MEAL_PLANS',
    x: 1160,
    y: 890,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'user_id', type: 'Integer' },
      { key: '',   name: 'plan_name', type: 'String' },
      { key: '',   name: 'target_disease', type: 'String' },
      { key: '',   name: 'season', type: 'String' },
      { key: '',   name: 'health_stage', type: 'String' },
      { key: '',   name: 'daily_budget', type: 'Float' },
      { key: '',   name: 'total_calories', type: 'Float' },
      { key: '',   name: 'nutrition_score', type: 'Integer' },
      { key: '',   name: 'created_at', type: 'DateTime' }
    ]
  },
  {
    id: 'MEAL_PLAN_ITEMS',
    title: 'MEAL_PLAN_ITEMS',
    x: 1160,
    y: 1280,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'meal_plan_id', type: 'Integer' },
      { key: '',   name: 'meal_type', type: 'String' },
      { key: '',   name: 'day_of_week', type: 'String' },
      { key: 'FK', name: 'recipe_id', type: 'Integer' },
      { key: 'FK', name: 'food_item_id', type: 'Integer' },
      { key: '',   name: 'portion_grams', type: 'Float' },
      { key: '',   name: 'item_cost_inr', type: 'Float' },
      { key: '',   name: 'item_calories', type: 'Float' }
    ]
  },
  {
    id: 'RECIPES',
    title: 'RECIPES',
    x: 680,
    y: 1240,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: '',   name: 'title', type: 'String' },
      { key: '',   name: 'description', type: 'String' },
      { key: '',   name: 'meal_type', type: 'String' },
      { key: '',   name: 'suitable_dosha', type: 'String' },
      { key: '',   name: 'suitable_season', type: 'String' },
      { key: '',   name: 'prep_time_mins', type: 'Integer' },
      { key: '',   name: 'cost_serving', type: 'Float' },
      { key: '',   name: 'calories', type: 'Float' },
      { key: '',   name: 'protein_grams', type: 'Float' },
      { key: '',   name: 'carbs_grams', type: 'Float' },
      { key: '',   name: 'fat_grams', type: 'Float' },
      { key: '',   name: 'instructions', type: 'Text' }
    ]
  },
  {
    id: 'FOOD_ITEMS',
    title: 'FOOD_ITEMS',
    x: 1660,
    y: 1240,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: '',   name: 'name', type: 'String' },
      { key: '',   name: 'category', type: 'String' },
      { key: '',   name: 'rasa', type: 'String' },
      { key: '',   name: 'virya', type: 'String' },
      { key: '',   name: 'vipaka', type: 'String' },
      { key: '',   name: 'dosha_effect', type: 'String' },
      { key: '',   name: 'calories', type: 'Float' },
      { key: '',   name: 'protein_grams', type: 'Float' },
      { key: '',   name: 'carbs_grams', type: 'Float' },
      { key: '',   name: 'fat_grams', type: 'Float' },
      { key: '',   name: 'iron_mg', type: 'Float' },
      { key: '',   name: 'estimated_cost', type: 'Float' }
    ]
  },
  {
    id: 'VIRUDDHA_COMBINATIONS',
    title: 'VIRUDDHA_COMBINATIONS',
    x: 2130,
    y: 1300,
    w: 280,
    colDivX: 180,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'food_a_id', type: 'Integer' },
      { key: 'FK', name: 'food_b_id', type: 'Integer' },
      { key: '',   name: 'incompatibility', type: 'String' },
      { key: '',   name: 'hazard_reason', type: 'String' },
      { key: '',   name: 'antidote', type: 'String' }
    ]
  },
  {
    id: 'RAW_FOOD_COMPOSITION',
    title: 'RAW_FOOD_COMPOSITION',
    x: 200,
    y: 1720,
    w: 290,
    colDivX: 190,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: '',   name: 'food_code', type: 'String' },
      { key: '',   name: 'food_name', type: 'String' },
      { key: '',   name: 'category', type: 'String' },
      { key: '',   name: 'energy_kcal', type: 'Float' },
      { key: '',   name: 'protein_grams', type: 'Float' },
      { key: '',   name: 'carbs_grams', type: 'Float' },
      { key: '',   name: 'fat_grams', type: 'Float' },
      { key: '',   name: 'fiber_grams', type: 'Float' },
      { key: '',   name: 'iron_mg', type: 'Float' },
      { key: '',   name: 'calcium_mg', type: 'Float' },
      { key: '',   name: 'vitamin_c_mg', type: 'Float' }
    ]
  },
  {
    id: 'AYURVEDIC_FOOD_PROFILES',
    title: 'AYURVEDIC_FOOD_PROFILES',
    x: 680,
    y: 1740,
    w: 290,
    colDivX: 190,
    fields: [
      { key: 'PK', name: 'id', type: 'Integer' },
      { key: 'FK', name: 'raw_food_id', type: 'Integer' },
      { key: '',   name: 'sanskrit_name', type: 'String' },
      { key: '',   name: 'rasa', type: 'String' },
      { key: '',   name: 'virya', type: 'String' },
      { key: '',   name: 'vipaka', type: 'String' },
      { key: '',   name: 'dosha_effect', type: 'String' },
      { key: '',   name: 'suitable_ritus', type: 'String' },
      { key: '',   name: 'classical_text', type: 'String' }
    ]
  }
];

// Helper to compute table height
tables.forEach(t => {
  t.h = 30 + t.fields.length * 20 + 8;
});

// Relationships with clean routing through open gutters
const relationships = [
  // USERS -> USER_PROFILES (Central Direct Spine)
  {
    type: 'solid',
    label: 'user_id',
    path: 'M 1300,306 L 1300,430',
    labelPos: { x: 1300, y: 368 }
  },
  // USERS -> EMAIL_OTPS (Direct Horizontal)
  {
    type: 'solid',
    label: 'email',
    path: 'M 1160,180 L 940,180',
    labelPos: { x: 1050, y: 180 }
  },
  // USERS -> DOSHA_ASSESSMENTS (Direct Horizontal)
  {
    type: 'solid',
    label: 'user_id',
    path: 'M 1440,180 L 1660,180',
    labelPos: { x: 1550, y: 180 }
  },
  // USERS -> DAILY_HEALTH_LOGS (Routes cleanly via open Y=360 gutter)
  {
    type: 'solid',
    label: 'logs',
    path: 'M 1210,306 L 1210,360 L 340,360 L 340,460',
    labelPos: { x: 520, y: 360 }
  },
  // USERS -> REMINDERS (Routes cleanly via open Y=390 gutter)
  {
    type: 'solid',
    label: 'sets',
    path: 'M 1250,306 L 1250,390 L 810,390 L 810,490',
    labelPos: { x: 980, y: 390 }
  },
  // USER_PROFILES -> WOMENS_HEALTH_PROFILES (Direct Horizontal)
  {
    type: 'solid',
    label: 'profiles',
    path: 'M 1440,540 L 1660,540',
    labelPos: { x: 1550, y: 540 }
  },
  // WOMENS_HEALTH_PROFILES -> WOMENS_HEALTH_LOGS (Direct Horizontal)
  {
    type: 'solid',
    label: 'tracks',
    path: 'M 1950,540 L 2130,540',
    labelPos: { x: 2040, y: 540 }
  },
  // USER_PROFILES -> MEAL_PLANS (Central Direct Spine)
  {
    type: 'solid',
    label: 'manages',
    path: 'M 1300,726 L 1300,890',
    labelPos: { x: 1300, y: 808 }
  },
  // MEAL_PLANS -> MEAL_PLAN_ITEMS (Central Direct Spine)
  {
    type: 'solid',
    label: 'contains',
    path: 'M 1300,1126 L 1300,1280',
    labelPos: { x: 1300, y: 1203 }
  },
  // MEAL_PLAN_ITEMS -> RECIPES (Direct Horizontal)
  {
    type: 'dashed',
    label: 'recipe_id',
    path: 'M 1160,1380 L 960,1380',
    labelPos: { x: 1060, y: 1380 }
  },
  // MEAL_PLAN_ITEMS -> FOOD_ITEMS (Direct Horizontal)
  {
    type: 'dashed',
    label: 'food_item_id',
    path: 'M 1440,1380 L 1660,1380',
    labelPos: { x: 1550, y: 1380 }
  },
  // FOOD_ITEMS -> VIRUDDHA_COMBINATIONS (Direct Horizontal)
  {
    type: 'dashed',
    label: 'food_a / food_b',
    path: 'M 1940,1380 L 2130,1380',
    labelPos: { x: 2035, y: 1380 }
  },
  // RAW_FOOD_COMPOSITION -> AYURVEDIC_FOOD_PROFILES (Direct Horizontal)
  {
    type: 'solid',
    label: 'raw_food_id',
    path: 'M 490,1850 L 680,1850',
    labelPos: { x: 585, y: 1850 }
  },
  // AYURVEDIC_FOOD_PROFILES -> FOOD_ITEMS (Clean L-connector into Food Items base)
  {
    type: 'dashed',
    label: 'classifies',
    path: 'M 970,1850 L 1800,1850 L 1800,1544',
    labelPos: { x: 1385, y: 1850 }
  }
];

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <!-- Direct Solid Arrowhead -->
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#000000" />
  </marker>
</defs>

<!-- Crisp Clean White Canvas -->
<rect width="${W}" height="${H}" fill="#FFFFFF" />

<!-- Top Title matching reference image -->
<g id="diagram_title">
  <text x="60" y="65" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="bold" fill="#3b4d3c">Entity Relationship diagram</text>
  <line x1="60" y1="78" x2="440" y2="78" stroke="#3b4d3c" stroke-width="2" />
</g>
`;

// Draw Relationships first so they are behind labels
svg += `\n<!-- Relationship Connecting Lines -->\n<g id="relationships">\n`;
for (const rel of relationships) {
  const dash = rel.type === 'dashed' ? 'stroke-dasharray="6,5"' : '';
  svg += `  <path d="${rel.path}" stroke="#000000" stroke-width="1.5" ${dash} fill="none" marker-end="url(#arrow)" />\n`;
}
svg += `</g>\n`;

// Draw Relationship Labels with crisp white backdrops
svg += `\n<!-- Relationship Labels -->\n<g id="relationship_labels">\n`;
for (const rel of relationships) {
  if (rel.label && rel.labelPos) {
    const textLen = rel.label.length * 7.5 + 16;
    const boxX = rel.labelPos.x - textLen / 2;
    const boxY = rel.labelPos.y - 10;
    svg += `  <rect x="${boxX}" y="${boxY}" width="${textLen}" height="20" fill="#FFFFFF" stroke="#000000" stroke-width="0.8" rx="2" />\n`;
    svg += `  <text x="${rel.labelPos.x}" y="${rel.labelPos.y + 4}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">${escapeXml(rel.label)}</text>\n`;
  }
}
svg += `</g>\n`;

// Draw Tables
svg += `\n<!-- Entity Table Boxes -->\n<g id="entity_tables">\n`;
for (const t of tables) {
  svg += `  <!-- Table: ${t.title} -->\n`;
  svg += `  <g id="table_${t.id}">\n`;
  
  // Outer Box
  svg += `    <rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" fill="#FFFFFF" stroke="#000000" stroke-width="1.8" />\n`;
  
  // Header Box
  svg += `    <rect x="${t.x}" y="${t.y}" width="${t.w}" height="30" fill="#FFFFFF" stroke="none" />\n`;
  svg += `    <text x="${t.x + t.w / 2}" y="${t.y + 20}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">${t.title}</text>\n`;
  svg += `    <line x1="${t.x}" y1="${t.y + 30}" x2="${t.x + t.w}" y2="${t.y + 30}" stroke="#000000" stroke-width="1.5" />\n`;

  // Vertical Column Divider line inside table
  const colX = t.x + t.colDivX;
  svg += `    <line x1="${colX}" y1="${t.y + 30}" x2="${colX}" y2="${t.y + t.h}" stroke="#000000" stroke-width="1" />\n`;

  // Rows
  let curY = t.y + 48;
  for (const f of t.fields) {
    // Key indicator: PK or FK
    if (f.key) {
      svg += `    <text x="${t.x + 8}" y="${curY}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" font-weight="bold" fill="#000000">${f.key}</text>\n`;
    }
    
    // Field Name (offset 28px if key exists, else 10px)
    const nameX = t.x + (f.key ? 28 : 10);
    svg += `    <text x="${nameX}" y="${curY}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" fill="#000000">${escapeXml(f.name)}</text>\n`;
    
    // Data Type in right column
    svg += `    <text x="${colX + 10}" y="${curY}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" fill="#000000">${escapeXml(f.type)}</text>\n`;
    
    curY += 20;
  }
  
  svg += `  </g>\n`;
}
svg += `</g>\n`;

// Draw Legend Box at bottom right matching reference image
const legX = 2130;
const legY = 1800;
const legW = 280;
const legH = 110;

svg += `\n<!-- Legend Box -->
<g id="diagram_legend">
  <rect x="${legX}" y="${legY}" width="${legW}" height="${legH}" fill="#FFFFFF" stroke="#000000" stroke-width="1.5" />
  <text x="${legX + legW / 2}" y="${legY + 22}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">Legend</text>
  <line x1="${legX}" y1="${legY + 32}" x2="${legX + legW}" y2="${legY + 32}" stroke="#000000" stroke-width="1.2" />

  <!-- Solid Line entry -->
  <text x="${legX + 16}" y="${legY + 58}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#000000">PK</text>
  <text x="${legX + 45}" y="${legY + 58}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#000000">FK</text>
  <line x1="${legX + 75}" y1="${legY + 54}" x2="${legX + 160}" y2="${legY + 54}" stroke="#000000" stroke-width="1.5" />
  <text x="${legX + 175}" y="${legY + 58}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" fill="#000000">user_id</text>

  <!-- Dashed Line entry -->
  <text x="${legX + 16}" y="${legY + 90}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#000000">FK</text>
  <text x="${legX + 45}" y="${legY + 90}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#000000">FK</text>
  <line x1="${legX + 75}" y1="${legY + 86}" x2="${legX + 160}" y2="${legY + 86}" stroke="#000000" stroke-width="1.5" stroke-dasharray="6,4" />
  <text x="${legX + 175}" y="${legY + 90}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" fill="#000000">user_id</text>
</g>
`;

svg += `</svg>`;

// Write Files
const outSvg = path.join(__dirname, 'ayurwell_er_diagram_academic.svg');
const outPng = path.join(__dirname, 'ayurwell_er_diagram_academic.png');
const outHtml = path.join(__dirname, 'ayurwell_er_diagram_academic.html');

// Also update main ayurwell_er_diagram files so user gets this exact style directly
const mainPng = path.join(__dirname, 'ayurwell_er_diagram.png');
const mainSvg = path.join(__dirname, 'ayurwell_er_diagram.svg');

fs.writeFileSync(outSvg, svg, 'utf8');
fs.writeFileSync(mainSvg, svg, 'utf8');
console.log(`Saved SVG to ${outSvg}`);

// Render PNG using resvg-js
try {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 3600 }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  fs.writeFileSync(outPng, pngBuffer);
  fs.writeFileSync(mainPng, pngBuffer);
  console.log(`Rendered PNG (${pngBuffer.length} bytes) to ${outPng} and ${mainPng}`);

  // Copy to Artifact directory
  const artifactDir = path.join('C:', 'Users', 'dubey', '.gemini', 'antigravity-ide', 'brain', '4355294f-e04a-4d18-be9d-696a72e71e5d');
  if (fs.existsSync(artifactDir)) {
    fs.writeFileSync(path.join(artifactDir, 'ayurwell_er_diagram_academic.png'), pngBuffer);
    fs.writeFileSync(path.join(artifactDir, 'ayurwell_er_diagram.png'), pngBuffer);
    fs.writeFileSync(path.join(artifactDir, 'ayurwell_er_diagram_academic.svg'), svg, 'utf8');
    fs.writeFileSync(path.join(artifactDir, 'ayurwell_er_diagram.svg'), svg, 'utf8');
    console.log(`Copied images and SVGs to artifact directory`);
  }
} catch (err) {
  console.error('Failed to render PNG:', err);
}

// Generate HTML preview
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AyurWell — Entity Relationship Diagram</title>
  <style>
    body {
      margin: 0;
      padding: 30px;
      background: #eef2f5;
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
    .badge {
      background: #2b6cb0;
      color: white;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }
    .canvas-container {
      background: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
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
    <h1>AyurWell Healthcare Platform — Entity Relationship Diagram</h1>
    <span class="badge">15 Relational Tables • Textbook ERD Format</span>
  </div>
  <div class="canvas-container">
    <img src="ayurwell_er_diagram_academic.png" alt="AyurWell Entity Relationship Diagram" />
  </div>
</body>
</html>`;

fs.writeFileSync(outHtml, html, 'utf8');
console.log(`Saved HTML preview to ${outHtml}`);
