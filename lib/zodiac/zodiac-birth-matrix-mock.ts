export type BirthMatrixInput = {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string;
  name?: string;
};

export type BirthMatrixResult = {
  coreNumber: number;
  characterProfile: string;
  energyMatrix: Array<{
    label: string;
    value: number;
    meaning: string;
  }>;
  compatibilityHint: string;
  vipPreview: string;
};

// Static interpretations mock
const numberMeanings: Record<number, { profile: string; energy: string }> = {
  1: { profile: "The Leader. Independent, original, and driven.", energy: "Pioneering force, initiative, and courage." },
  2: { profile: "The Peacemaker. Cooperative, sensitive, and balanced.", energy: "Harmony, partnership, and intuition." },
  3: { profile: "The Communicator. Creative, expressive, and joyful.", energy: "Self-expression, imagination, and optimism." },
  4: { profile: "The Builder. Practical, disciplined, and reliable.", energy: "Stability, hard work, and foundation." },
  5: { profile: "The Adventurer. Versatile, curious, and free-spirited.", energy: "Change, adaptability, and experience." },
  6: { profile: "The Nurturer. Responsible, caring, and protective.", energy: "Love, responsibility, and community." },
  7: { profile: "The Seeker. Analytical, spiritual, and deep.", energy: "Truth, wisdom, and introspection." },
  8: { profile: "The Powerhouse. Ambitious, authoritative, and material.", energy: "Success, authority, and abundance." },
  9: { profile: "The Humanitarian. Compassionate, selfless, and wise.", energy: "Completion, empathy, and universal love." },
  11: { profile: "The Illuminator. Intuitive, visionary, and inspiring.", energy: "Spiritual insight, revelation, and higher intuition." },
  22: { profile: "The Master Builder. Practical idealist, visionary, and capable.", energy: "Manifestation, large-scale endeavors, and legacy." },
};

export function calculateMockBirthMatrix(input: BirthMatrixInput): BirthMatrixResult {
  // Simple deterministic numerology mock logic
  // This is NOT real production logic.
  let sum = 0;
  for (const char of input.birthDate) {
    if (char >= '0' && char <= '9') {
      sum += parseInt(char, 10);
    }
  }

  // Reduce to a single digit or master number
  let coreNumber = sum;
  while (coreNumber > 9 && coreNumber !== 11 && coreNumber !== 22) {
    let tempSum = 0;
    for (const char of coreNumber.toString()) {
      tempSum += parseInt(char, 10);
    }
    coreNumber = tempSum;
  }

  // Fallback to 1 if something went wrong
  if (!numberMeanings[coreNumber]) {
    coreNumber = 1;
  }

  const interpretation = numberMeanings[coreNumber];

  return {
    coreNumber,
    characterProfile: interpretation.profile,
    energyMatrix: [
      {
        label: "Destiny Path",
        value: coreNumber,
        meaning: interpretation.energy,
      },
      {
        label: "Hidden Potential",
        value: (coreNumber % 9) + 1, // Mock value
        meaning: numberMeanings[(coreNumber % 9) + 1].energy,
      },
      {
        label: "Current Cycle",
        value: 5, // Mock static value
        meaning: numberMeanings[5].energy,
      }
    ],
    compatibilityHint: "Your energy resonates deeply with numbers " + ((coreNumber % 9) + 1) + " and " + ((coreNumber % 7) + 2) + ".",
    vipPreview: "Unlock your full Birth Matrix to see your karmic lessons, life cycles, and deep compatibility connections.",
  };
}
