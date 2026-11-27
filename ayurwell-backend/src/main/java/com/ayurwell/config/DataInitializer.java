package com.ayurwell.config;

import com.ayurwell.entity.*;
import com.ayurwell.enums.DoshaType;
import com.ayurwell.enums.MealType;
import com.ayurwell.enums.RituSeason;
import com.ayurwell.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final FoodItemRepository foodItemRepository;
    private final RawFoodCompositionRepository rawFoodRepository;
    private final AyurvedicFoodProfileRepository ayurvedicProfileRepository;
    private final ViruddhaCombinationRepository viruddhaCombinationRepository;
    private final RecipeRepository recipeRepository;
    private final ReminderRepository reminderRepository;
    private final DoshaAssessmentRepository doshaAssessmentRepository;
    private final MealPlanRepository mealPlanRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           UserProfileRepository userProfileRepository,
                           FoodItemRepository foodItemRepository,
                           RawFoodCompositionRepository rawFoodRepository,
                           AyurvedicFoodProfileRepository ayurvedicProfileRepository,
                           ViruddhaCombinationRepository viruddhaCombinationRepository,
                           RecipeRepository recipeRepository,
                           ReminderRepository reminderRepository,
                           DoshaAssessmentRepository doshaAssessmentRepository,
                           MealPlanRepository mealPlanRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.foodItemRepository = foodItemRepository;
        this.rawFoodRepository = rawFoodRepository;
        this.ayurvedicProfileRepository = ayurvedicProfileRepository;
        this.viruddhaCombinationRepository = viruddhaCombinationRepository;
        this.recipeRepository = recipeRepository;
        this.reminderRepository = reminderRepository;
        this.doshaAssessmentRepository = doshaAssessmentRepository;
        this.mealPlanRepository = mealPlanRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (foodItemRepository.count() == 0) {
            seedFoodItems();
            seedViruddhaCombinations();
            seedRecipes();
        }

        seedNormalizedIfctDatasetIdempotent();

        if (!userRepository.existsByEmail("demo@ayurwell.com")) {
            seedDemoUser();
        }
    }

    private void saveIfctItemIfAbsent(String code, String name, String category, String serving,
                                     Double kcal, Double p, Double c, Double f, Double fiber,
                                     Double fe, Double ca, Double b12, Double d, Double folate, Double vitC,
                                     String sanskrit, String rasa, String virya, String vipaka,
                                     String dosha, String seasons, String textRef) {
        if (rawFoodRepository.findByFoodCode(code).isPresent()) {
            return;
        }

        String ifctSource = "ICMR-NIN Indian Food Composition Tables (IFCT 2017)";

        RawFoodComposition raw = RawFoodComposition.builder()
                .foodCode(code)
                .foodName(name)
                .category(category)
                .datasetSource(ifctSource)
                .servingSize(serving)
                .energyKcal(kcal)
                .proteinGrams(p)
                .carbsGrams(c)
                .fatGrams(f)
                .fiberGrams(fiber)
                .ironMg(fe)
                .calciumMg(ca)
                .vitaminB12Mcg(b12)
                .vitaminDIu(d)
                .folateMcg(folate)
                .vitaminCMg(vitC)
                .build();

        if (sanskrit != null || rasa != null) {
            AyurvedicFoodProfile ayur = AyurvedicFoodProfile.builder()
                    .rawFood(raw)
                    .sanskritName(sanskrit)
                    .rasa(rasa)
                    .virya(virya)
                    .vipaka(vipaka)
                    .doshaEffect(dosha)
                    .suitableRituSeasons(seasons)
                    .classicalTextReference(textRef)
                    .build();
            raw.setAyurvedicProfile(ayur);
        }

        rawFoodRepository.save(raw);
    }

    private void seedNormalizedIfctDatasetIdempotent() {
        String classicalText = "Bhavaprakasha Nighantu & Charaka Samhita";

        // 1. CEREALS & MILLETS
        saveIfctItemIfAbsent("IFCT-A001", "Whole Wheat (Atta)", "Cereal", "100g", 346.0, 11.8, 71.2, 1.5, 12.5, 5.3, 41.0, 0.0, 0.0, 36.6, 0.0, "Godhuma", "Sweet (Madhura)", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K+", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-A002", "Parboiled Basmati Rice", "Cereal", "100g", 350.0, 7.5, 78.2, 0.5, 2.8, 1.0, 10.0, 0.0, 0.0, 8.0, 0.0, "Shali Dhanya", "Sweet (Madhura)", "Cooling (Shita)", "Sweet (Madhura)", "V= P- K=", "Varsha, Sharad", classicalText);
        saveIfctItemIfAbsent("IFCT-A003", "Pearl Millet (Bajra)", "Cereal", "100g", 361.0, 11.6, 67.5, 5.0, 11.5, 8.0, 42.0, 0.0, 0.0, 45.5, 0.0, "Nali / Bajra", "Sweet/Astringent", "Heating (Ushna)", "Pungent (Katu)", "V- P+ K-", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-A004", "Sorghum (Jowar)", "Cereal", "100g", 349.0, 10.4, 72.6, 1.9, 10.2, 4.1, 25.0, 0.0, 0.0, 20.0, 0.0, "Yavanala", "Sweet/Astringent", "Cooling (Shita)", "Pungent (Katu)", "V+ P- K-", "Grishma, Sharad", classicalText);
        saveIfctItemIfAbsent("IFCT-A005", "Finger Millet (Ragi)", "Cereal", "100g", 336.0, 7.3, 72.0, 1.3, 11.5, 3.9, 344.0, 0.0, 0.0, 18.3, 0.0, "Ragi / Rajika", "Sweet/Astringent", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K+", "Vasanta, Hemanta", classicalText);
        saveIfctItemIfAbsent("IFCT-A008", "Barley (Jav)", "Cereal", "100g", 354.0, 12.5, 73.5, 2.3, 17.3, 3.6, 33.0, 0.0, 0.0, 19.0, 0.0, "Yava", "Sweet/Astringent", "Cooling (Shita)", "Pungent (Katu)", "V+ P- K-", "Vasanta, Grishma", classicalText);

        // 2. PULSES & LEGUMES
        saveIfctItemIfAbsent("IFCT-B001", "Yellow Moong Dal (Split)", "Pulse", "100g", 348.0, 24.5, 59.9, 1.2, 8.2, 3.9, 75.0, 0.0, 0.0, 140.0, 0.0, "Mudga", "Sweet/Astringent", "Cooling (Shita)", "Sweet (Madhura)", "V= P- K-", "Varsha, Sharad, Vasanta", classicalText);
        saveIfctItemIfAbsent("IFCT-B002", "Bengal Gram (Chana)", "Pulse", "100g", 360.0, 17.1, 60.9, 5.3, 25.2, 4.6, 56.0, 0.0, 0.0, 186.0, 0.0, "Chanaka", "Sweet/Astringent", "Cooling (Shita)", "Pungent (Katu)", "V+ P- K-", "Vasanta, Grishma", classicalText);
        saveIfctItemIfAbsent("IFCT-B003", "Black Gram (Urad Dal)", "Pulse", "100g", 341.0, 25.2, 59.6, 1.4, 18.3, 7.5, 130.0, 0.0, 0.0, 132.0, 0.0, "Masha", "Sweet (Madhura)", "Heating (Ushna)", "Sweet (Madhura)", "V- P+ K+", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-B004", "Red Gram (Tur Dal)", "Pulse", "100g", 335.0, 22.3, 62.1, 1.7, 15.0, 5.2, 73.0, 0.0, 0.0, 103.0, 0.0, "Adhaki", "Sweet/Astringent", "Cooling (Shita)", "Katu (Pungent)", "V+ P- K-", "Vasanta, Sharad", classicalText);
        saveIfctItemIfAbsent("IFCT-B005", "Kidney Beans (Rajma)", "Pulse", "100g", 346.0, 22.9, 60.6, 1.3, 24.9, 5.1, 138.0, 0.0, 0.0, 394.0, 0.0, "Rajamasha", "Sweet/Astringent", "Cooling (Shita)", "Sweet (Madhura)", "V+ P- K+", "Hemanta", classicalText);

        // 3. GREEN LEAFY VEGETABLES
        saveIfctItemIfAbsent("IFCT-C001", "Fenugreek Leaves (Methi)", "Green Leafy Veg", "100g", 49.0, 4.4, 6.0, 0.9, 4.9, 6.5, 395.0, 0.0, 0.0, 84.0, 52.0, "Methika", "Bitter (Tikta)", "Heating (Ushna)", "Pungent (Katu)", "V- P+ K-", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-C002", "Spinach (Palak)", "Green Leafy Veg", "100g", 26.0, 2.0, 2.9, 0.7, 2.5, 1.1, 73.0, 0.0, 0.0, 142.0, 28.0, "Palankya", "Astringent/Bitter", "Cooling (Shita)", "Pungent (Katu)", "V+ P- K-", "Vasanta, Hemanta", classicalText);
        saveIfctItemIfAbsent("IFCT-C003", "Coriander Leaves", "Green Leafy Veg", "100g", 31.0, 3.3, 3.7, 0.6, 4.4, 1.4, 91.0, 0.0, 0.0, 95.0, 135.0, "Dhaniyaka Patra", "Astringent/Sweet", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K-", "Grishma, Sharad", classicalText);

        // 4. OTHER VEGETABLES
        saveIfctItemIfAbsent("IFCT-C005", "Bottle Gourd (Lauki)", "Vegetable", "100g", 15.0, 0.6, 3.4, 0.1, 0.6, 0.2, 26.0, 0.0, 0.0, 6.0, 10.1, "Alabu", "Sweet (Madhura)", "Cooling (Shita)", "Sweet (Madhura)", "V= P- K-", "Grishma, Varsha", classicalText);
        saveIfctItemIfAbsent("IFCT-C009", "Bitter Gourd (Karela)", "Vegetable", "100g", 17.0, 1.0, 3.7, 0.1, 2.8, 0.4, 19.0, 0.0, 0.0, 72.0, 84.0, "Karavella", "Bitter (Tikta)", "Heating (Ushna)", "Pungent (Katu)", "V+ P- K-", "Varsha, Sharad", classicalText);
        saveIfctItemIfAbsent("IFCT-C012", "Beetroot", "Vegetable", "100g", 43.0, 1.6, 9.6, 0.2, 2.8, 0.8, 16.0, 0.0, 0.0, 109.0, 4.9, "Palandu-Vesha", "Sweet (Madhura)", "Cooling (Shita)", "Sweet (Madhura)", "V- P= K+", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-C015", "Carrot (Gajar)", "Vegetable", "100g", 48.0, 0.9, 10.6, 0.2, 4.4, 1.0, 34.0, 0.0, 0.0, 19.0, 3.0, "Gunjana", "Sweet/Pungent", "Heating (Ushna)", "Madhura", "V- P+ K-", "Hemanta, Shishira", classicalText);

        // 5. FRUITS
        saveIfctItemIfAbsent("IFCT-D001", "Pomegranate (Anar)", "Fruit", "100g", 83.0, 1.7, 18.7, 1.2, 4.0, 0.3, 10.0, 0.0, 0.0, 38.0, 10.2, "Dadima", "Sweet/Sour", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K-", "Sharad, Vasanta", classicalText);
        saveIfctItemIfAbsent("IFCT-D004", "Indian Gooseberry (Amla)", "Fruit", "100g", 44.0, 0.9, 10.1, 0.6, 4.3, 1.2, 25.0, 0.0, 0.0, 6.0, 600.0, "Amalaki", "Sour/5-Tastes", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K-", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-D007", "Raw Papaya", "Fruit", "100g", 32.0, 0.6, 7.2, 0.1, 2.6, 0.4, 24.0, 0.0, 0.0, 37.0, 57.0, "Erandakarkati", "Pungent/Bitter", "Heating (Ushna)", "Pungent (Katu)", "V- P+ K-", "Vasanta", classicalText);
        saveIfctItemIfAbsent("IFCT-D010", "Soaked Black Raisins", "Fruit", "100g", 299.0, 3.1, 79.0, 0.5, 3.7, 1.9, 50.0, 0.0, 0.0, 5.0, 2.3, "Draksha", "Sweet (Madhura)", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K=", "Grishma, Sharad", classicalText);

        // 6. NUTS & SEEDS
        saveIfctItemIfAbsent("IFCT-G001", "White Sesame Seeds (Til)", "Nut/Seed", "100g", 573.0, 17.7, 23.4, 49.7, 11.8, 14.6, 975.0, 0.0, 0.0, 97.0, 0.0, "Tila", "Sweet/Bitter", "Heating (Ushna)", "Sweet (Madhura)", "V- P+ K+", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-G002", "Almonds (Soaked)", "Nut/Seed", "100g", 579.0, 21.2, 21.6, 49.9, 12.5, 3.7, 269.0, 0.0, 0.0, 44.0, 0.0, "Vatama", "Sweet (Madhura)", "Heating (Ushna)", "Sweet (Madhura)", "V- P= K+", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-G004", "Peanuts (Groundnut)", "Nut/Seed", "100g", 567.0, 25.8, 16.1, 49.2, 8.5, 4.6, 92.0, 0.0, 0.0, 240.0, 0.0, "Mundabi", "Sweet (Madhura)", "Heating (Ushna)", "Sweet (Madhura)", "V- P+ K+", "Hemanta", classicalText);

        // 7. MILK & DAIRY
        saveIfctItemIfAbsent("IFCT-E001", "Whole Cow Milk", "Milk Product", "100g", 72.0, 3.2, 4.4, 4.1, 0.0, 0.1, 118.0, 0.4, 40.0, 5.0, 1.5, "Ksheera / Gavyam", "Sweet (Madhura)", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K+", "Hemanta, Shishira, Grishma", classicalText);
        saveIfctItemIfAbsent("IFCT-E003", "Fresh Curd (Dahi)", "Milk Product", "100g", 98.0, 3.5, 4.7, 4.3, 0.0, 0.1, 121.0, 0.4, 10.0, 7.0, 0.5, "Dahi / Dadhi", "Sour (Amla)", "Heating (Ushna)", "Sour (Amla)", "V- P+ K+", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-E005", "Paneer (Cottage Cheese)", "Milk Product", "100g", 265.0, 18.3, 3.2, 20.8, 0.0, 0.2, 480.0, 0.8, 0.0, 12.0, 0.0, "Takrapindaka", "Sweet (Madhura)", "Cooling (Shita)", "Sweet (Madhura)", "V- P= K+", "Hemanta", classicalText);

        // 8. OIL & FATS
        saveIfctItemIfAbsent("IFCT-F001", "Cow Milk Ghee", "Oil/Fat", "100g", 899.0, 0.0, 0.0, 99.5, 0.0, 0.0, 2.0, 0.0, 15.0, 0.0, 0.0, "Ghrita", "Sweet (Madhura)", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K=", "Sharad, Hemanta, Grishma", classicalText);
        saveIfctItemIfAbsent("IFCT-F002", "Sesame Oil", "Oil/Fat", "100g", 884.0, 0.0, 0.0, 100.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "Tila Taila", "Sweet/Bitter", "Heating (Ushna)", "Sweet (Madhura)", "V- P+ K=", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-F003", "Mustard Oil", "Oil/Fat", "100g", 884.0, 0.0, 0.0, 100.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "Sarshapa Taila", "Pungent (Katu)", "Heating (Ushna)", "Pungent (Katu)", "V- P+ K-", "Hemanta, Shishira", classicalText);

        // 9. SPICES & CONDIMENTS
        saveIfctItemIfAbsent("IFCT-H001", "Cumin Seeds (Jeera)", "Spice", "100g", 375.0, 17.8, 44.2, 22.3, 10.5, 66.4, 931.0, 0.0, 0.0, 10.0, 7.7, "Jiraka", "Pungent (Katu)", "Heating (Ushna)", "Pungent (Katu)", "V- P= K-", "Varsha, Sharad", classicalText);
        saveIfctItemIfAbsent("IFCT-H002", "Coriander Seeds (Dhania)", "Spice", "100g", 298.0, 12.4, 54.9, 17.8, 41.9, 16.3, 709.0, 0.0, 0.0, 0.0, 21.0, "Dhaniyaka", "Sweet/Astringent", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K-", "Grishma, Sharad", classicalText);
        saveIfctItemIfAbsent("IFCT-H003", "Fennel Seeds (Saunf)", "Spice", "100g", 345.0, 15.8, 52.3, 14.9, 39.8, 18.5, 1196.0, 0.0, 0.0, 0.0, 21.0, "Shatapushpa", "Sweet/Pungent", "Cooling (Shita)", "Sweet (Madhura)", "V- P- K-", "Grishma, Sharad", classicalText);
        saveIfctItemIfAbsent("IFCT-H004", "Turmeric Powder (Haldi)", "Spice", "100g", 349.0, 7.8, 69.9, 9.9, 21.1, 41.4, 183.0, 0.0, 0.0, 0.0, 25.9, "Haridra", "Bitter/Pungent", "Heating (Ushna)", "Pungent (Katu)", "V- P= K-", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-H005", "Fresh Ginger (Adrak)", "Spice", "100g", 67.0, 2.3, 12.3, 0.9, 2.4, 3.5, 20.0, 0.0, 0.0, 11.0, 6.0, "Ardraka", "Pungent (Katu)", "Heating (Ushna)", "Madhura", "V- P+ K-", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-H006", "Raw Jaggery (Gur)", "Sweetener", "100g", 383.0, 0.4, 98.0, 0.1, 0.0, 11.0, 80.0, 0.0, 0.0, 1.0, 0.0, "Guda", "Sweet (Madhura)", "Heating (Ushna)", "Sweet (Madhura)", "V- P+ K+", "Hemanta, Shishira", classicalText);
        saveIfctItemIfAbsent("IFCT-H007", "Pure Raw Honey", "Sweetener", "100g", 304.0, 0.3, 82.4, 0.0, 0.2, 0.4, 6.0, 0.0, 0.0, 2.0, 0.5, "Madhu", "Sweet/Astringent", "Heating (Ushna)", "Pungent (Katu)", "V= P= K-", "Vasanta, Varsha", classicalText);
    }

    private void seedFoodItems() {
        FoodItem milk = FoodItem.builder()
                .name("Warm Cow Milk")
                .category("Dairy")
                .rasa("Sweet")
                .virya("Cooling (Shita)")
                .vipaka("Madhura (Sweet)")
                .doshaEffect("V- P- K+")
                .calories(150.0)
                .proteinGrams(8.0)
                .carbsGrams(12.0)
                .fatGrams(8.0)
                .ironMg(0.1)
                .calciumMg(300.0)
                .fiberGrams(0.0)
                .estimatedCostInr(30.0)
                .build();

        FoodItem fish = FoodItem.builder()
                .name("Freshwater Fish")
                .category("Non-Veg/Protein")
                .rasa("Salty/Sweet")
                .virya("Heating (Ushna)")
                .vipaka("Madhura")
                .doshaEffect("V- P+ K+")
                .calories(200.0)
                .proteinGrams(22.0)
                .carbsGrams(0.0)
                .fatGrams(12.0)
                .ironMg(1.2)
                .calciumMg(40.0)
                .fiberGrams(0.0)
                .estimatedCostInr(120.0)
                .build();

        FoodItem honey = FoodItem.builder()
                .name("Pure Raw Honey")
                .category("Sweetener")
                .rasa("Sweet/Astringent")
                .virya("Heating (Ushna)")
                .vipaka("Katu (Pungent)")
                .doshaEffect("V= P= K-")
                .calories(64.0)
                .proteinGrams(0.1)
                .carbsGrams(17.0)
                .fatGrams(0.0)
                .ironMg(0.4)
                .calciumMg(6.0)
                .fiberGrams(0.0)
                .estimatedCostInr(15.0)
                .build();

        FoodItem ghee = FoodItem.builder()
                .name("A2 Cow Ghee")
                .category("Oil/Fat")
                .rasa("Sweet")
                .virya("Cooling (Shita)")
                .vipaka("Madhura")
                .doshaEffect("V- P- K=")
                .calories(120.0)
                .proteinGrams(0.0)
                .carbsGrams(0.0)
                .fatGrams(14.0)
                .ironMg(0.0)
                .calciumMg(2.0)
                .fiberGrams(0.0)
                .estimatedCostInr(25.0)
                .build();

        FoodItem spinach = FoodItem.builder()
                .name("Fresh Spinach (Palak)")
                .category("Vegetable")
                .rasa("Astringent/Bitter")
                .virya("Cooling (Shita)")
                .vipaka("Katu (Pungent)")
                .doshaEffect("V+ P- K-")
                .calories(23.0)
                .proteinGrams(2.9)
                .carbsGrams(3.6)
                .fatGrams(0.4)
                .ironMg(2.7)
                .calciumMg(99.0)
                .fiberGrams(2.2)
                .estimatedCostInr(15.0)
                .build();

        FoodItem moongDal = FoodItem.builder()
                .name("Yellow Moong Dal")
                .category("Pulse")
                .rasa("Sweet/Astringent")
                .virya("Cooling (Shita)")
                .vipaka("Madhura")
                .doshaEffect("V= P- K-")
                .calories(150.0)
                .proteinGrams(12.0)
                .carbsGrams(26.0)
                .fatGrams(0.8)
                .ironMg(3.5)
                .calciumMg(45.0)
                .fiberGrams(8.0)
                .estimatedCostInr(20.0)
                .build();

        FoodItem hotWater = FoodItem.builder()
                .name("Boiled Warm Water")
                .category("Beverage")
                .rasa("Neutral")
                .virya("Heating (Ushna)")
                .vipaka("Neutral")
                .doshaEffect("V- P- K-")
                .calories(0.0)
                .proteinGrams(0.0)
                .carbsGrams(0.0)
                .fatGrams(0.0)
                .ironMg(0.0)
                .calciumMg(0.0)
                .fiberGrams(0.0)
                .estimatedCostInr(1.0)
                .build();

        foodItemRepository.saveAll(List.of(milk, fish, honey, ghee, spinach, moongDal, hotWater));
    }

    private void seedViruddhaCombinations() {
        FoodItem milk = foodItemRepository.findByNameIgnoreCase("Warm Cow Milk").orElse(null);
        FoodItem fish = foodItemRepository.findByNameIgnoreCase("Freshwater Fish").orElse(null);
        FoodItem honey = foodItemRepository.findByNameIgnoreCase("Pure Raw Honey").orElse(null);
        FoodItem ghee = foodItemRepository.findByNameIgnoreCase("A2 Cow Ghee").orElse(null);
        FoodItem hotWater = foodItemRepository.findByNameIgnoreCase("Boiled Warm Water").orElse(null);

        if (milk != null && fish != null) {
            ViruddhaCombination milkFish = ViruddhaCombination.builder()
                    .foodA(milk)
                    .foodB(fish)
                    .incompatibilityType("Virya-Viruddha (Potency Conflict)")
                    .healthHazardReason("Milk is Shita (Cooling) while Fish is Ushna (Heating). Combining them obstructs body channels (Srotas) and causes skin toxins (Kustha).")
                    .antidoteRecommendation("Consume warm ginger tea or neem water if accidentally ingested.")
                    .build();
            viruddhaCombinationRepository.save(milkFish);
        }

        if (honey != null && hotWater != null) {
            ViruddhaCombination honeyHotWater = ViruddhaCombination.builder()
                    .foodA(honey)
                    .foodB(hotWater)
                    .incompatibilityType("Sanskard-Viruddha (Processing Incompatibility)")
                    .healthHazardReason("Heating honey above 40°C converts its natural fructose into toxic compounds (Ama) that adhere to digestive walls.")
                    .antidoteRecommendation("Mix honey only in lukewarm water (below body temperature).")
                    .build();
            viruddhaCombinationRepository.save(honeyHotWater);
        }

        if (honey != null && ghee != null) {
            ViruddhaCombination honeyGhee = ViruddhaCombination.builder()
                    .foodA(honey)
                    .foodB(ghee)
                    .incompatibilityType("Matra-Viruddha (Equal Proportion Conflict)")
                    .healthHazardReason("Honey and Ghee mixed in equal 1:1 weight proportion act as a subtle poison due to opposing cellular actions.")
                    .antidoteRecommendation("Always consume in unequal proportions (e.g. 2 parts Ghee to 1 part Honey).")
                    .build();
            viruddhaCombinationRepository.save(honeyGhee);
        }
    }

    private void seedRecipes() {
        Recipe khichdi = Recipe.builder()
                .title("Tridoshic Moong Dal Khichdi")
                .description("Light, nourishing, and easily digestible dish made with split yellow moong, basmati rice, and medicinal spices.")
                .mealType(MealType.LUNCH)
                .suitableDosha(DoshaType.TRIDOSHA)
                .suitableSeason(RituSeason.VARSHA)
                .prepTimeMins(25)
                .costPerServingInr(45.0)
                .calories(320.0)
                .proteinGrams(14.0)
                .carbsGrams(54.0)
                .fatGrams(6.0)
                .ironMg(4.2)
                .instructions("1. Wash equal parts moong dal and rice.\n2. Heat 1 tbsp A2 Ghee, add cumin seeds, hing, and turmeric.\n3. Add dal, rice, 4 cups water, and rock salt.\n4. Pressure cook for 4 whistles and serve warm.")
                .suitableDiseaseConditions("GERD, IBS, Diabetes, Hypertension")
                .suitableWomensHealthStage("PCOS, Pregnancy, Menstruation, Menopause, Anemia")
                .build();

        Recipe ragiPorridge = Recipe.builder()
                .title("Calcium-Rich Warm Ragi Porridge")
                .description("Finger millet cooked in milk or water with cardamom and jaggery, ideal for bone density and iron boosting.")
                .mealType(MealType.BREAKFAST)
                .suitableDosha(DoshaType.VATA)
                .suitableSeason(RituSeason.HEMANTA)
                .prepTimeMins(15)
                .costPerServingInr(25.0)
                .calories(220.0)
                .proteinGrams(7.0)
                .carbsGrams(42.0)
                .fatGrams(3.5)
                .ironMg(5.8)
                .instructions("1. Mix 3 tbsp ragi flour with water to make a smooth paste.\n2. Boil 1 cup water/milk, slowly pour the ragi paste while stirring constantly.\n3. Cook for 7 mins, sweeten with raw jaggery and cardamom.")
                .suitableDiseaseConditions("Hypertension, Osteoporosis")
                .suitableWomensHealthStage("Anemia, PCOS, Pregnancy, Menopause")
                .build();

        Recipe herbalTea = Recipe.builder()
                .title("CCF Tea (Cumin, Coriander, Fennel)")
                .description("Ayurvedic digestive elixir that balances all 3 doshas and promotes detox.")
                .mealType(MealType.EVENING_SNACK)
                .suitableDosha(DoshaType.TRIDOSHA)
                .suitableSeason(RituSeason.GRISHMA)
                .prepTimeMins(10)
                .costPerServingInr(10.0)
                .calories(15.0)
                .proteinGrams(0.2)
                .carbsGrams(2.0)
                .fatGrams(0.1)
                .ironMg(1.1)
                .instructions("1. Boil 1/2 tsp each of whole cumin, coriander, and fennel seeds in 3 cups water for 5 minutes.\n2. Strain and sip warm.")
                .suitableDiseaseConditions("GERD, IBS, Thyroid")
                .suitableWomensHealthStage("PCOS, Menstruation")
                .build();

        recipeRepository.saveAll(List.of(khichdi, ragiPorridge, herbalTea));
    }

    private void seedDemoUser() {
        User demoUser = User.builder()
                .email("demo@ayurwell.com")
                .password(passwordEncoder.encode("Password123!"))
                .fullName("AyurWell Demo Practitioner")
                .role("ROLE_USER")
                .active(true)
                .build();

        User savedUser = userRepository.save(demoUser);

        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .age(28)
                .gender("FEMALE")
                .weightKg(62.0)
                .heightCm(165.0)
                .activityLevel("Moderately Active")
                .budgetPerDayInr(250.0)
                .primaryHealthGoal("Immunity & Hormonal Balance")
                .primaryDosha(DoshaType.PITTA)
                .digestiveFireAgni(com.ayurwell.enums.AgniType.SAMA)
                .targetDiseaseCondition("GERD")
                .profileCompleted(true)
                .build();

        userProfileRepository.save(profile);

        // Seed Demo Dosha Assessment
        DoshaAssessment assessment = DoshaAssessment.builder()
                .user(savedUser)
                .vataScore(4)
                .pittaScore(7)
                .kaphaScore(3)
                .primaryPrakriti(DoshaType.PITTA)
                .secondaryPrakriti(DoshaType.VATA)
                .build();
        doshaAssessmentRepository.save(assessment);

        // Seed Demo Meal Plan
        MealPlan plan = MealPlan.builder()
                .user(savedUser)
                .planName("GERD & Pitta Pacifying Ayurvedic Diet")
                .targetDisease("GERD")
                .season("VASANTA")
                .womensHealthStage("NONE")
                .totalDailyBudgetInr(160.0)
                .totalDailyCalories(1850.0)
                .ayurvedicNutritionScore(92)
                .build();
        mealPlanRepository.save(plan);

        // Seed Default Reminders
        Reminder r1 = Reminder.builder()
                .user(savedUser)
                .title("Ushapan (Morning Warm Water)")
                .reminderTime(LocalTime.of(7, 0))
                .category("HYDRATION")
                .description("Sip 2 glasses of warm water stored in a copper vessel to stimulate Agni.")
                .enabled(true)
                .build();

        Reminder r2 = Reminder.builder()
                .user(savedUser)
                .title("Mid-Day Pitta-Pacifying Meal")
                .reminderTime(LocalTime.of(12, 30))
                .category("MEAL")
                .description("Eat your primary meal when the sun and digestive fire (Agni) are strongest.")
                .enabled(true)
                .build();

        Reminder r3 = Reminder.builder()
                .user(savedUser)
                .title("Evening Herbal CCF Tea")
                .reminderTime(LocalTime.of(17, 30))
                .category("HERBAL_TEA")
                .description("Sip warm cumin-coriander-fennel tea to clear evening metabolic toxins.")
                .enabled(true)
                .build();

        reminderRepository.saveAll(List.of(r1, r2, r3));
    }
}
