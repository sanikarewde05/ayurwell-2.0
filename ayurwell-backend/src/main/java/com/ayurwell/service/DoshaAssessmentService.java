package com.ayurwell.service;

import com.ayurwell.dto.DoshaDTOs.*;
import com.ayurwell.entity.DoshaAssessment;
import com.ayurwell.entity.User;
import com.ayurwell.entity.UserProfile;
import com.ayurwell.enums.DoshaType;
import com.ayurwell.repository.DoshaAssessmentRepository;
import com.ayurwell.repository.UserProfileRepository;
import com.ayurwell.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DoshaAssessmentService {

    @Autowired
    private DoshaAssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository profileRepository;

    @Transactional
    public DoshaResultDTO calculateAndSavePrakriti(Long userId, QuizSubmitRequest request) {
        int vata = 0;
        int pitta = 0;
        int kapha = 0;

        if (request != null && request.getAnswers() != null) {
            for (String ans : request.getAnswers().values()) {
                if ("VATA".equalsIgnoreCase(ans)) vata++;
                else if ("PITTA".equalsIgnoreCase(ans)) pitta++;
                else if ("KAPHA".equalsIgnoreCase(ans)) kapha++;
            }
        }

        // Fallback default scores if quiz empty
        if (vata == 0 && pitta == 0 && kapha == 0) {
            vata = 4; pitta = 7; kapha = 3;
        }

        DoshaType primary = determinePrimaryDosha(vata, pitta, kapha);
        DoshaType secondary = determineSecondaryDosha(vata, pitta, kapha, primary);

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByEmail("demo@ayurwell.com").orElse(null);
        }

        if (user != null) {
            DoshaAssessment assessment = DoshaAssessment.builder()
                    .user(user)
                    .vataScore(vata)
                    .pittaScore(pitta)
                    .kaphaScore(kapha)
                    .primaryPrakriti(primary)
                    .secondaryPrakriti(secondary)
                    .build();

            assessmentRepository.save(assessment);

            // Update user profile primary dosha and mark completed
            UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(UserProfile.builder().user(user).build());
            profile.setPrimaryDosha(primary);
            profile.setProfileCompleted(true);
            profileRepository.save(profile);
        }

        return buildResultDTO(vata, pitta, kapha, primary, secondary);
    }

    public DoshaResultDTO calculatePrakritiOnly(QuizSubmitRequest request) {
        int vata = 0;
        int pitta = 0;
        int kapha = 0;

        if (request != null && request.getAnswers() != null) {
            for (String ans : request.getAnswers().values()) {
                if ("VATA".equalsIgnoreCase(ans)) vata++;
                else if ("PITTA".equalsIgnoreCase(ans)) pitta++;
                else if ("KAPHA".equalsIgnoreCase(ans)) kapha++;
            }
        }

        if (vata == 0 && pitta == 0 && kapha == 0) {
            vata = 4; pitta = 7; kapha = 3;
        }

        DoshaType primary = determinePrimaryDosha(vata, pitta, kapha);
        DoshaType secondary = determineSecondaryDosha(vata, pitta, kapha, primary);

        return buildResultDTO(vata, pitta, kapha, primary, secondary);
    }

    public DoshaResultDTO getLatestAssessment(Long userId) {
        DoshaAssessment latest = assessmentRepository.findFirstByUserIdOrderByAssessedAtDesc(userId).orElse(null);
        if (latest == null) {
            return null;
        }
        return buildResultDTO(latest.getVataScore(), latest.getPittaScore(), latest.getKaphaScore(),
                latest.getPrimaryPrakriti(), latest.getSecondaryPrakriti());
    }

    private DoshaType determinePrimaryDosha(int v, int p, int k) {
        if (v >= p && v >= k) return DoshaType.VATA;
        if (p >= v && p >= k) return DoshaType.PITTA;
        return DoshaType.KAPHA;
    }

    private DoshaType determineSecondaryDosha(int v, int p, int k, DoshaType primary) {
        if (primary == DoshaType.VATA) return (p >= k) ? DoshaType.PITTA : DoshaType.KAPHA;
        if (primary == DoshaType.PITTA) return (v >= k) ? DoshaType.VATA : DoshaType.KAPHA;
        return (p >= v) ? DoshaType.PITTA : DoshaType.VATA;
    }

    private DoshaResultDTO buildResultDTO(int v, int p, int k, DoshaType primary, DoshaType secondary) {
        List<String> recs = new ArrayList<>();
        List<String> tips = new ArrayList<>();
        List<String> herbs = new ArrayList<>();

        if (primary == DoshaType.PITTA) {
            recs.add("Favor cooling, soothing, and moderately heavy foods (sweet, bitter, astringent tastes).");
            recs.add("Incorporate fresh A2 Ghee, coconut water, cucumber, soaked almonds, and green leafy vegetables.");
            tips.add("Avoid eating during intense heat or anger.");
            tips.add("Practice cooling Pranayama like Shitali or Sitkari.");
            herbs.add("Shatavari (Asparagus racemosus)");
            herbs.add("Amalaki / Amla (Emblica officinalis)");
        } else if (primary == DoshaType.VATA) {
            recs.add("Favor warm, cooked, grounding, and unctuous foods (sweet, sour, salty tastes).");
            recs.add("Consume warm soups, kitchari, sesame oil, root vegetables, and cooked grains.");
            tips.add("Maintain strict regular meal timings without skipping meals.");
            tips.add("Perform daily self-massage (Abhyanga) with warm sesame oil.");
            herbs.add("Ashwagandha (Withania somnifera)");
            herbs.add("Bala (Sida cordifolia)");
        } else {
            recs.add("Favor light, warm, dry, and stimulating foods (bitter, pungent, astringent tastes).");
            recs.add("Incorporate steamed greens, moong dal, ginger, black pepper, honey, and millets.");
            tips.add("Engage in vigorous morning exercise and avoid daytime sleeping.");
            tips.add("Sip warm ginger tea throughout the day.");
            herbs.add("Trikatu (Ginger, Black Pepper, Long Pepper)");
            herbs.add("Guggulu (Commiphora mukul)");
        }

        int total = v + p + k;
        int pPct = total > 0 ? Math.round((float) p * 100 / total) : 33;
        int vPct = total > 0 ? Math.round((float) v * 100 / total) : 33;
        int kPct = total > 0 ? Math.max(0, 100 - pPct - vPct) : 34;

        String desc = String.format("Your constitutional assessment according to CCRAS-AyuSoft standards indicates a dominant %s Prakriti with secondary %s tendencies (%d%% Pitta, %d%% Vata, %d%% Kapha).",
                primary, secondary, pPct, vPct, kPct);

        return DoshaResultDTO.builder()
                .vataScore(v)
                .pittaScore(p)
                .kaphaScore(k)
                .primaryPrakriti(primary)
                .secondaryPrakriti(secondary)
                .description(desc)
                .dietaryRecommendations(recs)
                .lifestyleTips(tips)
                .herbsRecommended(herbs)
                .build();
    }
}
