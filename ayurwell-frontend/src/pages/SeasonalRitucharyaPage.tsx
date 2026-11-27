import React, { useState } from 'react';
import { SunMoon, Sparkles, CheckCircle } from 'lucide-react';
import type { RituSeason } from '../types';

export const SeasonalRitucharyaPage: React.FC = () => {
  const [activeSeason, setActiveSeason] = useState<RituSeason>('SHARAD');

  const ritus = [
    { code: 'VASANTA' as RituSeason, name: 'Vasanta (Spring)', months: 'March - April', dominantDosha: 'Kapha Aggravation', icon: '🌸' },
    { code: 'GRISHMA' as RituSeason, name: 'Grishma (Summer)', months: 'May - June', dominantDosha: 'Pitta Accumulation', icon: '☀️' },
    { code: 'VARSHA' as RituSeason, name: 'Varsha (Monsoon)', months: 'July - August', dominantDosha: 'Vata Aggravation & Low Agni', icon: '🌧️' },
    { code: 'SHARAD' as RituSeason, name: 'Sharad (Autumn)', months: 'September - October', dominantDosha: 'Pitta Aggravation', icon: '🍂' },
    { code: 'HEMANTA' as RituSeason, name: 'Hemanta (Pre-Winter)', months: 'November - December', dominantDosha: 'High Digestive Fire (Strong Agni)', icon: '🌾' },
    { code: 'SHISHIRA' as RituSeason, name: 'Shishira (Winter)', months: 'January - February', dominantDosha: 'Vata-Kapha Balance', icon: '❄️' },
  ];

  const currentDetails = {
    VASANTA: {
      diet: ['Favor Bitter, Pungent, and Astringent tastes.', 'Eat Barley, Moong dal, Honey, and Dry spices (Ginger, Black Pepper).', 'Avoid heavy, sweet, oily foods and dairy curds.'],
      lifestyle: ['Engage in active morning exercise.', 'Use warm water for bathing.', 'Avoid sleeping during daytime (Diva-swapna).']
    },
    GRISHMA: {
      diet: ['Favor Sweet, Cooling, and Liquid foods.', 'Drink Coconut water, Sattu, Sugarcane juice, and Fresh Ghee.', 'Avoid salty, sour, spicy, and alcohol foods.'],
      lifestyle: ['Rest in cool shaded areas during noon.', 'Moonlight walks in the evening.', 'Avoid strenuous exercise during peak heat.']
    },
    VARSHA: {
      diet: ['Favor Sour, Salty, and Warm cooked foods.', 'Eat old grains, Moong Khichdi, Warm soups, and Boiled water with Cumin.', 'Avoid raw salads and heavy non-veg meals.'],
      lifestyle: ['Keep surroundings dry and clean.', 'Fumigate living spaces with Neem leaves and Guggulu.', 'Avoid getting wet in rain.']
    },
    SHARAD: {
      diet: ['Favor Sweet, Bitter, and Astringent foods.', 'Consume A2 Cow Ghee, Rice, Wheat, Bitter gourd, and Amla.', 'Avoid hot chili, curd, mustard oil, and alcohol.'],
      lifestyle: ['Moonlight exposure (Chandra-Kiran).', 'Pitta pacifying lifestyle.', 'Virechana (therapeutic detox) under practitioner guidance.']
    },
    HEMANTA: {
      diet: ['Favor Sweet, Sour, and Salty unctuous foods.', 'Eat Sesame, Wheat, Milk products, Sugarcane, and Nuts.', 'Agni is very strong; do not skip meals.'],
      lifestyle: ['Daily full body warm oil massage (Abhyanga).', 'Exercise vigorously in the morning.', 'Wear warm clothing.']
    },
    SHISHIRA: {
      diet: ['Favor nourishing, warming, and dense foods.', 'Eat Bajra, Ragi, Nuts, Sesame seeds, and Warm herbal soups.', 'Avoid cold drinks and ice creams.'],
      lifestyle: ['Stay in warm insulated rooms.', 'Sunbathing during morning hours.', 'Warm bath with sesame oil.']
    }
  }[activeSeason];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-amber-200">
            <SunMoon className="w-3.5 h-3.5" />
            <span>Kala Parinama (Seasonal Chrono-Nutrition)</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-forest">Seasonal Diet Planner (Ritucharya)</h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Ayurveda divides the year into 6 Ritus. Aligning diet and routine with seasonal transitions prevents disease accumulation (Sanchaya).
          </p>
        </div>
      </div>

      {/* Ritu Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {ritus.map((r) => {
          const isSelected = activeSeason === r.code;
          return (
            <button
              key={r.code}
              onClick={() => setActiveSeason(r.code)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-forest bg-forest text-white shadow-md'
                  : 'border-ivory-dark bg-white text-charcoal hover:border-sage'
              }`}
            >
              <div className="text-2xl mb-1">{r.icon}</div>
              <h3 className="font-bold text-xs truncate">{r.name}</h3>
              <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-200' : 'text-charcoal-muted'}`}>
                {r.months}
              </p>
            </button>
          );
        })}
      </div>

      {/* Season Details Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-dark shadow-ayur space-y-6">
        <div className="border-b border-ivory-dark pb-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sage">Active Seasonal Guideline</span>
            <h2 className="text-2xl font-serif font-bold text-forest mt-0.5">
              {ritus.find(r => r.code === activeSeason)?.name} Protocol
            </h2>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-900 text-xs font-bold rounded-full border border-amber-200">
            {ritus.find(r => r.code === activeSeason)?.dominantDosha}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Seasonal Diet */}
          <div className="p-5 rounded-2xl bg-sage-light/60 border border-sage/20 space-y-3">
            <h3 className="font-bold text-forest text-sm flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-sage" />
              <span>Aharatattva (Seasonal Diet & Rasa)</span>
            </h3>
            <ul className="text-xs text-charcoal space-y-2 list-disc list-inside">
              {currentDetails.diet.map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>

          {/* Seasonal Lifestyle */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <h3 className="font-bold text-amber-900 text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Viharatattva (Seasonal Lifestyle & Routine)</span>
            </h3>
            <ul className="text-xs text-amber-950 space-y-2 list-disc list-inside">
              {currentDetails.lifestyle.map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
