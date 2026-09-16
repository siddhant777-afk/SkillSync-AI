import { useState } from "react";
import {
  STYLE_DIRECTIONS,
  COLOR_PALETTES,
  FONT_PAIRINGS,
  DIVIDER_STYLES,
  HEADER_LAYOUTS,
} from "./resumeConfig";
import {
  Palette,
  Type,
  Layout,
  Sliders,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const VisualCustomizer = ({ customization, onChange, onApplyDirection }) => {
  const [activeTab, setActiveTab] = useState("style"); // style, typography, color, layout

  const tabs = [
    { id: "style", label: "Style Direction", icon: Sparkles },
    { id: "color", label: "Color Theme", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "layout", label: "Layout & Spacing", icon: Layout },
  ];

  const handleResetToPreset = (directionId) => {
    const found = STYLE_DIRECTIONS.find((d) => d.id === directionId);
    if (found && onApplyDirection) {
      onApplyDirection(found);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 gap-1 pb-2 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-w-0">
        {/* TAB 1: Style Direction Presets */}
        {activeTab === "style" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Design Personality Presets
              </span>
              <span className="text-[11px] text-slate-400">1-click complete visual alignment</span>
            </div>

            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              {STYLE_DIRECTIONS.map((dir) => {
                const isSelected = customization.styleDirection === dir.id;
                return (
                  <button
                    key={dir.id}
                    onClick={() => handleResetToPreset(dir.id)}
                    className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: dir.accentColor }}
                        />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {dir.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {dir.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Color Palette */}
        {activeTab === "color" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Accent Color
              </span>
              <span className="text-xs font-mono text-slate-500">{customization.accentColor}</span>
            </div>

            {/* Swatches */}
            <div className="flex flex-wrap gap-2 items-center">
              {COLOR_PALETTES.map((pal) => {
                const isSelected = customization.accentColor.toLowerCase() === pal.hex.toLowerCase();
                return (
                  <button
                    key={pal.id}
                    onClick={() => onChange("accentColor", pal.hex)}
                    className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                      isSelected
                        ? "border-slate-900 dark:border-white shadow-xs font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full shadow-inner border border-black/10 shrink-0"
                      style={{ backgroundColor: pal.hex }}
                    />
                    <span>{pal.name}</span>
                  </button>
                );
              })}

              {/* Custom Hex Color Input */}
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1 bg-slate-50 dark:bg-slate-850">
                <input
                  type="color"
                  value={customization.accentColor}
                  onChange={(e) => onChange("accentColor", e.target.value)}
                  className="h-5 w-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title="Pick custom hex color"
                />
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">Custom</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Typography */}
        {activeTab === "typography" && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Font Pairings
              </span>
              <div className="mt-2 grid gap-2 grid-cols-1 sm:grid-cols-2">
                {FONT_PAIRINGS.map((fp) => {
                  const isSelected = customization.fontPairing === fp.id;
                  return (
                    <button
                      key={fp.id}
                      onClick={() => onChange("fontPairing", fp.id)}
                      className={`text-left p-2.5 rounded-xl border transition ${
                        isSelected
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-850"
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{fp.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{fp.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Base Font Size
              </span>
              <div className="mt-1.5 flex gap-2">
                {[
                  { id: "compact", label: "Compact (Dense)" },
                  { id: "standard", label: "Standard (Recommended)" },
                  { id: "spacious", label: "Spacious (Relaxed)" },
                ].map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => onChange("fontSize", sz.id)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition ${
                      customization.fontSize === sz.id
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Layout & Spacing */}
        {activeTab === "layout" && (
          <div className="space-y-4">
            {/* Section Spacing */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Section Vertical Spacing
              </span>
              <div className="mt-1.5 flex gap-2">
                {["compact", "standard", "spacious"].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => onChange("sectionSpacing", sp)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border text-center transition ${
                      customization.sectionSpacing === sp
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Margins */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Document Margins
              </span>
              <div className="mt-1.5 flex gap-2">
                {[
                  { id: "compact", label: "Compact" },
                  { id: "standard", label: "Standard" },
                  { id: "generous", label: "Generous" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onChange("margins", m.id)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition ${
                      customization.margins === m.id
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider Style & Header Layout */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Divider Style
                </span>
                <select
                  value={customization.dividerStyle}
                  onChange={(e) => onChange("dividerStyle", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
                >
                  {DIVIDER_STYLES.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Icons Usage
                </span>
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() => onChange("showIcons", true)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition ${
                      customization.showIcons
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Subtle Icons
                  </button>
                  <button
                    onClick={() => onChange("showIcons", false)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition ${
                      !customization.showIcons
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Pure ATS Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualCustomizer;
