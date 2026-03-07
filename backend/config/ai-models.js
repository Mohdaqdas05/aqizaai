module.exports = {
  models: [
    // ── OpenRouter models ───────────────────────────────────────────────────
    { id: 'openai/gpt-4o',                              name: 'GPT-4o (via OpenRouter)',           plan: 'pro',  provider: 'openrouter' },
    { id: 'openai/gpt-4o-mini',                         name: 'GPT-4o Mini (via OpenRouter)',      plan: 'free', provider: 'openrouter' },
    { id: 'anthropic/claude-3.5-sonnet',                name: 'Claude 3.5 Sonnet',                 plan: 'pro',  provider: 'openrouter' },
    { id: 'meta-llama/llama-3.1-8b-instruct:free',      name: 'Llama 3.1 8B',                      plan: 'free', provider: 'openrouter' },
    { id: 'google/gemini-flash-1.5',                    name: 'Gemini Flash 1.5 (via OpenRouter)', plan: 'plus', provider: 'openrouter' },
    { id: 'mistralai/mistral-7b-instruct:free',         name: 'Mistral 7B',                        plan: 'free', provider: 'openrouter' },

    // ── Direct OpenAI models ────────────────────────────────────────────────
    { id: 'direct-openai/gpt-4o',                       name: 'GPT-4o (Direct)',                   plan: 'pro',  provider: 'openai' },
    { id: 'direct-openai/gpt-4o-mini',                  name: 'GPT-4o Mini (Direct)',              plan: 'free', provider: 'openai' },
    { id: 'direct-openai/gpt-4-turbo',                  name: 'GPT-4 Turbo (Direct)',              plan: 'pro',  provider: 'openai' },
    { id: 'direct-openai/o1-mini',                      name: 'o1-mini (Direct)',                  plan: 'plus', provider: 'openai' },

    // ── Direct Google Gemini models ─────────────────────────────────────────
    { id: 'direct-gemini/gemini-1.5-pro',               name: 'Gemini 1.5 Pro (Direct)',           plan: 'pro',  provider: 'gemini' },
    { id: 'direct-gemini/gemini-1.5-flash',             name: 'Gemini 1.5 Flash (Direct)',         plan: 'free', provider: 'gemini' },
    { id: 'direct-gemini/gemini-2.0-flash',             name: 'Gemini 2.0 Flash (Direct)',         plan: 'plus', provider: 'gemini' },
  ],

  defaultModel: 'openai/gpt-4o-mini',

  plans: {
    free: [
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'direct-openai/gpt-4o-mini',
      'direct-gemini/gemini-1.5-flash',
    ],
    plus: [
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'google/gemini-flash-1.5',
      'direct-openai/gpt-4o-mini',
      'direct-openai/o1-mini',
      'direct-gemini/gemini-1.5-flash',
      'direct-gemini/gemini-2.0-flash',
    ],
    pro: [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'google/gemini-flash-1.5',
      'direct-openai/gpt-4o',
      'direct-openai/gpt-4o-mini',
      'direct-openai/gpt-4-turbo',
      'direct-openai/o1-mini',
      'direct-gemini/gemini-1.5-pro',
      'direct-gemini/gemini-1.5-flash',
      'direct-gemini/gemini-2.0-flash',
    ],
  },
};
