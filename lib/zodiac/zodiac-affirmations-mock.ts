export type AffirmationMood =
  | "calm"
  | "confidence"
  | "love"
  | "money"
  | "focus"
  | "energy";

export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type AffirmationResult = {
  sign: ZodiacSign;
  mood: AffirmationMood;
  headline: string;
  affirmation: string;
  practicalHint: string;
  vipPreview: string;
};

const mockAffirmations: Record<AffirmationMood, Record<ZodiacSign, Omit<AffirmationResult, "sign" | "mood">>> = {
  calm: {
    aries: { headline: "Find Your Center", affirmation: "I channel my fiery energy into peaceful presence.", practicalHint: "Take 3 deep breaths before responding today.", vipPreview: "Preview your personalized calming rituals for Aries." },
    taurus: { headline: "Grounded Peace", affirmation: "I am rooted like a tree, unshakable and calm.", practicalHint: "Spend 5 minutes in nature or looking at the sky.", vipPreview: "Preview deeper Taurus grounding techniques." },
    gemini: { headline: "Quiet the Mind", affirmation: "I release the need to know everything at once.", practicalHint: "Write down your racing thoughts, then close the notebook.", vipPreview: "Preview mental clarity guides for Gemini." },
    cancer: { headline: "Emotional Stillness", affirmation: "My feelings flow like water, and I watch them peacefully.", practicalHint: "Drink a glass of water while focusing only on the sensation.", vipPreview: "Preview emotional mastery for Cancer." },
    leo: { headline: "Resting Power", affirmation: "I don't need to roar to be powerful. My peace is my strength.", practicalHint: "Enjoy a moment of silence without any audience.", vipPreview: "Preview the Leo art of peaceful magnetism." },
    virgo: { headline: "Perfectly Imperfect", affirmation: "I release control and find peace in what simply is.", practicalHint: "Leave one minor task unfinished today intentionally.", vipPreview: "Preview Virgo's guide to stress-free productivity." },
    libra: { headline: "Inner Balance", affirmation: "My harmony comes from within, not from pleasing others.", practicalHint: "Say no to one small thing that disrupts your peace.", vipPreview: "Preview boundary-setting for Libra." },
    scorpio: { headline: "Deep Waters", affirmation: "I surrender to the quiet depths of my soul.", practicalHint: "Sit in a dimly lit room and embrace the stillness.", vipPreview: "Preview shadow-work for Scorpio calm." },
    sagittarius: { headline: "Present Journey", affirmation: "I am exactly where I need to be right now.", practicalHint: "Pause planning the future and focus on your immediate surroundings.", vipPreview: "Preview mindful adventuring for Sagittarius." },
    capricorn: { headline: "Mountain Serenity", affirmation: "I pause my climb to appreciate the view.", practicalHint: "Take a 10-minute break from all productive activities.", vipPreview: "Preview stress relief for the Capricorn achiever." },
    aquarius: { headline: "Spacious Mind", affirmation: "I detach from chaos and float in my own mental space.", practicalHint: "Unplug from digital devices for 30 minutes.", vipPreview: "Preview the Aquarian guide to mental detox." },
    pisces: { headline: "Oceanic Calm", affirmation: "I am safe in the gentle currents of the universe.", practicalHint: "Listen to a soothing ambient track for 5 minutes.", vipPreview: "Preview the Pisces guide to spiritual grounding." },
  },
  confidence: {
    aries: { headline: "Unstoppable Force", affirmation: "I am the spark that ignites greatness.", practicalHint: "Take the lead on a small project today.", vipPreview: "Preview your Aries power traits." },
    taurus: { headline: "Unshakable Value", affirmation: "I know my worth, and I do not settle for less.", practicalHint: "Wear something that makes you feel luxurious.", vipPreview: "Preview Taurus wealth attraction." },
    gemini: { headline: "Brilliant Mind", affirmation: "My words have power and my ideas are brilliant.", practicalHint: "Share a bold idea with someone today.", vipPreview: "Preview Gemini communication mastery." },
    cancer: { headline: "Fierce Protector", affirmation: "My vulnerability is my greatest armor.", practicalHint: "Set a firm boundary with confidence.", vipPreview: "Preview Cancer's emotional fortitude." },
    leo: { headline: "Radiant Light", affirmation: "I was born to shine, and I do not dim my light for anyone.", practicalHint: "Accept a compliment today simply by saying 'Thank you'.", vipPreview: "Preview Leo's ultimate charisma guide." },
    virgo: { headline: "Master of Craft", affirmation: "My competence is undeniable, and my skills are elite.", practicalHint: "Acknowledge something you do better than anyone else.", vipPreview: "Preview Virgo's guide to unshakeable self-esteem." },
    libra: { headline: "Charming Authority", affirmation: "I command the room with grace and beauty.", practicalHint: "Make a decisive choice without asking for second opinions.", vipPreview: "Preview Libra's magnetic presence secrets." },
    scorpio: { headline: "Intense Power", affirmation: "I am a force of nature, transforming everything I touch.", practicalHint: "Maintain strong eye contact in your next conversation.", vipPreview: "Preview Scorpio's guide to quiet dominance." },
    sagittarius: { headline: "Fearless Explorer", affirmation: "I trust my instincts to guide me to greatness.", practicalHint: "Do something slightly out of your comfort zone today.", vipPreview: "Preview Sagittarius' luck manifestation techniques." },
    capricorn: { headline: "Absolute Authority", affirmation: "I am the architect of my own empire.", practicalHint: "Review your goals and cross off one step.", vipPreview: "Preview Capricorn's guide to commanding respect." },
    aquarius: { headline: "Visionary Genius", affirmation: "My uniqueness is my superpower.", practicalHint: "Express an unconventional opinion proudly.", vipPreview: "Preview Aquarius' guide to revolutionary confidence." },
    pisces: { headline: "Magical Creator", affirmation: "I trust my intuition; it never leads me astray.", practicalHint: "Trust your gut feeling on a decision today without overthinking.", vipPreview: "Preview Pisces' intuitive power." },
  },
  love: {
    aries: { headline: "Passionate Heart", affirmation: "I attract love that matches my intense fire.", practicalHint: "Surprise someone with a spontaneous gesture.", vipPreview: "Preview Aries compatibility secrets." },
    taurus: { headline: "Sensual Romance", affirmation: "I am worthy of a stable, luxurious, and deep love.", practicalHint: "Create a cozy, romantic atmosphere tonight.", vipPreview: "Preview Taurus love languages." },
    gemini: { headline: "Mind & Heart", affirmation: "I attract partners who stimulate my mind and soul.", practicalHint: "Ask a deep, thought-provoking question to a loved one.", vipPreview: "Preview Gemini flirtation mastery." },
    cancer: { headline: "Deep Devotion", affirmation: "I give and receive love unconditionally.", practicalHint: "Cook a meal or do a caring act for someone you love.", vipPreview: "Preview Cancer soulmate attraction." },
    leo: { headline: "Royal Romance", affirmation: "I attract a love story worthy of a movie.", practicalHint: "Treat your partner (or yourself) like royalty today.", vipPreview: "Preview Leo's guide to passionate love." },
    virgo: { headline: "Acts of Love", affirmation: "I am worthy of a love that pays attention to the details.", practicalHint: "Do a small favor for someone to show you care.", vipPreview: "Preview Virgo's practical romance guide." },
    libra: { headline: "Perfect Harmony", affirmation: "I am a magnet for balanced, beautiful relationships.", practicalHint: "Send a sweet, aesthetic message to someone special.", vipPreview: "Preview Libra's ultimate relationship harmony." },
    scorpio: { headline: "Soul Connection", affirmation: "I am ready for a transformative, soul-deep love.", practicalHint: "Share a secret or deep thought with your partner.", vipPreview: "Preview Scorpio's guide to intense intimacy." },
    sagittarius: { headline: "Adventurous Love", affirmation: "I attract love that feels like an exciting journey.", practicalHint: "Plan a fun, mini-adventure with a loved one.", vipPreview: "Preview Sagittarius' guide to free-spirited romance." },
    capricorn: { headline: "Enduring Bond", affirmation: "I am building a love that will stand the test of time.", practicalHint: "Discuss future plans with your partner.", vipPreview: "Preview Capricorn's guide to power-couple dynamics." },
    aquarius: { headline: "Best Friends First", affirmation: "I attract a partner who truly understands my weirdness.", practicalHint: "Engage in a shared hobby or interest with a loved one.", vipPreview: "Preview Aquarius' guide to unconventional love." },
    pisces: { headline: "Fairy Tale Romance", affirmation: "I am open to a magical, unconditional love.", practicalHint: "Write a heartfelt note or poem.", vipPreview: "Preview Pisces' guide to soulmate connection." },
  },
  money: {
    aries: { headline: "Pioneering Wealth", affirmation: "I boldly claim the abundance that is mine.", practicalHint: "Take a direct action towards a financial goal today.", vipPreview: "Preview Aries wealth-building strategies." },
    taurus: { headline: "Steady Abundance", affirmation: "Money flows to me easily and consistently.", practicalHint: "Review your savings and feel gratitude for what you have.", vipPreview: "Preview Taurus financial mastery." },
    gemini: { headline: "Clever Income", affirmation: "My ideas are lucrative and my streams of income are many.", practicalHint: "Brainstorm a new way to monetize a skill.", vipPreview: "Preview Gemini's guide to multiple income streams." },
    cancer: { headline: "Secure Future", affirmation: "I am building a safe and prosperous foundation for my family.", practicalHint: "Put a small amount of money into a secure savings account.", vipPreview: "Preview Cancer's guide to financial security." },
    leo: { headline: "Golden Touch", affirmation: "I attract wealth and luxury effortlessly.", practicalHint: "Invest a small amount in something that elevates your personal brand.", vipPreview: "Preview Leo's guide to manifesting luxury." },
    virgo: { headline: "Meticulous Wealth", affirmation: "My attention to detail brings me financial success.", practicalHint: "Organize your receipts or budget today.", vipPreview: "Preview Virgo's wealth management secrets." },
    libra: { headline: "Balanced Finances", affirmation: "I spend and save in perfect, beautiful harmony.", practicalHint: "Find a way to save money on a luxury item.", vipPreview: "Preview Libra's guide to aesthetic abundance." },
    scorpio: { headline: "Hidden Riches", affirmation: "I uncover lucrative opportunities others miss.", practicalHint: "Research an investment or passive income strategy.", vipPreview: "Preview Scorpio's guide to stealth wealth." },
    sagittarius: { headline: "Lucky Breaks", affirmation: "The universe constantly blesses me with financial windfalls.", practicalHint: "Take a calculated risk or apply for a new opportunity.", vipPreview: "Preview Sagittarius' luck manifestation for money." },
    capricorn: { headline: "Empire Builder", affirmation: "My hard work translates directly into massive wealth.", practicalHint: "Work on a long-term financial plan today.", vipPreview: "Preview Capricorn's CEO wealth mindset." },
    aquarius: { headline: "Future Wealth", affirmation: "My innovative ideas attract limitless prosperity.", practicalHint: "Explore a new technology or trend that could be profitable.", vipPreview: "Preview Aquarius' guide to futuristic wealth." },
    pisces: { headline: "Flowing Abundance", affirmation: "Money flows to me like water, naturally and abundantly.", practicalHint: "Visualize your bank account growing while you sleep.", vipPreview: "Preview Pisces' manifestation secrets for wealth." },
  },
  focus: {
    aries: { headline: "Laser Target", affirmation: "I zero in on my goals with unmatched intensity.", practicalHint: "Eliminate one distraction right now.", vipPreview: "Preview Aries hyper-focus techniques." },
    taurus: { headline: "Unwavering Determination", affirmation: "Once I set my mind to it, nothing can stop me.", practicalHint: "Work steadily for 45 minutes without stopping.", vipPreview: "Preview Taurus endurance secrets." },
    gemini: { headline: "Mental Clarity", affirmation: "I quiet the noise and focus on what truly matters.", practicalHint: "Close all unnecessary browser tabs.", vipPreview: "Preview Gemini's guide to curing scattered thoughts." },
    cancer: { headline: "Emotional Focus", affirmation: "I channel my feelings into productive action.", practicalHint: "Set a timer and work on a task you've been avoiding.", vipPreview: "Preview Cancer's guide to emotional productivity." },
    leo: { headline: "Commanding Attention", affirmation: "I direct my powerful energy exactly where it needs to go.", practicalHint: "Tackle your most important task first thing today.", vipPreview: "Preview Leo's guide to leading with focus." },
    virgo: { headline: "Microscopic Precision", affirmation: "I see every detail and execute flawlessly.", practicalHint: "Proofread or double-check your current project.", vipPreview: "Preview Virgo's ultimate productivity system." },
    libra: { headline: "Balanced Priorities", affirmation: "I weigh my options and focus on the most valuable task.", practicalHint: "Make a prioritized list of just 3 things to do today.", vipPreview: "Preview Libra's guide to decision-making focus." },
    scorpio: { headline: "Obsessive Drive", affirmation: "I dive deep and master whatever I focus on.", practicalHint: "Immerse yourself completely in one topic for an hour.", vipPreview: "Preview Scorpio's deep work secrets." },
    sagittarius: { headline: "Target Locked", affirmation: "I aim high and stay focused on the big picture.", practicalHint: "Remind yourself why you started your current project.", vipPreview: "Preview Sagittarius' visionary focus." },
    capricorn: { headline: "Disciplined Mind", affirmation: "I have the discipline to focus when others quit.", practicalHint: "Schedule your entire day in time blocks.", vipPreview: "Preview Capricorn's time management mastery." },
    aquarius: { headline: "Genius Zone", affirmation: "I tap into my unique brilliance and concentrate fully.", practicalHint: "Work in a new, unconventional environment today.", vipPreview: "Preview Aquarius' guide to flow states." },
    pisces: { headline: "Intuitive Flow", affirmation: "I trust my flow and focus effortlessly on my art.", practicalHint: "Let go of rigid schedules and work intuitively for an hour.", vipPreview: "Preview Pisces' creative focus guide." },
  },
  energy: {
    aries: { headline: "Boundless Vitality", affirmation: "I am a powerhouse of endless, fiery energy.", practicalHint: "Do a quick burst of intense physical exercise.", vipPreview: "Preview Aries' guide to limitless stamina." },
    taurus: { headline: "Earthly Strength", affirmation: "I draw deep, sustaining energy from the earth.", practicalHint: "Eat a nourishing, grounding meal.", vipPreview: "Preview Taurus' guide to sustained vitality." },
    gemini: { headline: "Electric Mind", affirmation: "My mind is buzzing with brilliant, lively energy.", practicalHint: "Have a fast-paced, stimulating conversation.", vipPreview: "Preview Gemini's mental energy hacks." },
    cancer: { headline: "Lunar Power", affirmation: "I ride the waves of my natural energy cycles.", practicalHint: "Take a short power nap or rest your eyes.", vipPreview: "Preview Cancer's guide to emotional energy." },
    leo: { headline: "Solar Flare", affirmation: "I radiate warm, life-giving energy to everyone around me.", practicalHint: "Do something that makes you laugh out loud.", vipPreview: "Preview Leo's guide to charismatic energy." },
    virgo: { headline: "Efficient Power", affirmation: "I use my energy perfectly and waste nothing.", practicalHint: "Declutter your workspace to free up mental energy.", vipPreview: "Preview Virgo's energy optimization." },
    libra: { headline: "Harmonious Flow", affirmation: "My energy flows smoothly and beautifully.", practicalHint: "Do some light stretching or yoga.", vipPreview: "Preview Libra's guide to balanced vitality." },
    scorpio: { headline: "Regenerative Force", affirmation: "I transform exhaustion into powerful, renewed energy.", practicalHint: "Take a cold shower or splash cold water on your face.", vipPreview: "Preview Scorpio's phoenix energy secrets." },
    sagittarius: { headline: "Kinetic Spirit", affirmation: "I am always moving forward with enthusiastic energy.", practicalHint: "Go for a brisk walk in a new neighborhood.", vipPreview: "Preview Sagittarius' guide to adventurous vitality." },
    capricorn: { headline: "Enduring Stamina", affirmation: "I have the energy to outlast any obstacle.", practicalHint: "Drink a large glass of water to fuel your body.", vipPreview: "Preview Capricorn's relentless stamina secrets." },
    aquarius: { headline: "Quantum Leap", affirmation: "My energy operates on a higher, faster frequency.", practicalHint: "Listen to upbeat, electronic music.", vipPreview: "Preview Aquarius' high-frequency energy." },
    pisces: { headline: "Mystical Current", affirmation: "I channel limitless energy from the universe.", practicalHint: "Meditate for 5 minutes to recharge your spirit.", vipPreview: "Preview Pisces' spiritual energy channeling." },
  }
};

export function getMockAffirmation(sign: ZodiacSign, mood: AffirmationMood): AffirmationResult {
  const result = mockAffirmations[mood][sign];
  
  return {
    sign,
    mood,
    ...result
  };
}
