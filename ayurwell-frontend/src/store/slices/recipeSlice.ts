import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Recipe } from '../../types';

interface RecipeState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  searchQuery: string;
  loading: boolean;
}

const initialState: RecipeState = {
  recipes: [
    {
      id: 1,
      title: 'Tridoshic Moong Dal Khichdi',
      description: 'Light, nourishing, and easily digestible dish made with split yellow moong, basmati rice, and medicinal spices.',
      mealType: 'LUNCH',
      suitableDosha: 'TRIDOSHA',
      suitableSeason: 'VARSHA',
      prepTimeMins: 25,
      costPerServingInr: 45.0,
      calories: 320.0,
      proteinGrams: 14.0,
      carbsGrams: 54.0,
      fatGrams: 6.0,
      ironMg: 4.2,
      instructions: '1. Wash equal parts moong dal and rice.\n2. Heat 1 tbsp A2 Ghee, add cumin seeds, hing, and turmeric.\n3. Add dal, rice, 4 cups water, and rock salt.\n4. Pressure cook for 4 whistles and serve warm.',
      suitableDiseaseConditions: 'GERD, IBS, Diabetes, Hypertension',
      suitableWomensHealthStage: 'PCOS, Pregnancy, Menstruation, Menopause, Anemia'
    },
    {
      id: 2,
      title: 'Calcium-Rich Warm Ragi Porridge',
      description: 'Finger millet cooked in milk or water with cardamom and jaggery, ideal for bone density and iron boosting.',
      mealType: 'BREAKFAST',
      suitableDosha: 'VATA',
      suitableSeason: 'HEMANTA',
      prepTimeMins: 15,
      costPerServingInr: 25.0,
      calories: 220.0,
      proteinGrams: 7.0,
      carbsGrams: 42.0,
      fatGrams: 3.5,
      ironMg: 5.8,
      instructions: '1. Mix 3 tbsp ragi flour with water to make a smooth paste.\n2. Boil 1 cup water/milk, slowly pour the ragi paste while stirring constantly.\n3. Cook for 7 mins, sweeten with raw jaggery and cardamom.',
      suitableDiseaseConditions: 'Hypertension, Osteoporosis',
      suitableWomensHealthStage: 'Anemia, PCOS, Pregnancy, Menopause'
    },
    {
      id: 3,
      title: 'CCF Tea (Cumin, Coriander, Fennel)',
      description: 'Ayurvedic digestive elixir that balances all 3 doshas and promotes detox.',
      mealType: 'EVENING_SNACK',
      suitableDosha: 'TRIDOSHA',
      suitableSeason: 'GRISHMA',
      prepTimeMins: 10,
      costPerServingInr: 10.0,
      calories: 15.0,
      proteinGrams: 0.2,
      carbsGrams: 2.0,
      fatGrams: 0.1,
      ironMg: 1.1,
      instructions: '1. Boil 1/2 tsp each of whole cumin, coriander, and fennel seeds in 3 cups water for 5 minutes.\n2. Strain and sip warm.',
      suitableDiseaseConditions: 'GERD, IBS, Thyroid',
      suitableWomensHealthStage: 'PCOS, Menstruation'
    }
  ],
  selectedRecipe: null,
  searchQuery: '',
  loading: false,
};

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
    },
    setSelectedRecipe: (state, action: PayloadAction<Recipe | null>) => {
      state.selectedRecipe = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setRecipes, setSelectedRecipe, setSearchQuery } = recipeSlice.actions;
export default recipeSlice.reducer;
