import React, { useEffect, useState } from "react";

const BG_COLORS = ["#0ea5e9", "#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const SKIN_COLORS = ["#f5c6a5", "#e9b08b", "#d9a47d", "#c98d6b", "#f0b49a"];
const HAIR_COLORS = ["#1f2937", "#4b2a1a", "#7c4a2f", "#c026d3", "#b91c1c", "#374151"];
const EYE_COLORS = ["#1d4ed8", "#16a34a", "#7c3aed", "#dc2626", "#0ea5e9", "#111827"];

function seededInt(seed, mod) {
  // Simple deterministic pseudo-rng from a seed number.
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * mod);
}

function pick(arr, seed, offset = 0) {
  return arr[seededInt(seed + offset, arr.length)];
}

function svgToDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function generateMemojiDataUri(seed) {
  const bg = pick(BG_COLORS, seed, 1);
  const skin = pick(SKIN_COLORS, seed, 2);
  const hair = pick(HAIR_COLORS, seed, 3);
  const eye = pick(EYE_COLORS, seed, 4);
  const mouthType = seededInt(seed + 5, 3); // 0..2

  const mouth =
    mouthType === 0
      ? `<path d="M92 158 Q120 176 148 158" stroke="#7c2d12" stroke-width="8" stroke-linecap="round" fill="none"/>`
      : mouthType === 1
      ? `<path d="M88 158 Q120 138 152 158" stroke="#7c2d12" stroke-width="8" stroke-linecap="round" fill="none"/>`
      : `<path d="M102 158 Q120 170 138 158" stroke="#7c2d12" stroke-width="8" stroke-linecap="round" fill="none"/>`;

  // Hair silhouette (very lightweight) + optional glasses (controlled by seed)
  const glasses = seededInt(seed + 6, 2) === 0;
  const glassesSvg = glasses
    ? `
      <rect x="62" y="108" width="44" height="28" rx="10" fill="none" stroke="#111827" stroke-width="6"/>
      <rect x="134" y="108" width="44" height="28" rx="10" fill="none" stroke="#111827" stroke-width="6"/>
      <path d="M106 122 H134" stroke="#111827" stroke-width="6" stroke-linecap="round"/>
    `
    : "";

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg}" stop-opacity="1"/>
        <stop offset="1" stop-color="#111827" stop-opacity="0.05"/>
      </linearGradient>
    </defs>
    <rect width="240" height="240" rx="56" fill="url(#g)"/>
    <circle cx="120" cy="125" r="66" fill="${skin}"/>
    <path d="M55 118 C65 60, 95 30, 120 30 C145 30, 175 60, 185 118
             C172 110, 152 96, 120 96 C88 96, 68 110, 55 118 Z" fill="${hair}"/>
    <circle cx="95" cy="125" r="10" fill="#ffffff"/>
    <circle cx="145" cy="125" r="10" fill="#ffffff"/>
    <circle cx="95" cy="125" r="5" fill="${eye}"/>
    <circle cx="145" cy="125" r="5" fill="${eye}"/>
    ${glassesSvg}
    ${mouth}
    <path d="M82 190 C95 175, 145 175, 158 190" stroke="#7c2d12" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.25"/>
  </svg>
  `.trim();

  return { dataUri: svgToDataUri(svg), bg };
}

const MemojiAvatarPicker = ({ onCancel, onSave }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [seed, setSeed] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  const regenerate = () => {
    const nextSeed = Date.now() + Math.floor(Math.random() * 100000);
    setSeed(nextSeed);
  };

  useEffect(() => {
    const list = Array.from({ length: 12 }).map((_, i) => {
      const s = seed + i * 97;
      const a = generateMemojiDataUri(s);
      return { id: `${seed}-${i}`, dataUri: a.dataUri, bg: a.bg };
    });
    setAvatars(list);
    setSelectedIndex(0);
  }, [seed]);

  const handleSave = async () => {
    if (selectedIndex == null) return;
    if (saving) return;
    setSaving(true);
    try {
      const selected = avatars[selectedIndex];
      if (!selected) return;
      await onSave(selected.dataUri);
    } finally {
      setSaving(false);
    }
  };

  const selectedUri = selectedIndex != null ? avatars[selectedIndex]?.dataUri : null;

  const canSave = Boolean(selectedUri) && !saving;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-blue-400">Choose your avatar</h3>
            <p className="text-gray-300 text-sm mt-1">Click one, then save. You can randomize anytime.</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-300 hover:text-white text-sm md:text-base"
            disabled={saving}
          >
            Close
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <button
            onClick={regenerate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-sm md:text-base"
            disabled={saving}
          >
            Randomize
          </button>

          <div className="flex items-center gap-3">
            <div className="text-gray-300 text-sm">Selected:</div>
            <div className="w-12 h-12 rounded-lg border border-gray-700 overflow-hidden">
              {selectedUri && <img src={selectedUri} alt="selected avatar" className="w-full h-full object-cover" />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {avatars.map((a, idx) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`rounded-lg border transition p-0 overflow-hidden ${
                idx === selectedIndex ? "border-blue-500" : "border-gray-700 hover:border-gray-500"
              }`}
              disabled={saving}
            >
              <img src={a.dataUri} alt={`avatar-${idx}`} className="w-full h-auto block bg-gray-900" />
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition text-sm md:text-base"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {saving ? "Saving..." : "Use Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemojiAvatarPicker;

