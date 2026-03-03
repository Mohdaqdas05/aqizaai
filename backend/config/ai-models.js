module.exports = {
  models: [
    { id: 'openai/gpt-4o',                              name: 'GPT-4o',           plan: 'pro'  },
    { id: 'openai/gpt-4o-mini',                         name: 'GPT-4o Mini',      plan: 'free' },
    { id: 'anthropic/claude-3.5-sonnet',                name: 'Claude 3.5 Sonnet',plan: 'pro'  },
    { id: 'meta-llama/llama-3.1-8b-instruct:free',      name: 'Llama 3.1 8B',     plan: 'free' },
    { id: 'google/gemini-flash-1.5',                    name: 'Gemini Flash 1.5', plan: 'plus' },
    { id: 'mistralai/mistral-7b-instruct:free',         name: 'Mistral 7B',       plan: 'free' },
  ],

  defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',

  plans: {
    free: [
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
    ],
    plus: [
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'google/gemini-flash-1.5',
    ],
    pro: [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'google/gemini-flash-1.5',
    ],
  },
};
