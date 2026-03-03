/**
 * OpenRouter API provider — SSE streaming completions.
 */
const streamCompletion = async (messages, model, onChunk, onEnd, onError) => {
  const url = `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer':  process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title':       'AQIZA AI',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') {
          onEnd();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta  = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            onChunk(delta);
          }
        } catch {
          // Malformed JSON chunk — skip silently
        }
      }
    }

    // Stream ended without explicit [DONE]
    onEnd();
  } catch (err) {
    onError(err);
  }
};

module.exports = { streamCompletion };
