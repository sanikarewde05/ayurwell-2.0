import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { MealItem } from '../types';
import {
  Sparkles,
  Utensils,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  Sun,
  Clock,
  Bot,
  AlertTriangle,
  Flame,
  Leaf,
  ChevronRight,
  X,
  ChefHat,
  Calendar
} from 'lucide-react';
import { getFoodImage, FOOD_IMAGES } from '../utils/foodImages';

// Fallback authentic Ayurvedic therapeutic meals strictly tailored to primary Dosha
const getFallbackDoshaMeals = (dosha: string): MealItem[] => {
  const normDosha = (dosha || 'VATA').toUpperCase();
  if (normDosha.includes('PITTA')) {
    return [
      {
        id: 201,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'BREAKFAST',
        recipeTitle: 'Cooling Coconut Rice Porridge with Cardamom',
        recipeDescription: 'Steamed basmati rice gently cooked in coconut milk with cardamom, soaked munakka, and sweet pomegranate.',
        calories: 240,
        protein: 5.5,
        carbs: 45,
        fat: 4.5,
        fiber: 5.0,
        ironMg: 2.8,
        calciumMg: 120,
        costInr: 0,
        suitableDosha: 'PITTA',
        keyIngredients: ['Basmati Rice', 'Fresh Coconut Milk', 'Green Cardamom', 'Pomegranate Arils', 'Soaked Raisins'],
        whyRecommended: 'Naturally cooling (Shita Virya) and sweet (Madhura Rasa) to pacify internal heat, acidity, and digestive fire.',
        ayurvedicProperties: 'Rasa: Madhura (Sweet) | Virya: Shita (Cooling) | Vipaka: Madhura | Dosha: Pitta Pacifying'
      },
      {
        id: 202,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'LUNCH',
        recipeTitle: 'Steamed Lauki Curry with Yellow Moong & Phulka',
        recipeDescription: 'Tender bottle gourd cooked with split moong, mild coriander, fresh cumin, and handmade wheat phulkas.',
        calories: 340,
        protein: 13.0,
        carbs: 58,
        fat: 5.0,
        fiber: 8.5,
        ironMg: 4.1,
        calciumMg: 140,
        costInr: 0,
        suitableDosha: 'PITTA',
        keyIngredients: ['Fresh Lauki (Bottle Gourd)', 'Yellow Moong Dal', 'Whole Wheat Atta', 'Coriander Seeds', 'A2 Cow Ghee'],
        whyRecommended: 'Alkalizing and soothing for liver metabolism, reducing bile sharpness without impeding nutrient assimilation.',
        ayurvedicProperties: 'Rasa: Tikta, Kashaya (Bitter, Astringent) | Virya: Shita (Cooling) | Vipaka: Madhura | Dosha: Pitta Pacifying'
      },
      {
        id: 203,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'EVENING_SNACK',
        recipeTitle: 'CCF Cooling Digestive Tea (Coriander, Cumin, Fennel)',
        recipeDescription: 'Warm aromatic infusion of whole organic spices brewed to soothe digestion, clear pitta toxins and hydrate.',
        calories: 20,
        protein: 0.5,
        carbs: 3,
        fat: 0.1,
        fiber: 1.2,
        ironMg: 1.2,
        calciumMg: 45,
        costInr: 0,
        suitableDosha: 'PITTA',
        keyIngredients: ['Whole Fennel Seeds (Saunf)', 'Coriander Seeds (Dhaniya)', 'Cumin Seeds (Jeera)', 'Pure Spring Water'],
        whyRecommended: 'Balances Samana Vayu and Pachaka Pitta, dispelling acid reflux and digestive burning sensations.',
        ayurvedicProperties: 'Rasa: Madhura, Kashaya | Virya: Shita | Vipaka: Madhura | Dosha: Pitta Pacifying'
      },
      {
        id: 204,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'DINNER',
        recipeTitle: 'Tridoshic Moong Dal Khichdi with Steamed Zucchini',
        recipeDescription: 'Gentle restorative khichdi tempered in pure A2 cow ghee with rock salt, turmeric and digestive cumin.',
        calories: 310,
        protein: 12.0,
        carbs: 52,
        fat: 5.5,
        fiber: 6.8,
        ironMg: 3.8,
        calciumMg: 110,
        costInr: 0,
        suitableDosha: 'PITTA',
        keyIngredients: ['Split Yellow Moong', 'Basmati Rice', 'Zucchini', 'A2 Cow Ghee', 'Turmeric', 'Cumin'],
        whyRecommended: 'Easiest meal on Jatharagni; provides deep restorative nourishment before sleep without overheating the system.',
        ayurvedicProperties: 'Rasa: Madhura, Kashaya | Virya: Sama (Neutral-Cooling) | Vipaka: Madhura | Dosha: Tridoshic / Pitta Pacifying'
      }
    ];
  } else if (normDosha.includes('KAPHA')) {
    return [
      {
        id: 301,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'BREAKFAST',
        recipeTitle: 'Steamed Barley (Jav) Vegetable Upma',
        recipeDescription: 'Roasted pearled barley cooked with diced seasonal gourds, fresh curry leaves, and grated ginger.',
        calories: 245,
        protein: 8.5,
        carbs: 44,
        fat: 3.5,
        fiber: 9.2,
        ironMg: 3.4,
        calciumMg: 65,
        costInr: 0,
        suitableDosha: 'KAPHA',
        keyIngredients: ['Pearled Barley (Jav)', 'Carrots', 'Curry Leaves', 'Fresh Ginger', 'Mustard Seeds', 'Rock Salt'],
        whyRecommended: 'Astringent and light qualities scrap stagnant Kapha and support active fat metabolism (Medo Dhatu).',
        ayurvedicProperties: 'Rasa: Kashaya, Tikta (Astringent, Bitter) | Virya: Ushna (Warming) | Vipaka: Katu | Dosha: Kapha Pacifying'
      },
      {
        id: 302,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'LUNCH',
        recipeTitle: 'Spiced Yellow Moong Dal with Jowar (Sorghum) Roti',
        recipeDescription: 'Protein-rich yellow moong tempered with black pepper and cumin, served with whole grain gluten-free jowar roti.',
        calories: 330,
        protein: 14.5,
        carbs: 56,
        fat: 4.0,
        fiber: 10.5,
        ironMg: 4.6,
        calciumMg: 95,
        costInr: 0,
        suitableDosha: 'KAPHA',
        keyIngredients: ['Yellow Moong Dal', 'Jowar Flour (Sorghum)', 'Black Pepper', 'Jeera', 'Hing (Asafoetida)'],
        whyRecommended: 'Stimulates digestive fire (Deepana & Pachana) while maintaining lightness and eliminating post-meal lethargy.',
        ayurvedicProperties: 'Rasa: Katu, Tikta, Kashaya | Virya: Ushna | Vipaka: Katu | Dosha: Kapha Pacifying'
      },
      {
        id: 303,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'EVENING_SNACK',
        recipeTitle: 'Roasted Spiced Makhana with Tulsi Ginger Brew',
        recipeDescription: 'Fox nuts dry-roasted with black pepper and turmeric, paired with a hot aromatic tulsi and crushed ginger tea.',
        calories: 110,
        protein: 3.5,
        carbs: 21,
        fat: 1.5,
        fiber: 3.5,
        ironMg: 2.1,
        calciumMg: 70,
        costInr: 0,
        suitableDosha: 'KAPHA',
        keyIngredients: ['Fox Nuts (Makhana)', 'Holy Basil (Tulsi)', 'Fresh Ginger', 'Turmeric', 'Black Salt'],
        whyRecommended: 'Crunchy, low-calorie, zero-oil snack that clears chest and head heaviness while keeping metabolic energy high.',
        ayurvedicProperties: 'Rasa: Katu, Tikta | Virya: Ushna | Vipaka: Katu | Dosha: Kapha Pacifying'
      },
      {
        id: 304,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'DINNER',
        recipeTitle: 'Light Broken Wheat (Dalia) Vegetable Soup',
        recipeDescription: 'Warm, savory vegetable dalia cooked with spinach, grated ginger, and digestive hing for light evening nourishment.',
        calories: 270,
        protein: 9.0,
        carbs: 48,
        fat: 3.0,
        fiber: 8.0,
        ironMg: 3.2,
        calciumMg: 85,
        costInr: 0,
        suitableDosha: 'KAPHA',
        keyIngredients: ['Broken Wheat (Dalia)', 'Spinach', 'Bottle Gourd', 'Ginger', 'Black Pepper'],
        whyRecommended: 'Very light and quick to digest, preventing nocturnal mucus formation and sluggish morning wakefulness.',
        ayurvedicProperties: 'Rasa: Kashaya, Tikta | Virya: Ushna | Vipaka: Katu | Dosha: Kapha Pacifying'
      }
    ];
  } else {
    // Default VATA
    return [
      {
        id: 101,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'BREAKFAST',
        recipeTitle: 'Calcium-Rich Warm Ragi (Finger Millet) Porridge',
        recipeDescription: 'Freshly ground finger millet cooked in lukewarm water/milk with cardamom, desi ghee, and soaked crushed almonds.',
        calories: 260,
        protein: 7.2,
        carbs: 48,
        fat: 4.0,
        fiber: 7.5,
        ironMg: 4.8,
        calciumMg: 340,
        costInr: 0,
        suitableDosha: 'VATA',
        keyIngredients: ['Ragi Flour', 'Soaked Almonds', 'Green Cardamom', 'Desi Cow Ghee', 'Raw Jaggery'],
        whyRecommended: 'Grounding, warm and unctuous (Snigdha), deeply pacifying nervous system restlessness and lubricating dry joints.',
        ayurvedicProperties: 'Rasa: Madhura (Sweet) | Virya: Ushna (Warm) | Vipaka: Madhura | Dosha: Vata Pacifying'
      },
      {
        id: 102,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'LUNCH',
        recipeTitle: 'Tridoshic Moong Dal Khichdi with Palak & Desi Ghee',
        recipeDescription: 'Equal parts yellow moong dal and soft rice with spinach, cumin, ginger, rock salt, and 1 tbsp pure A2 Ghee.',
        calories: 340,
        protein: 14.0,
        carbs: 56,
        fat: 7.0,
        fiber: 8.0,
        ironMg: 5.2,
        calciumMg: 160,
        costInr: 0,
        suitableDosha: 'VATA',
        keyIngredients: ['Yellow Moong Dal', 'Basmati Rice', 'Palak (Spinach)', 'A2 Cow Ghee', 'Cumin', 'Hing', 'Turmeric'],
        whyRecommended: 'Optimum macro & micro balance that strengthens Rakta (blood) and Asthi (bone) without creating gas or bloating.',
        ayurvedicProperties: 'Rasa: Madhura, Lavana | Virya: Ushna | Vipaka: Madhura | Dosha: Vata Pacifying'
      },
      {
        id: 103,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'EVENING_SNACK',
        recipeTitle: 'CCF Warm Digestive Tea with Soaked Munakka',
        recipeDescription: 'Warm digestive infusion of cumin, coriander, and fennel seeds paired with seeded black raisins soaked overnight.',
        calories: 65,
        protein: 1.2,
        carbs: 15,
        fat: 0.2,
        fiber: 2.2,
        ironMg: 2.4,
        calciumMg: 50,
        costInr: 0,
        suitableDosha: 'VATA',
        keyIngredients: ['Cumin Seeds', 'Coriander Seeds', 'Fennel Seeds', 'Black Raisins (Munakka)', 'Warm Water'],
        whyRecommended: 'Relaxes abdominal tension, soothes variable appetite (Vishamagni) and prevents late afternoon energy crashes.',
        ayurvedicProperties: 'Rasa: Madhura, Tikta | Virya: Ushna | Vipaka: Madhura | Dosha: Vata Pacifying'
      },
      {
        id: 104,
        dayIndex: 1,
        dayOfWeek: 'Day 1',
        mealType: 'DINNER',
        recipeTitle: 'Warm Lauki Moong Soup with Soft Wheat Phulka',
        recipeDescription: 'Fresh bottle gourd and split moong dal soup tempered in cow ghee, served alongside soft ghee-brushed phulka.',
        calories: 310,
        protein: 11.5,
        carbs: 50,
        fat: 6.0,
        fiber: 7.2,
        ironMg: 3.9,
        calciumMg: 125,
        costInr: 0,
        suitableDosha: 'VATA',
        keyIngredients: ['Bottle Gourd (Lauki)', 'Yellow Moong', 'Whole Wheat Atta', 'A2 Cow Ghee', 'Ginger', 'Rock Salt'],
        whyRecommended: 'Warm, hydrating and easy to assimilate; induces sound natural sleep (Nidra) without digestive discomfort.',
        ayurvedicProperties: 'Rasa: Madhura, Kashaya | Virya: Ushna | Vipaka: Madhura | Dosha: Vata Pacifying'
      }
    ];
  }
};

