/**
 * OpenAI API provider — direct SSE streaming completions.
 * Uses the official chat completions endpoint.
 */
const streamCompletion = async (messages, model, onChunk, onEnd, onError) => {
  const url = 'https://api.openai.com/v1/chat/completions';
  // Strip provider prefix if present (e.g. 'direct-openai/gpt-4o' → 'gpt-4o')
  const modelId = model.includes('/') ? model.split('/').slice(1).join('/') : model;

  if (!process.env.OPENAI_API_KEY) {
    onError(new Error('OPENAI_API_KEY is not configured'));
    return;
  }

  // o1-* models do not support streaming — use non-streaming fallback
  if (modelId.startsWith('o1')) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (content) onChunk(content);
      onEnd();
    } catch (err) {
      onError(err);
    }
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
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
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch { /* skip malformed chunk */ }
      }
    }
    onEnd();
  } catch (err) {
    onError(err);
  }
};

module.exports = { streamCompletion };
