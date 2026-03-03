const openrouterProvider = require('./providers/openrouter.provider');

/**
 * Select the appropriate provider for a given model ID.
 * Currently all models are routed through OpenRouter.
 */
const selectProvider = (_model) => openrouterProvider;

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
