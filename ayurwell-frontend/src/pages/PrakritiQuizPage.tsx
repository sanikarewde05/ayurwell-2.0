import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setResult, clearDoshaState } from '../store/slices/doshaSlice';
import { setProfile } from '../store/slices/authSlice';
import { setCurrentPlan } from '../store/slices/dietSlice';
import { axiosClient } from '../api/axiosClient';
import type { DoshaAssessmentResult, DoshaType } from '../types';
import {
  AYUSH_30_PRAKRITI_QUESTIONS,
} from '../data/ayushPrakritiQuestions';
import {
  Sparkles,
  RotateCcw,
  Leaf,
  Shield,
  ArrowRight,
  AlertCircle,
  Loader2,
  ListFilter,
  Check,
} from 'lucide-react';

interface PrakritiQuizPageProps {
  onComplete?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const PrakritiQuizPage: React.FC<PrakritiQuizPageProps> = ({ onComplete, setActiveTab }) => {
  const dispatch = useDispatch();
  const { result } = useSelector((state: RootState) => state.dosha);
  const { profile } = useSelector((state: RootState) => state.auth);

  // Stored answers: questionId -> { value: string, dosha?: string }
  // For checkboxes, value is a comma-separated or array
  const [answers, setAnswers] = useState<Record<string, { value: string; dosha?: string }>>({});
  const [activeSection, setActiveSection] = useState<string>('All');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(Boolean(result));
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Extract distinct sections
  const sections = useMemo(() => {
    const list = Array.from(new Set(AYUSH_30_PRAKRITI_QUESTIONS.map((q) => q.section)));
    return ['All', ...list];
  }, []);

  // Filtered questions
  const displayedQuestions = useMemo(() => {
    if (activeSection === 'All') return AYUSH_30_PRAKRITI_QUESTIONS;
    return AYUSH_30_PRAKRITI_QUESTIONS.filter((q) => q.section === activeSection);
  }, [activeSection]);

  // Live count of Doshas
  const doshaCounts = useMemo(() => {
    let vata = 0;
    let pitta = 0;
    let kapha = 0;

    Object.values(answers).forEach((ans) => {
      if (ans.dosha === 'VATA') vata++;
      else if (ans.dosha === 'PITTA') pitta++;
      else if (ans.dosha === 'KAPHA') kapha++;
    });

    return { vata, pitta, kapha };
  }, [answers]);

  const totalAnswered = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  useEffect(() => {
    if (result) {
      setSubmitted(true);
    } else {
      axiosClient.get('/dosha/latest')
        .then((res) => {
          if (res.data) {
            dispatch(setResult(res.data));
            setSubmitted(true);
          }
        })
        .catch(() => {});
    }
  }, [result, dispatch]);

  const handleRadioSelect = (qId: string, value: string, dosha?: string) => {
    setErrorMsg('');
    setAnswers((prev) => ({
      ...prev,
      [qId]: { value, dosha: dosha || 'NONE' },
    }));
  };

  const handleCheckboxToggle = (qId: string, optValue: string, optDosha?: string) => {
    setErrorMsg('');
    setAnswers((prev) => {
      const current = prev[qId]?.value ? prev[qId].value.split(',').filter(Boolean) : [];
      let updated: string[];
      if (current.includes(optValue)) {
        updated = current.filter((v) => v !== optValue);
      } else {
        if (optValue === 'none') {
          updated = ['none'];
        } else {
          updated = [...current.filter((v) => v !== 'none'), optValue];
        }
      }

      if (updated.length === 0) {
        const next = { ...prev };
        delete next[qId];
        return next;
      }

      return {
        ...prev,
        [qId]: { value: updated.join(','), dosha: optDosha || 'NONE' },
      };
    });
  };

  const handleSelectChange = (qId: string, value: string, dosha?: string) => {
    setErrorMsg('');
    if (!value) {
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      [qId]: { value, dosha: dosha || 'NONE' },
    }));
  };

  const handleTextChange = (qId: string, value: string) => {
    setErrorMsg('');
    if (!value.trim()) {
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      [qId]: { value, dosha: 'NONE' },
    }));
  };

  const calculateResult = async () => {
    setErrorMsg('');

    // Ensure at least 10 questions are answered for an assessment
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < 10) {
      setErrorMsg(`Please answer at least 10 questions for an accurate diagnostic assessment (Answered: ${answeredCount}/30).`);
      return;
    }

    setSubmitting(true);

    // 1. Calculate classical CCRAS AyuSoft diagnosis directly from current responses
    const v = doshaCounts.vata;
    const p = doshaCounts.pitta;
    const k = doshaCounts.kapha;
    const primary: DoshaType = (v >= p && v >= k) ? 'VATA' : (p >= v && p >= k) ? 'PITTA' : 'KAPHA';
    const secondary: DoshaType = primary === 'VATA' ? (p >= k ? 'PITTA' : 'KAPHA') : primary === 'PITTA' ? (v >= k ? 'VATA' : 'KAPHA') : (p >= v ? 'PITTA' : 'VATA');
    const total = v + p + k || 1;
    const pPct = Math.round((p / total) * 100);
    const vPct = Math.round((v / total) * 100);
    const kPct = Math.max(0, 100 - pPct - vPct);

    const localResult: DoshaAssessmentResult = {
      vataScore: v,
      pittaScore: p,
      kaphaScore: k,
      primaryPrakriti: primary,
      secondaryPrakriti: secondary,
      description: `Your constitutional assessment according to CCRAS-AyuSoft standards indicates a dominant ${primary} Prakriti with secondary ${secondary} tendencies (${pPct}% Pitta, ${vPct}% Vata, ${kPct}% Kapha).`,
      dietaryRecommendations: primary === 'PITTA'
        ? ['Favor cooling, soothing, and moderately heavy foods (sweet, bitter, astringent tastes).', 'Incorporate fresh A2 Ghee, coconut water, cucumber, soaked almonds, and green leafy vegetables.']
        : primary === 'VATA'
        ? ['Favor warm, cooked, grounding, and unctuous foods (sweet, sour, salty tastes).', 'Consume warm soups, kitchari, sesame oil, root vegetables, and cooked grains.']
        : ['Favor light, warm, dry, and stimulating foods (bitter, pungent, astringent tastes).', 'Incorporate steamed greens, moong dal, ginger, black pepper, honey, and millets.'],
      lifestyleTips: primary === 'PITTA'
        ? ['Avoid eating during intense heat or anger.', 'Practice cooling Pranayama like Shitali or Sitkari.']
        : primary === 'VATA'
        ? ['Maintain strict regular meal timings without skipping meals.', 'Perform daily self-massage (Abhyanga) with warm sesame oil.']
        : ['Engage in vigorous morning exercise and avoid daytime sleeping.', 'Sip warm ginger tea throughout the day.'],
      herbsRecommended: primary === 'PITTA'
        ? ['Shatavari (Asparagus racemosus)', 'Amalaki / Amla (Emblica officinalis)']
        : primary === 'VATA'
        ? ['Ashwagandha (Withania somnifera)', 'Bala (Sida cordifolia)']
        : ['Trikatu (Ginger, Black Pepper, Long Pepper)', 'Guggulu (Commiphora mukul)'],
    };

    // Map to answers payload: qId -> dosha string
    const payloadAnswers: Record<string, string> = {};
    Object.entries(answers).forEach(([key, val]) => {
      if (val.dosha && val.dosha !== 'NONE') {
        payloadAnswers[key] = val.dosha;
      }
    });

    let assessmentData = localResult;

    try {
      const assessRes = await axiosClient.post('/dosha/assess', { answers: payloadAnswers });
      if (assessRes.data) {
        assessmentData = assessRes.data;
      }
    } catch (apiErr: any) {
      console.warn('Backend assess API fallback to local calculation:', apiErr);
      // Fallback is already initialized to localResult, never block the user
    }

    dispatch(setResult(assessmentData));
    localStorage.setItem('ayurwell_latest_prakriti', JSON.stringify(assessmentData));

    if (profile) {
      dispatch(
        setProfile({
          ...profile,
          profileCompleted: true,
          primaryDosha: assessmentData.primaryPrakriti,
        })
      );
    }

    // Automatically generate a personalized diet plan based on assessment
    try {
      const dietRes = await axiosClient.post('/diet/generate', {
        targetDisease: profile?.targetDiseaseCondition || 'None',
        season: 'VASANTA',
        maxDailyBudget: profile?.budgetPerDayInr || 200,
      });
      if (dietRes.data) {
        dispatch(setCurrentPlan(dietRes.data));
      }
    } catch (dietErr) {
      console.warn('Initial diet generation note:', dietErr);
    }

    setSubmitted(true);
    setErrorMsg('');
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    setSubmitted(false);
    setAnswers({});
    setErrorMsg('');
    dispatch(clearDoshaState());
    localStorage.removeItem('ayurwell_latest_prakriti');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Official Government of India / CCRAS AyuSoft Assessment Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ivory-dark pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
              <span className="text-forest bg-sage-light px-2.5 py-0.5 rounded-full">Ministry of Ayush</span>
              <span>•</span>
              <span>Government of India</span>
              <span>•</span>
              <span className="text-terracotta">CCRAS - AyuSoft Assessment Scale</span>
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-forest">
              Official 30-Question Prakriti Assessment Questionnaire
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
              Standardized Diagnostic Scale &mdash; 30 Essential Clinical &amp; Constitutional Indicators (Ministry of Ayush / CCRAS Standard)
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {submitted && (
              <button
                onClick={handleRetake}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-ivory hover:bg-sage-light border border-ivory-dark text-xs font-bold text-forest transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Assessment</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Counters and Completion Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-ivory p-3 rounded-xl border border-ivory-dark">
            <span className="text-[11px] font-semibold text-charcoal-muted block">Questions Answered</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-lg font-bold font-mono text-forest">{totalAnswered}</span>
              <span className="text-xs text-charcoal-muted">/ 30</span>
            </div>
          </div>

          <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100">
            <span className="text-[11px] font-semibold text-sky-800 block">💨 Vata Points</span>
            <span className="text-lg font-bold font-mono text-sky-900 mt-0.5 block">{doshaCounts.vata}</span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800 block">🔥 Pitta Points</span>
            <span className="text-lg font-bold font-mono text-amber-900 mt-0.5 block">{doshaCounts.pitta}</span>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800 block">💧 Kapha Points</span>
            <span className="text-lg font-bold font-mono text-emerald-900 mt-0.5 block">{doshaCounts.kapha}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-forest rounded-full transition-all duration-300"
            style={{ width: `${Math.round((totalAnswered / 30) * 100)}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* RESULTS DISPLAY CARD (AFTER SUBMIT) */}
      {submitted && result && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-sage/40 shadow-ayur space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-ivory-dark pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-sage-light text-forest px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>CCRAS Diagnostic Constitutional Analysis</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-forest">
                Primary Prakriti: <span className="text-terracotta">{result.primaryPrakriti}</span>
                {result.secondaryPrakriti && result.secondaryPrakriti !== result.primaryPrakriti && (
                  <span className="text-charcoal text-lg font-normal"> (Secondary: {result.secondaryPrakriti})</span>
                )}
              </h2>
              <p className="text-sm text-charcoal leading-relaxed max-w-2xl">{result.description}</p>
            </div>

            {/* Constitutional Proportion Gauges */}
            <div className="w-full md:w-80 space-y-3 bg-ivory p-4 rounded-xl border border-ivory-dark">
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>🔥 Pitta (Tejas &amp; Jala)</span>
                  <span>{Math.round(((result.pittaScore || doshaCounts.pitta || 1) / Math.max(1, (result.vataScore + result.pittaScore + result.kaphaScore) || (doshaCounts.vata + doshaCounts.pitta + doshaCounts.kapha) || 1)) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((result.pittaScore || doshaCounts.pitta || 1) / Math.max(1, (result.vataScore + result.pittaScore + result.kaphaScore) || (doshaCounts.vata + doshaCounts.pitta + doshaCounts.kapha) || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>💨 Vata (Vayu &amp; Akasha)</span>
                  <span>{Math.round(((result.vataScore || doshaCounts.vata || 1) / Math.max(1, (result.vataScore + result.pittaScore + result.kaphaScore) || (doshaCounts.vata + doshaCounts.pitta + doshaCounts.kapha) || 1)) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((result.vataScore || doshaCounts.vata || 1) / Math.max(1, (result.vataScore + result.pittaScore + result.kaphaScore) || (doshaCounts.vata + doshaCounts.pitta + doshaCounts.kapha) || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>💧 Kapha (Prithvi &amp; Jala)</span>
                  <span>{Math.round(((result.kaphaScore || doshaCounts.kapha || 1) / Math.max(1, (result.vataScore + result.pittaScore + result.kaphaScore) || (doshaCounts.vata + doshaCounts.pitta + doshaCounts.kapha) || 1)) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((result.kaphaScore || doshaCounts.kapha || 1) / Math.max(1, (result.vataScore + result.pittaScore + result.kaphaScore) || (doshaCounts.vata + doshaCounts.pitta + doshaCounts.kapha) || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-sage-light/60 border border-sage/20 space-y-2.5">
              <h3 className="font-bold text-forest text-sm flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-sage" />
                <span>Dietary Principles</span>
              </h3>
              <ul className="text-xs text-charcoal space-y-2 list-disc list-inside">
                {result.dietaryRecommendations.map((rec, i) => (
                  <li key={i} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
              <h3 className="font-bold text-amber-900 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Lifestyle Guidelines</span>
              </h3>
              <ul className="text-xs text-amber-950 space-y-2 list-disc list-inside">
                {result.lifestyleTips.map((tip, i) => (
                  <li key={i} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5">
              <h3 className="font-bold text-emerald-900 text-sm flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Recommended Herbs</span>
              </h3>
              <ul className="text-xs text-emerald-950 space-y-2 list-disc list-inside">
                {result.herbsRecommended.map((herb, i) => (
                  <li key={i} className="leading-relaxed">{herb}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleRetake}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-ivory-dark bg-ivory text-xs font-bold text-forest hover:bg-sage-light transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Assessment</span>
            </button>

            <button
              onClick={() => (setActiveTab ? setActiveTab('dashboard') : onComplete?.())}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-forest text-white font-bold text-xs hover:bg-forest-light transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <span>View My Dashboard</span>
              <ArrowRight className="w-4 h-4 text-gold" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION TABS FILTER */}
      {!submitted && (
        <div className="bg-white p-3 rounded-2xl border border-ivory-dark shadow-sm overflow-x-auto scrollbar-none flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-charcoal-muted shrink-0">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Sections:</span>
          </div>
          {sections.map((sec) => {
            const isCurrent = activeSection === sec;
            const countInSection = sec === 'All'
              ? AYUSH_30_PRAKRITI_QUESTIONS.length
              : AYUSH_30_PRAKRITI_QUESTIONS.filter((q) => q.section === sec).length;

            return (
              <button
                key={sec}
                type="button"
                onClick={() => setActiveSection(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
                  isCurrent
                    ? 'bg-forest text-white shadow-sm'
                    : 'bg-ivory text-charcoal hover:bg-sage-light border border-ivory-dark'
                }`}
              >
                <span>{sec}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isCurrent ? 'bg-white/20 text-white' : 'bg-gray-200 text-charcoal'}`}>
                  {countInSection}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 30 QUESTIONS FORM */}
      {!submitted && (
        <div className="space-y-5">
          {displayedQuestions.map((q) => {
            const currentAns = answers[q.id];
            const isAnswered = Boolean(currentAns?.value);

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-5 md:p-6 border transition-all shadow-ayur space-y-4 ${
                  isAnswered ? 'border-forest/20 ring-1 ring-forest/5' : 'border-ivory-dark'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                      {q.section}
                    </span>
                    <h2 className="text-sm md:text-base font-bold text-forest flex items-baseline space-x-2">
                      <span className="text-terracotta font-mono font-bold">{q.num}.</span>
                      <span>{q.title}</span>
                    </h2>
                  </div>

                  {isAnswered && (
                    <span className="shrink-0 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Answered</span>
                    </span>
                  )}
                </div>

                {/* Input Controls */}
                {/* 1. RADIO CONTROLS */}
                {q.type === 'radio' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = currentAns?.value === opt.value;
                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleRadioSelect(q.id, opt.value, opt.dosha)}
                          className={`p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-start space-x-3 ${
                            isSelected
                              ? 'border-forest bg-sage-light text-forest font-bold ring-2 ring-forest/20 shadow-sm'
                              : 'border-ivory-dark bg-ivory/60 text-charcoal hover:border-sage/50 hover:bg-ivory'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`radio_${q.id}`}
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-0.5 w-4 h-4 text-forest border-gray-300 focus:ring-forest"
                          />
                          <div className="flex-1">
                            <span>{opt.label}</span>
                            {opt.dosha && opt.dosha !== 'NONE' && (
                              <span className={`block text-[10px] uppercase font-bold mt-1 ${
                                opt.dosha === 'VATA' ? 'text-sky-700' : opt.dosha === 'PITTA' ? 'text-amber-700' : 'text-emerald-700'
                              }`}>
                                ({opt.dosha})
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 2. CHECKBOX CONTROLS */}
                {q.type === 'checkbox' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const selectedList = currentAns?.value ? currentAns.value.split(',') : [];
                      const isChecked = selectedList.includes(opt.value);

                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleCheckboxToggle(q.id, opt.value, opt.dosha)}
                          className={`p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-start space-x-3 ${
                            isChecked
                              ? 'border-forest bg-sage-light text-forest font-bold ring-2 ring-forest/20 shadow-sm'
                              : 'border-ivory-dark bg-ivory/60 text-charcoal hover:border-sage/50 hover:bg-ivory'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 w-4 h-4 text-forest rounded border-gray-300 focus:ring-forest"
                          />
                          <div className="flex-1">
                            <span>{opt.label}</span>
                            {opt.dosha && opt.dosha !== 'NONE' && (
                              <span className={`block text-[10px] uppercase font-bold mt-1 ${
                                opt.dosha === 'VATA' ? 'text-sky-700' : opt.dosha === 'PITTA' ? 'text-amber-700' : 'text-emerald-700'
                              }`}>
                                ({opt.dosha})
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 3. SELECT CONTROLS */}
                {q.type === 'select' && q.options && (
                  <div className="max-w-md pt-1">
                    <select
                      value={currentAns?.value || ''}
                      onChange={(e) => {
                        const opt = q.options?.find((o) => o.value === e.target.value);
                        handleSelectChange(q.id, e.target.value, opt?.dosha);
                      }}
                      className="w-full text-xs md:text-sm px-4 py-3 rounded-xl border border-ivory-dark bg-ivory focus:outline-none focus:border-forest text-charcoal font-medium"
                    >
                      <option value="">-- Please Select --</option>
                      {q.options.map((opt, optIdx) => (
                        <option key={optIdx} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 4. NUMBER CONTROLS */}
                {q.type === 'number' && (
                  <div className="max-w-xs pt-1">
                    <input
                      type="number"
                      min="1"
                      value={currentAns?.value || ''}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'Enter value'}
                      className="w-full text-xs md:text-sm px-4 py-3 rounded-xl border border-ivory-dark bg-ivory focus:outline-none focus:border-forest text-charcoal font-medium"
                    />
                  </div>
                )}

                {/* SubQuestion (e.g. for Q9) */}
                {q.subQuestion && currentAns?.value === 'yes' && (
                  <div className="mt-3 p-4 bg-sage-light/40 border border-sage/20 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-forest">
                      {q.subQuestion.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {q.subQuestion.options.map((subOpt, subIdx) => {
                        const subKey = `${q.id}_sub`;
                        const subAns = answers[subKey]?.value ? answers[subKey].value.split(',') : [];
                        const isSubChecked = subAns.includes(subOpt.value);

                        return (
                          <label
                            key={subIdx}
                            onClick={() => handleCheckboxToggle(subKey, subOpt.value, subOpt.dosha)}
                            className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center space-x-2 ${
                              isSubChecked
                                ? 'border-forest bg-white text-forest font-bold ring-1 ring-forest/30'
                                : 'border-ivory-dark bg-white/70 text-charcoal hover:border-sage'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSubChecked}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 text-forest rounded border-gray-300"
                            />
                            <span>{subOpt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Submission Bar */}
          <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-charcoal">
                Diagnostic Progress: <span className="text-forest font-mono">{totalAnswered} of 30</span> answered
              </p>
              <p className="text-[11px] text-charcoal-muted mt-0.5">
                Standardized CCRAS-AyuSoft Evaluation algorithm computes your comprehensive Prakriti report upon submit.
              </p>
            </div>

            <button
              type="button"
              onClick={calculateResult}
              disabled={submitting}
              className="w-full sm:w-auto bg-forest text-white font-bold py-3.5 px-8 rounded-xl text-xs md:text-sm shadow-md hover:bg-forest-light transition-all flex items-center justify-center space-x-2 disabled:opacity-60 shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Diagnostic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Submit &amp; Display Prakriti Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
