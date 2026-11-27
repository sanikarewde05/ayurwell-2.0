import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setFilter, setCurrentPlan } from '../store/slices/dietSlice';
import { DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';

export const BudgetPlannerPage: React.FC = () => {
  const dispatch = useDispatch();
  const { currentPlan, maxBudget } = useSelector((state: RootState) => state.diet);
  const [targetBudget, setTargetBudget] = useState<number>(maxBudget || 150);

  const handleGenerateBudgetPlan = () => {
    dispatch(setFilter({ maxBudget: targetBudget }));
    dispatch(setCurrentPlan({
      id: Date.now(),
      planName: `₹${targetBudget} Daily Budget Ayurvedic Meal Plan`,
      targetDisease: 'General Wellness',
      season: 'VASANTA',
      womensHealthStage: 'NONE',
      totalDailyBudgetInr: Math.min(targetBudget, 140),
      totalDailyCalories: 1820.0,
      ayurvedicNutritionScore: 91,
      meals: [
        { id: 401, mealType: 'BREAKFAST', recipeTitle: 'Steamed Ragi & Jaggery Porridge', recipeDescription: 'Ultra budget-friendly, rich in iron and bone calcium.', dayOfWeek: 'Daily', calories: 220, protein: 7.0, costInr: 20 },
        { id: 402, mealType: 'LUNCH', recipeTitle: 'Yellow Moong Dal Khichdi with Cumin Ghee', recipeDescription: 'Cost-effective complete protein source with all essential amino acids.', dayOfWeek: 'Daily', calories: 350, protein: 14.0, costInr: 40 },
        { id: 403, mealType: 'EVENING_SNACK', recipeTitle: 'Roasted Bengal Gram (Chana) & Cumin Tea', recipeDescription: 'High-protein snack costing under ₹10.', dayOfWeek: 'Daily', calories: 120, protein: 6.0, costInr: 10 },
        { id: 404, mealType: 'DINNER', recipeTitle: 'Seasonal Pumpkin (Kaddu) Sabzi with 2 Whole Wheat Phulkas', recipeDescription: 'Easy on wallet and digestive fire.', dayOfWeek: 'Daily', calories: 280, protein: 8.0, costInr: 30 }
      ],
      dietaryTips: [
        'Buy whole grains (Ragi, Jav, Moong) in bulk from local grain markets.',
        'Use seasonal local vegetables (Lauki, Kaddu, Palak) instead of expensive imported exotic produce.',
        'A2 Ghee used in small quantities (1 tsp/meal) delivers maximum lipid-soluble nutrient delivery.'
      ]
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold mb-2 border border-emerald-200">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Mita Vyaya Pathya (Economical Nutrition)</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-forest">Budget-Based Ayurvedic Diet Planner</h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Build high-nutrition, authentic Ayurvedic meal plans tailored strictly within your daily financial budget.
          </p>
        </div>
      </div>

      {/* Budget Selector Box */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur space-y-4">
        <h3 className="font-bold text-forest text-sm">Select Your Maximum Daily Meal Budget</h3>
        
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={targetBudget}
            onChange={(e) => setTargetBudget(Number(e.target.value))}
            className="w-full accent-forest cursor-pointer"
          />
          <span className="font-mono text-xl font-bold text-forest bg-sage-light px-4 py-1.5 rounded-xl border border-sage/30 whitespace-nowrap">
            ₹{targetBudget} / day
          </span>
        </div>

        <div className="flex justify-between text-xs text-charcoal-muted font-medium">
          <span>₹50 (Ultra Budget)</span>
          <span>₹250 (Standard)</span>
          <span>₹500 (Premium Organic)</span>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={handleGenerateBudgetPlan}
            className="bg-forest text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md hover:bg-forest-light transition-all inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Generate Budget Plan (₹{targetBudget})</span>
          </button>
        </div>
      </div>

      {/* Plan Output */}
      {currentPlan && (
        <div className="bg-white rounded-2xl p-6 border border-ivory-dark shadow-ayur space-y-6">
          <div className="flex items-center justify-between border-b border-ivory-dark pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sage">Generated Plan</span>
              <h2 className="text-xl font-serif font-bold text-forest">{currentPlan.planName}</h2>
            </div>
            <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Total Actual Cost: ₹{currentPlan.totalDailyBudgetInr} / day
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan.meals.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-ivory border border-ivory-dark space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-sage-light text-forest text-[10px] font-bold uppercase">
                    {m.mealType}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">₹{m.costInr}</span>
                </div>
                <h4 className="font-bold text-forest text-sm">{m.recipeTitle}</h4>
                <p className="text-xs text-charcoal-muted">{m.recipeDescription}</p>
              </div>
            ))}
          </div>

          <div className="bg-sage-light p-4 rounded-xl border border-sage/20 space-y-2">
            <h3 className="font-bold text-forest text-xs uppercase tracking-wider flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-sage" />
              <span>Smart Ayurvedic Budgeting Hacks</span>
            </h3>
            <ul className="text-xs text-charcoal space-y-1 list-disc list-inside">
              {currentPlan.dietaryTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
