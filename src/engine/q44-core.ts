export const Q44Core = {
  version: "Sapphire-Q44",

  toneMap(input) {
    return input * 0.92 + 0.08;
  },

  halation(intensity = 0.35) {
    return {
      radius: 0.85,
      strength: intensity,
      falloff: 0.62,
    };
  },

  bloom(level = 1.0) {
    return {
      threshold: 0.82,
      intensity: level * 1.4,
      radius: 0.55,
    };
  },

  filmGrain(amount = 0.18) {
    return {
      grain: amount,
      roughness: 0.42,
      response: 0.33,
    };
  },

  colorimetry: {
    primaries: "Hollywood-2026",
    gamma: 2.4,
    whitePoint: "D65",
  },
};