// Detailed cooking instructions for Ayurvedic recipes
const getRecipeInstructions = (meal: MealItem): string[] => {
  const title = meal.recipeTitle.toLowerCase();
  if (title.includes('khichdi')) {
    return [
      'Rinse 1/2 cup yellow moong dal and 1/2 cup basmati rice thoroughly under fresh water; soak for 15 minutes.',
      'Heat 1 tbsp pure A2 Desi Cow Ghee in a heavy-bottomed pot or cooker over medium heat.',
      'Add 1 tsp cumin seeds, a pinch of hing (asafoetida), and 1/2 tsp ground turmeric; let seeds gently splutter.',
      'Add the soaked dal, rice, diced seasonal vegetables (or spinach), and 4 cups of water with rock salt to taste.',
      'Cover and simmer on low flame for 20 minutes (or 3-4 whistles in a pressure cooker) until soft, unctuous and creamy.',
      'Drizzle with an additional 1/2 tsp warm ghee and serve freshly warm to soothe digestive Jatharagni.'
    ];
  }
  if (title.includes('ragi') || title.includes('porridge')) {
    return [
      'In a small bowl, blend 3 tbsp organic finger millet (ragi) flour with 1/2 cup room temperature water until silky smooth.',
      'In a saucepan, bring 1 cup of water (or warm A2 milk) to a gentle rolling boil.',
      'Slowly stream the ragi paste into the boiling water while whisking continuously to prevent lumps from forming.',
      'Reduce heat to low and simmer for 6–8 minutes until the porridge thickens and develops a fragrant, glossy sheen.',
      'Stir in 1/2 tsp freshly ground green cardamom powder, a pinch of grated cinnamon, and organic raw jaggery to taste.',
      'Top with crushed soaked almonds and 1/2 tsp warm cow ghee; enjoy lukewarm for optimal bone and nerve nourishment.'
    ];
  }
  if (title.includes('upma') || title.includes('barley')) {
    return [
      'Dry roast 1/2 cup pearled barley (or broken grains) on low flame for 4 minutes until warm and nutty; set aside.',
      'Heat 1 tbsp sesame oil or ghee in a pan; temper with 1/2 tsp mustard seeds, curry leaves, and grated ginger.',
      'Add finely diced seasonal vegetables (carrots, green peas, bottle gourd) and saute gently for 3 minutes.',
      'Pour in 2 cups of water and 1/2 tsp rock salt (Saindhava Lavana); bring to a lively boil.',
      'Slowly pour in the roasted barley while stirring briskly to maintain an even, fluffy texture.',
      'Cover with lid and steam on the lowest flame for 10-12 minutes until all water is absorbed; serve hot.'
    ];
  }
  if (title.includes('tea') || title.includes('ccf') || title.includes('infusion') || title.includes('brew')) {
    return [
      'Combine 1/2 tsp whole cumin seeds, 1/2 tsp whole coriander seeds, and 1/2 tsp whole fennel seeds in a pot.',
      'Add 3 cups of fresh purified water and bring to a gentle rolling boil.',
      'Reduce flame to low and simmer for 5–7 minutes until the liquid turns a delicate golden hue.',
      'Turn off heat, cover with lid and steep for 2 minutes to trap medicinal volatile aromatic oils.',
      'Strain through a fine mesh sieve into your cup; sip slowly while warm between meals for optimal Agni clearing.'
    ];
  }
  if (title.includes('soup') || title.includes('curry') || title.includes('dal')) {
    return [
      'Peel and dice fresh tender bottle gourd (lauki) or seasonal greens; wash 1/4 cup yellow moong dal.',
      'In a saucepan, warm 1 tsp A2 cow ghee; add cumin seeds, hing, and grated fresh ginger root.',
      'Add the diced vegetables, moong dal, 1/4 tsp turmeric, rock salt, and 2.5 cups water.',
      'Simmer on medium heat for 15-18 minutes until vegetables and lentils are tender and easily digestible.',
      'Lightly mash with a ladle to achieve a smooth, comforting, easily assimilable consistency.',
      'Garnish with chopped fresh coriander leaves and serve freshly warm.'
    ];
  }
  return [
    'Clean and prepare all fresh organic ingredients as per the Ayurvedic ingredient list.',
    'Heat 1 tbsp pure A2 Ghee in a pan over medium heat; add gentle digestive spices (cumin, turmeric, ginger).',
    'Add the main grains or vegetables, stirring gently to coat with aromatic medicinal spices.',
    'Add warm water, season with rock salt (Saindhava Lavana), cover and cook until tender and aromatic.',
    'Allow to rest for 2 minutes and serve fresh and warm to ignite digestive Agni.'
  ];
};

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { result } = useSelector((state: RootState) => state.dosha);
  const { currentPlan } = useSelector((state: RootState) => state.diet);
  const { summary } = useSelector((state: RootState) => state.analytics);

  const [activeDay, setActiveDay] = useState<number>(1);
  const [selectedRecipeMeal, setSelectedRecipeMeal] = useState<MealItem | null>(null);

  const isCompleted = Boolean(result && profile?.profileCompleted);

  const prakriti = result?.primaryPrakriti || profile?.primaryDosha || 'VATA';
  const disease = currentPlan?.targetDisease || (profile?.targetDiseaseCondition && profile.targetDiseaseCondition !== 'None' ? profile.targetDiseaseCondition : '');
  const ayurScore = currentPlan?.ayurvedicNutritionScore || summary?.currentAyurScore || 0;

  // Lock body scroll when recipe modal is open and handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedRecipeMeal(null);
    };
    if (selectedRecipeMeal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedRecipeMeal]);

  // Filter meals strictly for the selected day (defaults to Day 1 / Today)
  const todaysMeals = useMemo(() => {
    if (!currentPlan?.meals || currentPlan.meals.length === 0) {
      return getFallbackDoshaMeals(prakriti);
    }
    const dayFiltered = currentPlan.meals.filter((m) => m.dayIndex === activeDay);
    if (dayFiltered.length > 0) return dayFiltered;
    // Fallback if meals don't have dayIndex: show only first 4 meals (Breakfast, Lunch, Evening Snack, Dinner)
    return currentPlan.meals.slice(0, 4);
  }, [currentPlan, activeDay, prakriti]);

  const nutrients = [
    { name: 'Iron (Rakta Dhatu)', percent: isCompleted ? 72 : 0, color: 'bg-amber-600', status: isCompleted ? 'Optimal' : 'Pending' },
    { name: 'Calcium (Asthi Dhatu)', percent: isCompleted ? 88 : 0, color: 'bg-emerald-600', status: isCompleted ? 'Strong' : 'Pending' },
    { name: 'Vitamin B12 (Majja Dhatu)', percent: isCompleted ? 51 : 0, color: 'bg-terracotta', status: isCompleted ? 'Needs Attention' : 'Pending' },
    { name: 'Vitamin D (Suryatapa)', percent: isCompleted ? 42 : 0, color: 'bg-amber-700', status: isCompleted ? 'Needs Attention' : 'Pending' },
    { name: 'Folate (Cellular Repair)', percent: isCompleted ? 81 : 0, color: 'bg-forest', status: isCompleted ? 'Optimal' : 'Pending' },
    { name: 'Dietary Fiber (Agni Clear)', percent: isCompleted ? 91 : 0, color: 'bg-emerald-700', status: isCompleted ? 'Excellent' : 'Pending' },
  ];

  const recommendations = isCompleted ? [
    {
      title: 'Recommended Foods',
      icon: Leaf,
      desc: `${prakriti}-pacifying nutrient dense foods tailored to your constitution`,
      tab: 'dataset',
      badge: 'Curated'
    },
    {
      title: 'Therapeutic Recipes',
      icon: Utensils,
      desc: `${disease || 'Ayurvedic'} nourishing recipes designed to support your Agni`,
      tab: 'recipes',
      badge: 'Recipes'
    },
    {
      title: 'Nutrients to Watch',
      icon: AlertTriangle,
      desc: 'Active intake monitoring and deficiency alerts mapped to RDA',
      tab: 'analytics',
      badge: 'ML Alert'
    },
    {
      title: "Today's Ayurvedic Tip",
      icon: Sun,
      desc: `Dinacharya tips to support balanced ${prakriti} constitution`,
      tab: 'seasonal',
      badge: 'Dinacharya'
    }
  ] : [
    {
      title: 'Ayurvedic Food Wisdom',
      icon: Leaf,
      desc: 'Explore classical Ayurvedic food energetics (Rasa, Virya, Vipaka) & IFCT nutrition',
      tab: 'dataset',
      badge: 'Classical'
    },
    {
      title: 'Therapeutic Recipes',
      icon: Utensils,
      desc: 'Browse nourishing Ayurvedic recipes formulated for balanced digestion',
      tab: 'recipes',
      badge: 'Recipes'
    },
    {
      title: 'Nutrient Monitoring',
      icon: AlertTriangle,
      desc: 'Complete your Prakriti assessment to unlock personalized ML deficiency risk models',
      tab: 'dosha',
      badge: 'ML Feature'
    },
    {
      title: 'Seasonal Living',
      icon: Sun,
      desc: 'Discover seasonal Ritucharya lifestyle principles for optimal mind-body balance',
      tab: 'seasonal',
      badge: 'Ritucharya'
    }
  ];

  const schedule = isCompleted && currentPlan?.meals && currentPlan.meals.length > 0 ? [
    { time: '07:00', title: 'Ushapan (Warm Water)', status: 'Completed', icon: '🌅' },
    { time: '09:00', title: currentPlan.meals[0]?.recipeTitle || 'Morning Breakfast', status: 'Completed', icon: '🥣' },
    { time: '13:00', title: currentPlan.meals[1]?.recipeTitle || 'Mid-Day Lunch', status: 'Next Up', icon: '🥗' },
    { time: '17:30', title: currentPlan.meals[2]?.recipeTitle || 'Evening Sip', status: 'Upcoming', icon: '☕' },
    { time: '21:30', title: 'Restorative Sleep Routine', status: 'Upcoming', icon: '🌙' },
  ] : [
    { time: '07:00', title: 'Ushapan (Morning Warm Water)', status: 'Recommended', icon: '🌅' },
    { time: '12:30', title: 'Mindful Mid-Day Primary Meal', status: 'Upcoming', icon: '🥗' },
    { time: '17:30', title: 'Evening Digestive Herbal Sip', status: 'Upcoming', icon: '☕' },
    { time: '21:30', title: 'Restorative Nidra (Sleep)', status: 'Upcoming', icon: '🌙' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* 1. HERO BANNER SECTION (Authentic Ayurvedic Royal Forest Theme with high contrast & tactile buttons) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#143D32] via-[#1B4D3E] to-[#0D2E24] text-white shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#256753]/50">
        
        {/* Subtle Botanical Decoration Overlay */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-52 h-52 bg-[#256753]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Left Hero Copy */}
        <div className="space-y-4 max-w-xl z-10 text-left">
          <div className="inline-flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 text-xs font-semibold text-[#F3C74D] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F3C74D]" />
            <span className="tracking-wider uppercase text-[10px] font-bold">Ayurvedic Diet Planning and Nutrient Analysis System</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white leading-tight drop-shadow-sm">
            {isCompleted
              ? `Namaste, ${user?.fullName || 'User'} 🙏`
              : `Welcome to AyurWell, ${user?.fullName || 'Wellness Seeker'} 🙏`}
          </h1>

          <p className="text-sm md:text-[15px] text-[#F7F4EE] leading-relaxed font-normal">
            {isCompleted ? (
              <>
                Your personalized <strong className="text-[#F3C74D] font-bold">{prakriti}</strong> Prakriti profile and <strong className="text-[#F3C74D] font-bold">{(!disease || disease.toLowerCase() === 'none' || disease.toLowerCase() === 'null') ? 'Holistic Pathya' : `${disease} Pathya`}</strong> protocol are active. Agni digestive fire is balanced today.
              </>
            ) : (
              <>
                Complete your wellness assessment to create your personalized AyurWell – Ayurvedic Diet Planning and Nutrient Analysis System profile and receive tailored Ayurvedic nutrition recommendations.
              </>
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            {isCompleted ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('disease-diet')}
                  className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C358] active:bg-[#B89426] text-[#143D32] font-bold text-xs transition-all shadow-lg hover:shadow-[#D4AF37]/30 flex items-center space-x-2 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                >
                  <span>Generate Today's Diet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dosha')}
                  className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-[#D4AF37] text-white active:text-[#143D32] font-bold text-xs transition-all border-2 border-white/30 hover:border-[#D4AF37]/70 active:border-[#D4AF37] shadow-md hover:shadow-lg flex items-center space-x-2 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F3C74D] group-hover:scale-110 group-active:text-[#143D32] transition-transform" />
                  <span>Retake Prakriti Quiz</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('dosha')}
                className="px-6 py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C358] active:bg-[#B89426] text-[#143D32] font-bold text-xs transition-all shadow-lg hover:shadow-[#D4AF37]/30 flex items-center space-x-2 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
              >
                <Sparkles className="w-4 h-4 text-[#143D32]" />
                <span>Start Your Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Hero Image Frame */}
        <div className="relative z-10 shrink-0 w-full md:w-80 h-48 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/40 group">
          <img
            src={FOOD_IMAGES['ayurveda_hero']}
            alt="Authentic Ayurvedic Herbs & Apothecary"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-3.5">
            <div className="text-white text-xs font-serif font-semibold drop-shadow-md flex items-center space-x-1.5">
              <span>🌿</span>
              <span>Pure Sattvic &amp; Ayurvedic Ingredients</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. TOP INTERACTIVE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: AyurScore Progress Ring */}
        <div
          onClick={() => setActiveTab(isCompleted ? 'analytics' : 'dosha')}
          className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-ayur hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">Ayurvedic Nutrition Score</span>
            <div className="p-2 rounded-xl bg-sage-light text-forest group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-forest">
                {isCompleted ? ayurScore : '--'} <span className="text-xs text-charcoal-muted font-normal">/ 100</span>
              </div>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {isCompleted ? 'Optimal Agni Balance' : 'Assessment Pending'}
              </span>
            </div>

            {/* Circular Progress Visualization */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="#FAF7F2" strokeWidth="4" fill="transparent" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="#1B4D3E"
                  strokeWidth="4"
                  strokeDasharray={138}
                  strokeDashoffset={isCompleted ? 138 - (138 * ayurScore) / 100 : 138}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-bold text-forest">
                {isCompleted ? `${ayurScore}%` : '--'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-charcoal-muted pt-1 border-t border-ivory-dark">
            {isCompleted ? 'Click to view 30-day analytics →' : 'Complete quiz to calculate score →'}
          </p>
        </div>

        {/* Card 2: Dominant Prakriti Breakdown */}
        <div
          onClick={() => setActiveTab('dosha')}
          className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-ayur hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">Dominant Prakriti</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-900 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-serif font-bold text-forest">
              {isCompleted ? prakriti : 'Not Assessed'}
            </div>
            <p className="text-[11px] text-charcoal-muted mt-0.5">
              {isCompleted && result
                ? `Pitta ${result.pittaScore * 20}% | Vata ${result.vataScore * 20}% | Kapha ${result.kaphaScore * 20}%`
                : 'Take Prakriti assessment to discover'}
            </p>
          </div>

          {/* Dosha Distribution Progress Bar */}
          <div className="w-full bg-ivory rounded-full h-2.5 overflow-hidden flex">
            {isCompleted && result ? (
              <>
                <div className="bg-amber-600 h-full" style={{ width: `${result.pittaScore * 20}%` }} title={`Pitta ${result.pittaScore * 20}%`} />
                <div className="bg-sky-600 h-full" style={{ width: `${result.vataScore * 20}%` }} title={`Vata ${result.vataScore * 20}%`} />
                <div className="bg-emerald-600 h-full" style={{ width: `${result.kaphaScore * 20}%` }} title={`Kapha ${result.kaphaScore * 20}%`} />
              </>
            ) : (
              <div className="bg-ivory-dark h-full w-full" />
            )}
          </div>
          <p className="text-[11px] text-charcoal-muted pt-1 border-t border-ivory-dark">
            {isCompleted ? 'View Prakriti breakdown →' : 'Start your assessment →'}
          </p>
        </div>

        {/* Card 3: Target Condition */}
        <div
          onClick={() => setActiveTab(isCompleted ? 'disease-diet' : 'profile')}
          className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-ayur hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">Target Condition</span>
            <div className="p-2 rounded-xl bg-sage-light text-forest group-hover:scale-110 transition-transform">
              <Utensils className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-serif font-bold text-forest">
              {disease || 'General Wellness'}
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isCompleted ? 'bg-amber-100 text-amber-900' : 'bg-sage-light text-forest'
            }`}>
              {isCompleted ? `${prakriti || 'Ayurvedic'}-Pacifying Menu` : 'Awaiting Assessment'}
            </span>
          </div>

          <p className="text-[11px] text-charcoal-muted pt-2 border-t border-ivory-dark flex items-center justify-between">
            <span>{isCompleted ? 'View Therapeutic Plan' : 'Configure Health Profile'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-forest group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Card 4: Women's Health Module */}
        <div
          onClick={() => setActiveTab('womens-health')}
          className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-ayur hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">Women's Health</span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-700 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-serif font-bold text-forest">
              {isCompleted && profile?.gender === 'FEMALE' ? 'Targeted Protocol' : 'Holistic Protocol'}
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-900 text-[10px] font-bold">
              {isCompleted && profile?.gender === 'FEMALE' ? 'Dosha Aligned' : 'Customizable'}
            </span>
          </div>

          <p className="text-[11px] text-charcoal-muted pt-2 border-t border-ivory-dark flex items-center justify-between">
            <span>View Health Protocols</span>
            <ChevronRight className="w-3.5 h-3.5 text-forest group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

      </div>

      {/* 3. TODAY'S MEAL SCHEDULE (Filtered strictly to 1 Day & Tailored to Dosha) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-serif font-bold text-forest">Today's Therapeutic Meal Schedule</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-forest text-white text-[10px] font-bold tracking-wide">
                {prakriti} Constitution
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Therapeutic daily meals strictly formulated for your <strong className="text-forest font-semibold">{prakriti}</strong> Prakriti &amp; digestive fire (Jatharagni).
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab('disease-diet')}
              className="text-xs font-bold text-forest hover:text-sage transition-colors flex items-center space-x-1"
            >
              <span>Full Diet Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Day Selector Pill Tabs to prevent 1-week clutter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold text-charcoal-muted shrink-0">
            <Calendar className="w-3.5 h-3.5 text-forest" />
            <span>Schedule Day:</span>
          </div>
          {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
            const isDayActive = activeDay === dayNum;
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setActiveDay(dayNum)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isDayActive
                    ? 'bg-forest text-white shadow-sm'
                    : 'bg-white text-charcoal hover:bg-sage-light border border-ivory-dark'
                }`}
              >
                <span>{dayNum === 1 ? 'Day 1 (Today)' : `Day ${dayNum}`}</span>
              </button>
            );
          })}
        </div>

        {/* Focused 4-Card Daily Meal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {todaysMeals.map((meal) => {
            const imgUrl = getFoodImage(meal.recipeTitle);
            return (
              <div
                key={meal.id}
                className="bg-white rounded-2xl border border-ivory-dark shadow-ayur hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Visual Thumbnail (PRICE REMOVED) */}
                <div className="relative h-44 w-full overflow-hidden bg-ivory">
                  <img
                    src={imgUrl}
                    alt={meal.recipeTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-forest uppercase tracking-wider border border-white/40 shadow-sm">
                    {meal.mealType}
                  </div>
                  <div className="absolute top-3 right-3 bg-forest/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    ✓ {prakriti} Pacifying
                  </div>
                </div>

                {/* Card Copy */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-forest text-sm line-clamp-1 group-hover:text-sage transition-colors">
                      {meal.recipeTitle}
                    </h3>
                    <p className="text-[11px] text-charcoal-muted line-clamp-2 mt-1 leading-snug">
                      {meal.recipeDescription}
                    </p>
                  </div>

                  {/* Nutritional & Ayurvedic Tags */}
                  <div className="space-y-2 pt-2 border-t border-ivory-dark">
                    <div className="flex items-center justify-between text-[11px] text-charcoal font-medium">
                      <span>🔥 {meal.calories} kcal</span>
                      <span>💪 Protein {meal.protein}g</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-sage-light text-forest text-[10px] font-semibold">
                        ✓ {prakriti} Aligned
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-semibold">
                        ✓ Agni Friendly
                      </span>
                    </div>
                  </div>

                  {/* View Recipe Button with Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setSelectedRecipeMeal(meal)}
                    className="w-full py-2.5 rounded-xl bg-ivory text-forest font-bold text-xs hover:bg-forest hover:text-white active:scale-95 transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer border border-ivory-dark group/btn"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-forest group-hover/btn:text-gold transition-colors" />
                    <span>View Recipe</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TODAY'S NUTRIENT BALANCE SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur space-y-4">
        <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
          <div>
            <h3 className="font-serif font-bold text-forest text-lg flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-sage" />
              <span>Today's Nutrient Balance vs. RDA Thresholds</span>
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Micronutrient calculation from today's active meal schedule.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs font-bold text-forest hover:text-sage transition-colors"
          >
            ML Gap Analysis →
          </button>
        </div>

        {/* Progress Bars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {nutrients.map((n, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-forest">{n.name}</span>
                <div className="space-x-2">
                  <span className="text-charcoal-muted font-mono">{n.percent}% RDA</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                    n.status === 'Needs Attention' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {n.status}
                  </span>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="w-full bg-ivory rounded-full h-2 overflow-hidden border border-ivory-dark">
                <div
                  className={`h-full ${n.color} transition-all duration-1000 rounded-full`}
                  style={{ width: `${n.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Explanation Summary */}
        <div className="p-3.5 rounded-xl bg-sage-light/60 border border-sage/20 text-xs text-forest leading-relaxed">
          {isCompleted ? (
            <>💡 <strong>Nutritional Intake Insight:</strong> Your current meal plan provides optimal dietary fiber (91%) and calcium (88%). Vitamin B12 (51%) and Vitamin D (42%) require attention. Incorporating A2 Ghee and morning sunbathing is recommended.</>
          ) : (
            <>💡 <strong>Nutritional Intake Insight:</strong> Real-time micronutrient tracking and RDA threshold analysis will activate once your personalized Ayurvedic profile and meal plan are calculated.</>
          )}
        </div>
      </div>

      {/* 5. PERSONALIZED FOR YOU RECOMMENDATIONS */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-forest text-lg">Personalized For You</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((rec, idx) => {
            const Icon = rec.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(rec.tab)}
                className="bg-white p-4 rounded-2xl border border-ivory-dark shadow-ayur hover:shadow-md transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-sage-light text-forest group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="bg-ivory text-charcoal-muted px-2 py-0.5 rounded text-[10px] font-bold">
                    {rec.badge}
                  </span>
                </div>

                <h4 className="font-bold text-forest text-sm group-hover:text-sage transition-colors">{rec.title}</h4>
                <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">{rec.desc}</p>
                
                <span className="text-[11px] font-bold text-forest inline-flex items-center space-x-1 pt-1">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. DINACHARYA TIP & ACTIVE REMINDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Dinacharya Tip */}
        <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Daily Ayurvedic Dinacharya Tip</span>
              </span>
              <span className="text-[10px] text-charcoal-muted">Bhavaprakasha Nighantu</span>
            </div>

            <h3 className="font-serif font-bold text-forest text-base pt-1">
              {isCompleted ? `Mid-Day ${prakriti || 'Dosha'} Pacification Rule` : 'Classical Ayurvedic Dinacharya Guideline'}
            </h3>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              {isCompleted
                ? '"Consume your primary substantial meal between 12:00 PM and 1:30 PM when the sun and digestive fire (Jatharagni) are at peak strength. Avoid drinking iced water immediately after meals to maintain digestive Agni."'
                : '"In Ayurveda, aligning daily habits with the biological clock (Dinacharya) supports natural vitality. Waking before sunrise (Brahma Muhurta) and honoring your digestive fire (Agni) form the foundation of health."'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('seasonal')}
            className="w-full py-2.5 rounded-xl bg-ivory text-forest font-bold text-xs hover:bg-sage-light transition-all flex items-center justify-center space-x-1.5 border border-ivory-dark"
          >
            <span>Learn More About Sharad Ritucharya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Reminders Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur space-y-4">
          <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
            <h3 className="font-serif font-bold text-forest text-base flex items-center space-x-2">
              <Clock className="w-4 h-4 text-sage" />
              <span>Today's Wellness Timeline & Reminders</span>
            </h3>
            <button
              onClick={() => setActiveTab('reminders')}
              className="text-xs font-bold text-forest hover:text-sage transition-colors"
            >
              Manage →
            </button>
          </div>

          <div className="space-y-3">
            {schedule.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-ivory/60 border border-ivory-dark hover:bg-sage-light/40 transition-all text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <span className="font-mono text-sage font-bold mr-2">{item.time}</span>
                    <span className="font-semibold text-forest">{item.title}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  item.status === 'Next Up' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 7. FLOATING AI AYURWELL ASSISTANT WIDGET */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setActiveTab('ai-assistant')}
          className="bg-forest hover:bg-forest-light text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center space-x-2.5 transform hover:scale-105 transition-all group border-2 border-gold/40"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask AI Assistant</span>
        </button>
      </div>

      {/* 8. INTERACTIVE RECIPE MODAL (Triggered when user clicks 'View Recipe') */}
      {selectedRecipeMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-ivory-dark overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Frame */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-ivory shrink-0">
              <img
                src={getFoodImage(selectedRecipeMeal.recipeTitle)}
                alt={selectedRecipeMeal.recipeTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-forest/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/20">
                      {selectedRecipeMeal.mealType}
                    </span>
                    <span className="bg-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold text-[#143D32] shadow-sm">
                      ✓ {prakriti} Pacifying
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRecipeMeal(null)}
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                    title="Close recipe"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white drop-shadow-md">
                    {selectedRecipeMeal.recipeTitle}
                  </h2>
                  <p className="text-xs text-white/90 line-clamp-2 mt-1 drop-shadow-sm">
                    {selectedRecipeMeal.recipeDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Macro & Micro Nutrition Badges (No Price) */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                <div className="bg-ivory p-2.5 rounded-xl border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Calories</span>
                  <span className="text-sm font-bold text-forest">{selectedRecipeMeal.calories} kcal</span>
                </div>
                <div className="bg-ivory p-2.5 rounded-xl border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Protein</span>
                  <span className="text-sm font-bold text-forest">{selectedRecipeMeal.protein}g</span>
                </div>
                <div className="bg-ivory p-2.5 rounded-xl border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Carbs</span>
                  <span className="text-sm font-bold text-forest">{selectedRecipeMeal.carbs || 45}g</span>
                </div>
                <div className="bg-ivory p-2.5 rounded-xl border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Fiber</span>
                  <span className="text-sm font-bold text-emerald-800">{selectedRecipeMeal.fiber || 6}g</span>
                </div>
                <div className="bg-ivory p-2.5 rounded-xl border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Iron</span>
                  <span className="text-sm font-bold text-amber-800">{selectedRecipeMeal.ironMg || 3.5}mg</span>
                </div>
                <div className="bg-ivory p-2.5 rounded-xl border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Calcium</span>
                  <span className="text-sm font-bold text-forest">{selectedRecipeMeal.calciumMg || 120}mg</span>
                </div>
              </div>

              {/* Classical Ayurvedic Energetics */}
              <div className="bg-sage-light/60 p-4 rounded-2xl border border-sage/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-forest">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Ayurvedic Energetics &amp; Dosha Pharmacology</span>
                </div>
                <p className="text-xs text-charcoal font-medium leading-relaxed">
                  {selectedRecipeMeal.ayurvedicProperties || `Rasa: Madhura, Kashaya | Virya: Ushna (Warm) | Vipaka: Madhura | Dosha: ${prakriti} Pacifying`}
                </p>
                {selectedRecipeMeal.whyRecommended && (
                  <p className="text-[11px] text-charcoal-muted leading-relaxed border-t border-sage/20 pt-2">
                    <strong className="text-forest">Clinical Rationale:</strong> {selectedRecipeMeal.whyRecommended}
                  </p>
                )}
              </div>

              {/* Key Ingredients */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-forest">
                  <Leaf className="w-4 h-4 text-sage" />
                  <span>Key Ayurvedic Ingredients:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedRecipeMeal.keyIngredients && selectedRecipeMeal.keyIngredients.length > 0
                    ? selectedRecipeMeal.keyIngredients
                    : ['Fresh Moong Dal', 'Pure A2 Cow Ghee', 'Cumin Seeds', 'Fresh Turmeric', 'Rock Salt (Saindhava Lavana)', 'Curry Leaves']
                  ).map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-ivory text-charcoal text-xs font-medium border border-ivory-dark flex items-center space-x-1"
                    >
                      <span className="text-sage">•</span>
                      <span>{ing}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Ayurvedic Preparation Guide */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-forest">
                  <ChefHat className="w-4 h-4 text-gold" />
                  <span>Ayurvedic Cooking &amp; Preparation Instructions:</span>
                </div>
                <div className="space-y-2.5">
                  {getRecipeInstructions(selectedRecipeMeal).map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start space-x-3 text-xs text-charcoal leading-relaxed bg-ivory/50 p-3 rounded-xl border border-ivory-dark">
                      <span className="w-5 h-5 rounded-full bg-forest text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-ivory border-t border-ivory-dark flex items-center justify-between shrink-0">
              <span className="text-xs text-charcoal-muted flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-sage" />
                <span>Prep Time: 15–20 mins</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedRecipeMeal(null)}
                className="px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Close Recipe
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
