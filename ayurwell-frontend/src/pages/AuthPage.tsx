import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setProfile } from '../store/slices/authSlice';
import { clearDoshaState } from '../store/slices/doshaSlice';
import { clearDietState } from '../store/slices/dietSlice';
import { clearAnalyticsState } from '../store/slices/analyticsSlice';
import { axiosClient } from '../api/axiosClient';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Ruler,
  Weight as WeightIcon,
  Check,
  ShieldCheck,
  Heart,
  Leaf
} from 'lucide-react';
import { AyurWellLogo } from '../components/AyurWellLogo';

export const AuthPage: React.FC = () => {
  const dispatch = useDispatch();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [signUpStep, setSignUpStep] = useState<number>(1); // 1: Account, 2: Profile

  // Step 1: Account State (Always starts completely empty, never pre-filled)
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Step 2: Personal Profile State (Always starts completely empty, never pre-filled)
  const [gender, setGender] = useState<string>('');
  const [dob, setDob] = useState<string>('');

  // Height & Weight Units State
  const [heightUnit, setHeightUnit] = useState<'CM' | 'FT'>('CM');
  const [heightCm, setHeightCm] = useState<string>('');
  const [heightFeet, setHeightFeet] = useState<string>('');
  const [heightInches, setHeightInches] = useState<string>('');

  const [weightUnit, setWeightUnit] = useState<'KG' | 'LBS'>('KG');
  const [weightKg, setWeightKg] = useState<string>('');
  const [weightLbs, setWeightLbs] = useState<string>('');

  // UI & Validation States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Ensure credentials always start completely empty and clear any browser autofill
  useEffect(() => {
    setEmail('');
    setPassword('');
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 100);
    return () => clearTimeout(timer);
  }, [isRegister]);

  // Reset and toggle between Login and Sign Up
  const handleSwitchToLogin = () => {
    setIsRegister(false);
    setSignUpStep(1);
    setErrorMessage('');
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSwitchToSignUp = () => {
    setIsRegister(true);
    setSignUpStep(1);
    setErrorMessage('');
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setGender('');
    setDob('');
    setHeightCm('');
    setHeightFeet('');
    setHeightInches('');
    setWeightKg('');
    setWeightLbs('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Unit Conversion Handlers (Converts existing values on unit toggle)
  const handleHeightUnitToggle = (unit: 'CM' | 'FT') => {
    if (unit === heightUnit) return;
    if (unit === 'FT') {
      const numCm = parseFloat(heightCm);
      if (!isNaN(numCm) && numCm > 0) {
        const totalInches = Math.round(numCm / 2.54);
        const ft = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        setHeightFeet(ft.toString());
        setHeightInches(inches.toString());
      }
    } else {
      const ft = parseFloat(heightFeet) || 0;
      const inch = parseFloat(heightInches) || 0;
      if (ft > 0 || inch > 0) {
        const totalInches = ft * 12 + inch;
        setHeightCm(Math.round(totalInches * 2.54).toString());
      }
    }
    setHeightUnit(unit);
  };

  const handleWeightUnitToggle = (unit: 'KG' | 'LBS') => {
    if (unit === weightUnit) return;
    if (unit === 'LBS') {
      const numKg = parseFloat(weightKg);
      if (!isNaN(numKg) && numKg > 0) {
        setWeightLbs(Math.round(numKg * 2.20462).toString());
      }
    } else {
      const numLbs = parseFloat(weightLbs);
      if (!isNaN(numLbs) && numLbs > 0) {
        setWeightKg(Math.round(numLbs / 2.20462).toString());
      }
    }
    setWeightUnit(unit);
  };

  const validateStep1 = (): boolean => {
    setErrorMessage('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return false;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }
    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return false;
      }
      if (!confirmPassword) {
        setErrorMessage('Please confirm your password.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setErrorMessage('');
    if (!gender) {
      setErrorMessage('Please select your gender.');
      return false;
    }

    if (!dob) {
      setErrorMessage('Please select your date of birth.');
      return false;
    }
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;
    if (isNaN(calculatedAge) || calculatedAge < 12 || calculatedAge > 120) {
      setErrorMessage('Please enter a valid date of birth (age between 12 and 120).');
      return false;
    }

    const effectiveCm = heightUnit === 'CM'
      ? parseFloat(heightCm)
      : (parseFloat(heightFeet) || 0) * 30.48 + (parseFloat(heightInches) || 0) * 2.54;

    if (!effectiveCm || isNaN(effectiveCm) || effectiveCm < 50 || effectiveCm > 260) {
      setErrorMessage('Please enter a valid height.');
      return false;
    }

    const effectiveKg = weightUnit === 'KG'
      ? parseFloat(weightKg)
      : (parseFloat(weightLbs) || 0) / 2.20462;

    if (!effectiveKg || isNaN(effectiveKg) || effectiveKg < 20 || effectiveKg > 350) {
      setErrorMessage('Please enter a valid weight.');
      return false;
    }

    return true;
  };

  const handleNextOrSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. LOGIN FLOW
    if (!isRegister) {
      if (!validateStep1()) return;
      setLoading(true);
      setErrorMessage('');

      axiosClient.post('/auth/login', { email: email.trim(), password })
        .then((res) => {
          setLoading(false);
          dispatch(clearDoshaState());
          dispatch(clearDietState());
          dispatch(clearAnalyticsState());
          dispatch(
            setCredentials({
              token: res.data?.token,
              userId: res.data?.userId,
              email: res.data?.email || email.trim(),
              fullName: res.data?.fullName || 'User',
            })
          );
          if (res.data?.profile) {
            dispatch(setProfile(res.data.profile));
          }
        })
        .catch((err) => {
          setLoading(false);
          const serverMsg = err.response?.data?.message;
          if (serverMsg && typeof serverMsg === 'string' && !serverMsg.toLowerCase().includes('status code')) {
            setErrorMessage(serverMsg);
          } else if (err.response?.status === 401 || err.response?.status === 403) {
            setErrorMessage('Invalid email or password.');
          } else if (!err.response) {
            setErrorMessage('Unable to connect to the server. Please try again.');
          } else {
            setErrorMessage('Invalid email or password.');
          }
        });
      return;
    }

    // 2. SIGN UP STEP 1 -> STEP 2
    if (signUpStep === 1) {
      if (!validateStep1()) return;
      setSignUpStep(2);
      return;
    }

    // 3. SIGN UP STEP 2 SUBMIT (Direct Account Creation & Dashboard)
    if (signUpStep === 2) {
      if (!validateStep2()) return;
      setLoading(true);
      setErrorMessage('');

      const effectiveCm = Math.round(
        heightUnit === 'CM'
          ? parseFloat(heightCm)
          : (parseFloat(heightFeet) || 0) * 30.48 + (parseFloat(heightInches) || 0) * 2.54
      );
      const effectiveKg = Math.round(
        (weightUnit === 'KG'
          ? parseFloat(weightKg)
          : (parseFloat(weightLbs) || 0) / 2.20462) * 10
      ) / 10;

      const birthYear = new Date(dob).getFullYear();
      const age = new Date().getFullYear() - birthYear;

      const regData = {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        age: age || 25,
        gender,
        weightKg: effectiveKg,
        heightCm: effectiveCm,
        activityLevel: 'Moderately Active',
        budgetPerDayInr: 250,
        primaryHealthGoal: 'Immunity & Balance',
      };

      axiosClient.post('/auth/register', regData)
        .then((res) => {
          setLoading(false);
          dispatch(clearDoshaState());
          dispatch(clearDietState());
          dispatch(clearAnalyticsState());
          dispatch(
            setCredentials({
              token: res.data?.token,
              userId: res.data?.userId,
              email: res.data?.email || email.trim(),
              fullName: res.data?.fullName || fullName.trim(),
            })
          );
          dispatch(
            setProfile({
              id: res.data?.userId || 1,
              userId: res.data?.userId || 1,
              email: res.data?.email || email.trim(),
              fullName: res.data?.fullName || fullName.trim(),
              age: age || 25,
              gender,
              weightKg: effectiveKg,
              heightCm: effectiveCm,
              bmi: Number((effectiveKg / Math.pow(effectiveCm / 100, 2)).toFixed(1)),
              activityLevel: 'Moderately Active',
              budgetPerDayInr: 250,
              primaryHealthGoal: 'Immunity & Balance',
              digestiveFireAgni: 'SAMA',
              targetDiseaseCondition: 'General Wellness',
              profileCompleted: false,
            })
          );
        })
        .catch((err) => {
          setLoading(false);
          const serverMsg = err.response?.data?.message;
          if (serverMsg && typeof serverMsg === 'string' && !serverMsg.toLowerCase().includes('status code')) {
            if (serverMsg.toLowerCase().includes('already registered') || serverMsg.toLowerCase().includes('exists')) {
              setErrorMessage('An account with this email already exists.');
            } else {
              setErrorMessage(serverMsg);
            }
          } else if (err.response?.status === 400 || err.response?.status === 409) {
            setErrorMessage('An account with this email already exists.');
          } else if (!err.response) {
            setErrorMessage('Unable to connect to the server. Please try again.');
          } else {
            setErrorMessage('Unable to create your account. Please try again.');
          }
        });
    }
  };

  const genderOptions = [
    { id: 'FEMALE', label: 'Female', icon: Heart },
    { id: 'MALE', label: 'Male', icon: User },
    { id: 'OTHER', label: 'Other', icon: Leaf },
    { id: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say', icon: ShieldCheck },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0F2F25] via-[#1B4D3E] to-[#0A221A] text-charcoal flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* ONBOARDING-INSPIRED DARK GREEN AMBIENT BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
        {/* Soft Ambient Radial Glow Behind Center Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#87A96B]/15 rounded-full blur-[140px]" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2C5E4E]/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#87A96B]/10 rounded-full blur-[100px]" />

        {/* Subtle Translucent Organic SVG Shapes */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <circle cx="200" cy="150" r="320" fill="#87A96B" />
          <circle cx="1240" cy="750" r="360" fill="#2C5E4E" />
        </svg>
      </div>

      {/* MAIN AUTHENTICATION CONTAINER */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-white/20 shadow-2xl shadow-black/35 p-6 sm:p-8 space-y-6">
        
        {/* Top Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {isRegister && signUpStep === 2 ? (
              <button
                type="button"
                onClick={() => {
                  setSignUpStep(1);
                  setErrorMessage('');
                }}
                className="text-forest hover:text-forest-light font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div className="w-8" />
            )}

            <AyurWellLogo size="md" className="mx-auto" />

            <div className="w-8" />
          </div>

          <div className="text-center space-y-2">
            {isRegister && (
              <span className="inline-block bg-sage-light text-forest text-[11px] font-semibold tracking-wide px-3 py-0.5 rounded-full border border-sage/20 mb-1">
                STEP {signUpStep} OF 2
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest leading-tight">
              {!isRegister
                ? 'Welcome to AyurWell'
                : signUpStep === 1
                ? 'Create Your AyurWell Account'
                : 'Tell Us About You'}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-gold-dark uppercase tracking-wider">
              Ayurvedic Diet Planning and Nutrient Analysis System
            </p>
            <p className="text-xs sm:text-sm text-charcoal-muted font-normal leading-relaxed">
              {!isRegister
                ? 'Your Personalized Ayurvedic Wellness Companion'
                : signUpStep === 1
                ? 'Enter your details to get started with tailored nutrition.'
                : 'Help us personalize your Ayurvedic wellness experience.'}
            </p>
          </div>
        </div>

        {/* Inline Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleNextOrSubmit} className="space-y-4" autoComplete="off">
          {/* Hidden dummy inputs to absorb aggressive browser autofill */}
          <input type="text" name="prevent_autofill_user" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />
          <input type="password" name="prevent_autofill_pwd" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="new-password" />
          
          {/* LOGIN OR SIGN UP STEP 1 */}
          {(!isRegister || signUpStep === 1) && (
            <>
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-charcoal-muted absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      name="ayurwell_auth_fullname"
                      autoComplete="off"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    name="ayurwell_auth_email"
                    autoComplete="off"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-charcoal">
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset instructions will be sent to your registered email.')}
                      className="text-xs font-medium text-forest hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="ayurwell_auth_password"
                    autoComplete="new-password"
                    placeholder={isRegister ? 'Create a password' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-charcoal-muted hover:text-forest transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="ayurwell_auth_confirmpassword"
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-charcoal-muted hover:text-forest transition-colors cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* SIGN UP STEP 2: PROFILE DETAILS */}
          {isRegister && signUpStep === 2 && (
            <div className="space-y-4">
              
              {/* Gender Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charcoal">
                  Gender
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = gender === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setGender(opt.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                          isSelected
                            ? 'border-forest bg-sage-light text-forest shadow-xs'
                            : 'border-ivory-dark bg-white hover:border-sage text-charcoal'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-forest text-white' : 'bg-ivory text-charcoal-muted'}`}>
                          <OptIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold flex-1">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-forest shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charcoal">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-charcoal-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Height */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-charcoal flex items-center space-x-1">
                    <Ruler className="w-3.5 h-3.5 text-forest" />
                    <span>Height</span>
                  </label>

                  <div className="flex rounded-lg bg-ivory p-0.5 border border-ivory-dark text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => handleHeightUnitToggle('CM')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        heightUnit === 'CM' ? 'bg-forest text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHeightUnitToggle('FT')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        heightUnit === 'FT' ? 'bg-forest text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      FT
                    </button>
                  </div>
                </div>

                {heightUnit === 'CM' ? (
                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      max="260"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="e.g. 165"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-charcoal-muted font-medium">cm</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                        placeholder="Feet (e.g. 5)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        placeholder="Inches (e.g. 6)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-charcoal flex items-center space-x-1">
                    <WeightIcon className="w-3.5 h-3.5 text-forest" />
                    <span>Weight</span>
                  </label>

                  <div className="flex rounded-lg bg-ivory p-0.5 border border-ivory-dark text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => handleWeightUnitToggle('KG')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        weightUnit === 'KG' ? 'bg-forest text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWeightUnitToggle('LBS')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        weightUnit === 'LBS' ? 'bg-forest text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      LBS
                    </button>
                  </div>
                </div>

                <div className="relative">
                  {weightUnit === 'KG' ? (
                    <input
                      type="number"
                      min="20"
                      max="350"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="e.g. 60"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                      required
                    />
                  ) : (
                    <input
                      type="number"
                      min="44"
                      max="770"
                      value={weightLbs}
                      onChange={(e) => setWeightLbs(e.target.value)}
                      placeholder="e.g. 132"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark bg-white text-xs font-medium text-charcoal placeholder:text-charcoal-muted/50 focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 hover:border-forest/30 transition-all"
                      required
                    />
                  )}
                  <span className="absolute right-3 top-2.5 text-xs text-charcoal-muted font-medium uppercase">{weightUnit}</span>
                </div>
              </div>

              {/* Privacy Message */}
              <div className="text-[11px] text-charcoal-muted flex items-center justify-center space-x-1.5 pt-1 text-center">
                <Lock className="w-3 h-3 text-forest shrink-0" />
                <span>Your information is private and used to personalize your health recommendations.</span>
              </div>

            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest hover:bg-forest-light active:scale-[0.99] text-white font-semibold py-3 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>
                  {isRegister
                    ? signUpStep === 1
                      ? 'Please wait...'
                      : 'Creating profile...'
                    : 'Signing in...'}
                </span>
              </div>
            ) : (
              <>
                <span>
                  {!isRegister
                    ? 'Login'
                    : signUpStep === 1
                    ? 'Continue'
                    : 'Complete Profile & Start'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="pt-4 text-center text-xs text-charcoal-muted border-t border-ivory-dark">
          {!isRegister ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleSwitchToSignUp}
                className="text-forest font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="text-forest font-semibold hover:underline cursor-pointer"
              >
                Login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
