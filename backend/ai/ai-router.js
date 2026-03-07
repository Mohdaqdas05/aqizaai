const openrouterProvider = require('./providers/openrouter.provider');
const openaiProvider = require('./providers/openai.provider');
const geminiProvider = require('./providers/gemini.provider');

/**
 * Determine which provider to use for a given model ID.
 *
 * Routing rules (checked in order):
 *  - Models prefixed with 'direct-openai/' → OpenAI direct API
 *  - Models prefixed with 'direct-gemini/' → Gemini direct API
 *  - All other models → OpenRouter
 */
const selectProvider = (model) => {
  if (model.startsWith('direct-openai/')) return openaiProvider;
  if (model.startsWith('direct-gemini/')) return geminiProvider;
  return openrouterProvider;
};

/**
 * Stream an AI completion using the appropriate provider.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} model  - Model identifier (e.g. 'openai/gpt-4o')
 * @param {Function} onChunk  - Called with each text delta string
 * @param {Function} onEnd    - Called when stream is complete
 * @param {Function} onError  - Called with an Error on failure
 */
const streamMessage = async (messages, model, onChunk, onEnd, onError) => {
  const provider = selectProvider(model);
  await provider.streamCompletion(messages, model, onChunk, onEnd, onError);
};

module.exports = { selectProvider, streamMessage };
