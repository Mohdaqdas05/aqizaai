"use client";

import { useState, useRef, useEffect } from "react";
import { AVAILABLE_MODELS, ModelInfo } from "@/lib/ai-providers";

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({
  currentModel,
  onModelChange,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === currentModel) || AVAILABLE_MODELS[0];

  // Group models by provider
  const groups: Record<string, ModelInfo[]> = {};
  AVAILABLE_MODELS.forEach((model) => {
    if (!groups[model.provider]) groups[model.provider] = [];
    groups[model.provider].push(model);
  });

  const providerLabels: Record<string, string> = {
    google: "Google Gemini",
    groq: "Groq (Ultra-fast)",
    openrouter: "OpenRouter (Free)",
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button
        className="model-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m8.66-14l-5.2 3m-6.92 4l-5.2 3m14.14 0l-5.2-3m-6.92-4l-5.2-3" />
        </svg>
        {selectedModel.name}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {isOpen && (
        <div className="model-dropdown">
          {Object.entries(groups).map(([provider, models]) => (
            <div key={provider} className="model-dropdown-group">
              <div className="model-dropdown-label">
                {providerLabels[provider] || provider}
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  className={`model-option ${
                    model.id === currentModel ? "selected" : ""
                  }`}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="model-option-name">{model.name}</span>
                  <span className="model-option-desc">
                    {model.description}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
