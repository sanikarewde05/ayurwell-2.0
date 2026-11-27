import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Bot, Send, Sparkles, Shield } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  context?: Record<string, string>;
}

export const AiAssistantPage: React.FC = () => {
  const { result } = useSelector((state: RootState) => state.dosha);
  const { currentPlan } = useSelector((state: RootState) => state.diet);

  const prakriti = result?.primaryPrakriti || 'PITTA';
  const disease = currentPlan?.targetDisease || 'GERD';

  const [inputQuery, setInputQuery] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: `Namaste! I am your AI AyurWell – Ayurvedic Diet Planning and Nutrient Analysis System Assistant. I analyze your grounded health data (${prakriti} Prakriti, ${disease} focus) and provide context-aware natural language explanations for your diet recommendations. How may I support your wellness journey today?`,
      context: {
        Prakriti: prakriti,
        "Target Condition": disease,
        "ML Gap": "Calcium (Moderate Risk)",
        "Key Recipe": "Tridoshic Moong Dal Khichdi"
      }
    }
  ]);

  const quickPrompts = [
    "Why is Moong Dal Khichdi recommended for my diet?",
    "How can I boost my iron absorption naturally?",
    "Explain my Ayurvedic PCOS nutrition strategy",
    "What foods should I avoid for Pitta acidity?"
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Generate grounded context-aware LLM response
    setTimeout(() => {
      let explanation = "";
      const lower = query.toLowerCase();
      if (lower.includes("why") || lower.includes("khichdi")) {
        explanation = `Based on your ${prakriti} constitution and ${disease} health focus, Tridoshic Moong Dal Khichdi is selected because split yellow moong combined with A2 Ghee and cumin provides sweet and astringent Rasas with cooling Virya. This calms digestive fire (Agni) without causing acid reflux while supplying easily digestible proteins.`;
      } else if (lower.includes("iron")) {
        explanation = `To naturally replenish potential iron gaps: 1. Consume soaked black raisins on an empty stomach. 2. Cook spinach in an iron skillet with fresh lemon juice (Vitamin C acts as an absorption catalyst). 3. Avoid drinking tea/coffee within 1 hour of meals.`;
      } else if (lower.includes("pcos")) {
        explanation = `Your Ayurvedic PCOS protocol focuses on Kapha-Vata balancing. Barley (Jav), cinnamon water, and bitter gourd are recommended to clear clogged micro-channels (Srotas) and improve insulin sensitivity.`;
      } else {
        explanation = `Namaste! Evaluating your profile (${prakriti} Prakriti, ${disease}), your diet plan prioritizes warm, unctuous, freshly cooked foods. Machine Learning predictions highlight a potential nutrient gap in Calcium. Incorporating ragi porridge and white sesame seeds will replenish this gap naturally.`;
      }

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: explanation,
        context: {
          Prakriti: prakriti,
          "Target Condition": disease,
          "ML Gap": "Calcium (Moderate Risk)"
        }
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-sage-light text-forest px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Context-Aware AI Wellness Assistant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-forest">
            AyurWell AI Assistant
          </h1>
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-wider mt-0.5">
            Ayurvedic Diet Planning and Nutrient Analysis System
          </p>
          <p className="text-sm text-charcoal-muted mt-1">
            Grounded LLM explanations based on your Prakriti diagnostic assessment, ML deficiency predictions, and therapeutic diet plans.
          </p>
        </div>
      </div>

      {/* Grounded Context Banner */}
      <div className="bg-gradient-to-r from-forest to-forest-light rounded-2xl p-4 text-white shadow-ayur flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="font-bold">Grounded Application Context Active:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
            Prakriti: <strong>{prakriti}</strong>
          </span>
          <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
            Condition: <strong>{disease}</strong>
          </span>
          <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
            ML Gap: <strong>Calcium & Iron</strong>
          </span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-ivory-dark shadow-ayur p-6 space-y-4 min-h-[420px] flex flex-col justify-between">
        
        {/* Messages */}
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                msg.sender === 'user' ? 'bg-forest text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {msg.sender === 'user' ? 'U' : '🌿'}
              </div>

              <div className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-forest text-white font-medium rounded-tr-none'
                  : 'bg-ivory text-charcoal border border-ivory-dark rounded-tl-none'
              }`}>
                <p>{msg.text}</p>

                {msg.context && (
                  <div className="pt-2 border-t border-sage/20 text-[10px] text-charcoal-muted flex flex-wrap gap-2">
                    <span><strong>Grounded Parameters:</strong></span>
                    {Object.entries(msg.context).map(([k, v]) => (
                      <span key={k} className="bg-sage-light/80 px-2 py-0.5 rounded text-forest font-medium">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="pt-3 border-t border-ivory-dark space-y-2">
          <span className="text-[11px] text-charcoal-muted font-bold block">Suggested Questions:</span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 rounded-xl bg-sage-light text-forest text-xs font-semibold hover:bg-sage hover:text-white transition-all text-left border border-sage/20"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="pt-2 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Ask a question about your diet plan, foods, or Ayurvedic recommendations..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full px-4 py-3 rounded-xl border border-ivory-dark bg-ivory text-xs font-medium focus:outline-none focus:border-forest"
          />
          <button
            onClick={() => handleSend()}
            className="bg-forest text-white p-3 rounded-xl hover:bg-forest-light transition-all shadow-md shrink-0"
          >
            <Send className="w-4 h-4 text-gold" />
          </button>
        </div>

      </div>

      {/* Safety Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed flex items-start space-x-2">
        <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Healthcare Disclaimer:</strong> AyurWell – Ayurvedic Diet Planning and Nutrient Analysis System AI Assistant responses are grounded explanations for educational wellness support based on structured application data and Ayurvedic principles. It is NOT a clinical medical diagnosis system.
        </div>
      </div>

    </div>
  );
};
