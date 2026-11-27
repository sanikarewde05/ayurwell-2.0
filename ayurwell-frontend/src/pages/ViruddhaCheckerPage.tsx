import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { addFood, removeFood, clearFoods, setReport } from '../store/slices/viruddhaSlice';
import { ShieldAlert, Plus, X, AlertTriangle, Info, Sparkles } from 'lucide-react';

export const ViruddhaCheckerPage: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedFoods, report } = useSelector((state: RootState) => state.viruddha);

  const availableFoods = [
    'Warm Cow Milk', 'Freshwater Fish', 'Pure Raw Honey', 'A2 Cow Ghee',
    'Boiled Warm Water', 'Fresh Spinach (Palak)', 'Yellow Moong Dal',
    'Citrus Fruits (Lemon/Orange)', 'Yogurt (Curd)', 'Radish (Mooli)',
    'Bananas', 'Nightshade Vegetables (Tomatoes)'
  ];

  const handleAdd = (foodName: string) => {
    if (foodName && !selectedFoods.includes(foodName)) {
      dispatch(addFood(foodName));
    }
  };

  const handleAnalyze = () => {
    if (selectedFoods.length < 2) return;

    const hasMilk = selectedFoods.includes('Warm Cow Milk');
    const hasFish = selectedFoods.includes('Freshwater Fish');
    const hasHoney = selectedFoods.includes('Pure Raw Honey');
    const hasHotWater = selectedFoods.includes('Boiled Warm Water');
    const hasGhee = selectedFoods.includes('A2 Cow Ghee');
    const hasCitrus = selectedFoods.includes('Citrus Fruits (Lemon/Orange)');

    const conflicts = [];

    if (hasMilk && hasFish) {
      conflicts.push({
        foodA: 'Warm Cow Milk',
        foodB: 'Freshwater Fish',
        incompatibilityType: 'Virya-Viruddha (Potency Conflict)',
        hazardReason: 'Milk is Shita (Cooling) while Fish is Ushna (Heating). Combining them obstructs body channels (Srotas) and causes skin toxins (Kustha).',
        antidote: 'Consume warm ginger tea or neem water if accidentally ingested.'
      });
    }

    if (hasHoney && hasHotWater) {
      conflicts.push({
        foodA: 'Pure Raw Honey',
        foodB: 'Boiled Warm Water',
        incompatibilityType: 'Sanskard-Viruddha (Processing Incompatibility)',
        hazardReason: 'Heating honey above 40°C converts its natural fructose into toxic compounds (Ama) that adhere to digestive walls.',
        antidote: 'Mix honey only in lukewarm water (below body temperature).'
      });
    }

    if (hasHoney && hasGhee && selectedFoods.length === 2) {
      conflicts.push({
        foodA: 'Pure Raw Honey',
        foodB: 'A2 Cow Ghee',
        incompatibilityType: 'Matra-Viruddha (Equal Proportion Conflict)',
        hazardReason: 'Honey and Ghee mixed in equal 1:1 weight proportion act as a subtle poison due to opposing cellular actions.',
        antidote: 'Always consume in unequal proportions (e.g. 2 parts Ghee to 1 part Honey).'
      });
    }

    if (hasMilk && hasCitrus) {
      conflicts.push({
        foodA: 'Warm Cow Milk',
        foodB: 'Citrus Fruits (Lemon/Orange)',
        incompatibilityType: 'Rasa-Viruddha (Taste Conflict)',
        hazardReason: 'Acidic citrus causes milk proteins to curdle immediately inside stomach, causing bloating and sour reflux.',
        antidote: 'Allow at least a 2-hour interval between milk and sour fruits.'
      });
    }

    const isComp = conflicts.length === 0;
    const score = isComp ? 100 : Math.max(100 - (conflicts.length * 40), 10);

    dispatch(setReport({
      compatible: isComp,
      compatibilityScore: score,
      conflicts,
      generalAdvice: isComp
        ? ['These food items have harmonious Rasas (tastes) and Viryas (potencies). Safe for consumption!']
        : ['Avoid consuming incompatible food pairs in the same meal.', 'Allow at least a 2 to 3-hour interval between consuming opposing potencies.']
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-terracotta/10 text-terracotta px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Viruddha Ahara (Food Incompatibility)</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-forest">Food Compatibility Checker</h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Test combinations of foods for opposing thermal potencies (Virya), post-digestive effects (Vipaka), and toxic friction (Ama).
          </p>
        </div>
      </div>

      {/* Input Selection Box */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur space-y-4">
        <h3 className="font-bold text-forest text-sm">Select Food Items to Test</h3>
        
        {/* Quick Add Pills */}
        <div className="flex flex-wrap gap-2">
          {availableFoods.map((f) => {
            const isAdded = selectedFoods.includes(f);
            return (
              <button
                key={f}
                onClick={() => isAdded ? dispatch(removeFood(f)) : handleAdd(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isAdded
                    ? 'bg-forest text-white shadow-sm'
                    : 'bg-ivory border border-ivory-dark text-charcoal hover:border-sage'
                }`}
              >
                <span>{f}</span>
                {isAdded ? <X className="w-3.5 h-3.5 text-gold" /> : <Plus className="w-3.5 h-3.5 text-sage" />}
              </button>
            );
          })}
        </div>

        {/* Selected List */}
        {selectedFoods.length > 0 && (
          <div className="pt-3 border-t border-ivory-dark flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-charcoal-muted mr-2">Selected for testing:</span>
            {selectedFoods.map((item) => (
              <span key={item} className="px-3 py-1 bg-sage-light text-forest rounded-lg text-xs font-bold flex items-center space-x-1.5 border border-sage/30">
                <span>{item}</span>
                <X className="w-3.5 h-3.5 text-terracotta cursor-pointer" onClick={() => dispatch(removeFood(item))} />
              </span>
            ))}
            <button
              onClick={() => dispatch(clearFoods())}
              className="text-xs text-terracotta font-semibold hover:underline ml-auto"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="pt-2 text-right">
          <button
            onClick={handleAnalyze}
            disabled={selectedFoods.length < 2}
            className={`font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2 ${
              selectedFoods.length >= 2
                ? 'bg-forest text-white hover:bg-forest-light'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Analyze Food Pair Compatibility</span>
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {report && (
        <div className="bg-white rounded-2xl p-6 border border-ivory-dark shadow-ayur space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-ivory-dark pb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl ${
                report.compatible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {report.compatible ? '✅' : '⚠️'}
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-forest">
                  {report.compatible ? 'Harmonious Food Combination' : 'Viruddha Ahara Conflict Detected'}
                </h2>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  {report.compatible ? 'No opposing potencies detected.' : `${report.conflicts.length} major toxic conflict(s) found.`}
                </p>
              </div>
            </div>

            <div className="text-center px-4 py-2 rounded-xl bg-ivory border border-ivory-dark">
              <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Compatibility Rating</span>
              <span className={`text-xl font-bold ${report.compatible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {report.compatibilityScore} / 100
              </span>
            </div>
          </div>

          {/* Conflicts Detailed Breakdown */}
          {report.conflicts.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-forest text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-terracotta" />
                <span>Detected Incompatibility Details</span>
              </h3>

              <div className="space-y-3">
                {report.conflicts.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-sm">
                        {c.foodA} + {c.foodB}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-rose-200 text-rose-950 text-[10px] font-bold uppercase">
                        {c.incompatibilityType}
                      </span>
                    </div>

                    <p className="text-xs text-rose-950 leading-relaxed font-medium">
                      <strong>Hazard:</strong> {c.hazardReason}
                    </p>

                    <div className="pt-1 text-xs text-emerald-900 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                      <strong>Ayurvedic Antidote:</strong> {c.antidote}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Advice */}
          <div className="bg-sage-light p-4 rounded-xl border border-sage/20 space-y-2">
            <h4 className="font-bold text-forest text-xs uppercase tracking-wider flex items-center space-x-1">
              <Info className="w-4 h-4 text-sage" />
              <span>Ayurvedic Wisdom</span>
            </h4>
            <ul className="text-xs text-charcoal space-y-1 list-disc list-inside">
              {report.generalAdvice.map((adv, i) => (
                <li key={i}>{adv}</li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
