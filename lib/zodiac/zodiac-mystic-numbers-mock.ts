export type MysticNumberInput = {
  numberText: string;
  mood?: "calm" | "focused" | "romantic" | "uncertain" | "energy";
};

export type MysticNumberResult = {
  normalizedNumber: string;
  patternType: "repeating" | "mirror" | "sequence" | "single" | "mixed";
  headline: string;
  meaning: string;
  actionHint: string;
  affirmation: string;
  vipPreview: string;
};

// Static interpretations mock
const patternMeanings: Record<string, { headline: string; meaning: string; action: string; affirmation: string }> = {
  "111": {
    headline: "Intuition & Manifestation",
    meaning: "Your thoughts are rapidly becoming your reality. The universe is taking a snapshot of your intentions.",
    action: "Keep your thoughts positive and focused on your desires.",
    affirmation: "I am a powerful creator of my reality.",
  },
  "222": {
    headline: "Alignment & Balance",
    meaning: "You are exactly where you need to be. Trust the process and have faith in the unfolding of events.",
    action: "Seek harmony in your relationships and trust your intuition.",
    affirmation: "Everything is working out for my highest good.",
  },
  "333": {
    headline: "Support & Expansion",
    meaning: "The ascended masters are near, offering you love, support, and guidance.",
    action: "Express your truth creatively and joyfully.",
    affirmation: "I am supported by the universe in all that I do.",
  },
  "444": {
    headline: "Protection & Stability",
    meaning: "You are surrounded by angels who are protecting and guiding you. You have a solid foundation.",
    action: "Focus on your goals with discipline and determination.",
    affirmation: "I am safe, protected, and grounded.",
  },
  "555": {
    headline: "Change & Transformation",
    meaning: "Major life changes are upon you. Embrace them with an open mind and heart.",
    action: "Release the old to make room for the new.",
    affirmation: "I welcome positive change into my life.",
  },
  "666": {
    headline: "Reflection & Realignment",
    meaning: "It's time to find balance between your material and spiritual life. Reassess your priorities.",
    action: "Focus on gratitude and nurture your inner peace.",
    affirmation: "I am perfectly balanced in mind, body, and spirit.",
  },
  "777": {
    headline: "Luck & Spiritual Awakening",
    meaning: "You are on the right path and in alignment with your soul's purpose. Miracles are occurring.",
    action: "Continue your spiritual growth and trust your inner wisdom.",
    affirmation: "I am open to receiving divine blessings.",
  },
  "888": {
    headline: "Abundance & Success",
    meaning: "Financial and material abundance are flowing your way. Your hard work is paying off.",
    action: "Receive with gratitude and share your prosperity.",
    affirmation: "I am a magnet for infinite abundance.",
  },
  "999": {
    headline: "Completion & Transition",
    meaning: "A significant phase of your life is ending, making way for a new beginning.",
    action: "Let go of what no longer serves you and embrace the future.",
    affirmation: "I am ready for my next chapter.",
  },
  "1111": {
    headline: "Spiritual Awakening",
    meaning: "A gateway has opened up for you. Your thoughts are manifesting at lightning speed.",
    action: "Pay attention to your thoughts and set clear intentions.",
    affirmation: "I am aligned with my highest truth.",
  },
  "1212": {
    headline: "Cosmic Connection",
    meaning: "Step out of your comfort zone and explore new ways to manifest your dreams.",
    action: "Stay positive and focus on your highest aspirations.",
    affirmation: "I am stepping into my true power.",
  },
  "mirror": {
    headline: "Reflection of the Soul",
    meaning: "The universe is reflecting your inner state back to you. What you see outside is what you hold inside.",
    action: "Take a moment to center yourself and observe your emotions.",
    affirmation: "I embrace the mirror of life to understand myself better.",
  },
  "sequence": {
    headline: "Forward Momentum",
    meaning: "You are progressing smoothly along your path. Step by step, you are moving forward.",
    action: "Keep taking consistent action towards your goals.",
    affirmation: "I am constantly evolving and moving forward.",
  },
  "mixed": {
    headline: "Hidden Messages",
    meaning: "The universe is whispering to you in subtle ways. There is a unique message hidden in this specific combination.",
    action: "Meditate on this number and see what feelings arise.",
    affirmation: "I am open to the subtle guidance of the universe.",
  },
  "single": {
    headline: "Core Essence",
    meaning: "A strong, singular focus is required right now. Return to the basics.",
    action: "Simplify your life and focus on one thing at a time.",
    affirmation: "I am focused, clear, and centered.",
  }
};

export function calculateMockMysticNumber(input: MysticNumberInput): MysticNumberResult {
  // Normalize input to digits only
  const normalizedNumber = input.numberText.replace(/\D/g, '');
  
  if (!normalizedNumber) {
    return {
      normalizedNumber: "?",
      patternType: "mixed",
      headline: "Awaiting Input",
      meaning: "Please enter a valid number to receive your mystic interpretation.",
      actionHint: "Look around you for recurring numbers.",
      affirmation: "I am open to divine guidance.",
      vipPreview: "Unlock premium numerology to decode any number in the universe."
    };
  }

  let patternType: MysticNumberResult["patternType"] = "mixed";
  let interpretationKey = "mixed";

  // Detect patterns
  if (normalizedNumber.length === 1) {
    patternType = "single";
    interpretationKey = "single";
    // If it's a single digit 1-9, maybe we could use a specific meaning, but fallback is fine for mock
    if (["1","2","3","4","5","6","7","8","9"].includes(normalizedNumber)) {
        // Just keeping it simple for the mock
    }
  } else if (/^(\d)\1+$/.test(normalizedNumber)) {
    patternType = "repeating";
    interpretationKey = normalizedNumber;
    if (!patternMeanings[interpretationKey]) {
      // Fallback for repeating patterns not specifically mapped (e.g., 2222)
      interpretationKey = normalizedNumber.slice(0, 3); // try to match 3 digits
      if (!patternMeanings[interpretationKey]) {
          interpretationKey = "111"; // ultimate fallback for repeating
      }
    }
  } else if (normalizedNumber === normalizedNumber.split('').reverse().join('')) {
    patternType = "mirror";
    interpretationKey = "mirror";
    if (patternMeanings[normalizedNumber]) {
        interpretationKey = normalizedNumber;
    }
  } else if ("123456789".includes(normalizedNumber) || "987654321".includes(normalizedNumber)) {
    patternType = "sequence";
    interpretationKey = "sequence";
  }

  // Exact match override (e.g. 1212)
  if (patternMeanings[normalizedNumber]) {
    interpretationKey = normalizedNumber;
  }

  const interpretation = patternMeanings[interpretationKey] || patternMeanings["mixed"];

  return {
    normalizedNumber,
    patternType,
    headline: interpretation.headline,
    meaning: interpretation.meaning,
    actionHint: interpretation.action,
    affirmation: interpretation.affirmation,
    vipPreview: `Unlock deep insights into the karmic significance of ${normalizedNumber} in your personal chart.`,
  };
}
