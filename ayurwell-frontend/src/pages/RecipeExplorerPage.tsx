import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { BookOpen, Search, Clock } from 'lucide-react';
import { getFoodImage } from '../utils/foodImages';

export const RecipeExplorerPage: React.FC = () => {
  const { recipes } = useSelector((state: RootState) => state.recipes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDosha, setSelectedDosha] = useState('ALL');

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.suitableDiseaseConditions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDosha = selectedDosha === 'ALL' || r.suitableDosha === selectedDosha;
    return matchesSearch && matchesDosha;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-sage-light text-forest px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ayurvedic Culinary Treasury</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-forest">Ayurvedic Recipe Explorer</h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Therapeutic recipes formulated with Ayurvedic Rasa, Virya, Vipaka, and macro-nutritional balance.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-dark shadow-ayur flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search recipe title, disease, or herb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-medium focus:outline-none focus:border-forest"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'TRIDOSHA', 'VATA', 'PITTA', 'KAPHA'].map((dosha) => (
            <button
              key={dosha}
              onClick={() => setSelectedDosha(dosha)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDosha === dosha ? 'bg-forest text-white' : 'bg-ivory text-charcoal hover:bg-sage-light'
              }`}
            >
              {dosha}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((recipe) => {
          const imgUrl = getFoodImage(recipe.title);
          return (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-ivory-dark shadow-ayur hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Image Frame */}
              <div className="relative h-44 w-full overflow-hidden bg-ivory">
                <img
                  src={imgUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-forest uppercase tracking-wider border border-white/40 shadow-sm">
                  {recipe.suitableDosha}
                </div>
                <div className="absolute bottom-3 right-3 bg-forest/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center space-x-1">
                  <span>₹{recipe.costPerServingInr} / serving</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-forest text-base group-hover:text-sage transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed line-clamp-3">
                    {recipe.description}
                  </p>
                </div>

                {/* Macro & Time Bar */}
                <div className="pt-3 border-t border-ivory-dark space-y-2 text-xs">
                  <div className="flex items-center justify-between text-charcoal font-medium">
                    <span className="flex items-center space-x-1 text-charcoal-muted">
                      <Clock className="w-3.5 h-3.5 text-sage" />
                      <span>{recipe.prepTimeMins} mins</span>
                    </span>
                    <span className="font-bold text-forest">{recipe.calories} kcal</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px] text-center font-mono pt-1">
                    <div className="bg-ivory p-1.5 rounded-lg border border-ivory-dark">
                      <span className="block text-[9px] text-charcoal-muted uppercase font-bold">Protein</span>
                      <span className="font-bold text-forest">{recipe.proteinGrams}g</span>
                    </div>
                    <div className="bg-ivory p-1.5 rounded-lg border border-ivory-dark">
                      <span className="block text-[9px] text-charcoal-muted uppercase font-bold">Carbs</span>
                      <span className="font-bold text-forest">{recipe.carbsGrams}g</span>
                    </div>
                    <div className="bg-ivory p-1.5 rounded-lg border border-ivory-dark">
                      <span className="block text-[9px] text-charcoal-muted uppercase font-bold">Iron</span>
                      <span className="font-bold text-amber-800">{recipe.ironMg}mg</span>
                    </div>
                  </div>
                </div>

                {/* Suitable Tags */}
                <div className="pt-2 text-[10px] space-y-1">
                  <span className="text-charcoal-muted font-bold block">Suitable Diseases:</span>
                  <span className="px-2 py-0.5 rounded bg-sage-light text-forest font-semibold block truncate">
                    {recipe.suitableDiseaseConditions}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
