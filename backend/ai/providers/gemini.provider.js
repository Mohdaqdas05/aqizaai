/**
 * Google Gemini API provider — streaming completions via generateContent.
 * Uses the Gemini REST API with alt=sse streaming.
 */
const streamCompletion = async (messages, model, onChunk, onEnd, onError) => {
  // Strip provider prefix if present (e.g. 'direct-gemini/gemini-1.5-pro' → 'gemini-1.5-pro')
  const modelId = model.includes('/') ? model.split('/').slice(1).join('/') : model;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    onError(new Error('GEMINI_API_KEY is not configured'));
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;

  // Convert OpenAI-style messages to Gemini format
  // system messages become user messages with a special prefix
  const geminiContents = [];
  let systemPrompt = null;

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt = msg.content;
    } else {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  // If there's a system prompt, prepend it to the first user message
  if (systemPrompt && geminiContents.length > 0 && geminiContents[0].role === 'user') {
    geminiContents[0].parts[0].text = `${systemPrompt}\n\n${geminiContents[0].parts[0].text}`;
  }

  const body = {
    contents: geminiContents,
    generationConfig: {
      maxOutputTokens: 8192,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in the buffer for the next iteration
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') { onEnd(); return; }
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) onChunk(text);
        } catch { /* skip malformed chunk */ }
      }
    }
    onEnd();
  } catch (err) {
    onError(err);
  }
};

module.exports = { streamCompletion };
