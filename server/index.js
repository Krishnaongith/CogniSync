import express from 'express';
import cors from 'cors';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

const client = new BedrockRuntimeClient({ region: 'us-east-2' });

function buildSystemPrompt(profile = 'default') {
  const profileInstructions = {
    default: 'Use a neutral, informative tone.',
    adhd: 'Use short, punchy sentences. Be direct and energetic. Avoid long paragraphs — max 2 sentences per paragraph. Use bullet-friendly language.',
    dyslexia: 'Use simple, common words. Keep sentences short. Avoid complex punctuation. Use a calm, clear tone.',
    anxiety: 'Use a gentle, reassuring tone. Avoid urgency language like "must", "immediately", "critical". Frame tasks as manageable steps.',
  };

  return `You are an academic content simplifier. Given a document, return ONLY valid JSON with this exact shape:
{
  "tldr": "<2-3 sentence plain-English summary of the entire document — what it is, what it requires, and the single most important thing to know>",
  "keyPoints": [{ "id": "<uuid>", "text": "<string>" }],
  "tasks": [
    {
      "id": "<uuid>",
      "description": "<imperative string>",
      "deadline": "<ISO date or omit>",
      "completed": false,
      "urgency": "urgent" | "not-urgent",
      "importance": "important" | "not-important"
    }
  ],
  "rewrittenText": "<plain language version>"
}
Rules:
- tldr: 2-3 sentences max, plain English, Grade 6 reading level, no jargon — this is the first thing a student reads
- keyPoints: 3 to 15 items, each a concise essential insight
- tasks: actionable to-dos in imperative form (e.g. "Submit essay draft"), include deadline only if detectable
- tasks.urgency: "urgent" if time-sensitive or has a near deadline, otherwise "not-urgent"
- tasks.importance: "important" if it significantly impacts outcomes or goals, otherwise "not-important"
- rewrittenText: rewrite the full content in plain English, Grade 8 reading level or below
- ${profileInstructions[profile] ?? profileInstructions.default}
- Return ONLY the JSON object, no markdown, no explanation`;
}

async function invokeModel(messages, systemPrompt) {
  const payload = {
    modelId: 'us.amazon.nova-pro-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      messages,
      system: [{ text: systemPrompt }],
      inferenceConfig: { maxTokens: 4096, temperature: 0.3 },
    }),
  };
  const command = new InvokeModelCommand(payload);
  const response = await client.send(command);
  const raw = JSON.parse(new TextDecoder().decode(response.body));
  return raw?.output?.message?.content?.[0]?.text ?? '';
}

app.post('/process', async (req, res) => {
  const { text, profile = 'default' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text field' });
  }

  const systemPrompt = buildSystemPrompt(profile);
  const messages = [
    { role: 'user', content: [{ text: `Process this academic document:\n\n${text.slice(0, 40000)}` }] },
  ];

  try {
    const content = await invokeModel(messages, systemPrompt);
    const jsonStr = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed.tasks)) {
      parsed.tasks = parsed.tasks.map(t => ({
        ...t,
        completed: false,
        urgency: t.urgency ?? 'not-urgent',
        importance: t.importance ?? 'not-important',
      }));
    }

    res.json(parsed);
  } catch (err) {
    console.error('Bedrock error:', err);
    res.status(500).json({ error: err.message ?? 'Bedrock invocation failed' });
  }
});

// Rewrite endpoint for the complexity dial
app.post('/rewrite', async (req, res) => {
  const { text, gradeLevel = 8, profile = 'default' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text field' });
  }

  const profileTone = {
    default: 'neutral',
    adhd: 'energetic and punchy, short sentences',
    dyslexia: 'calm and simple, very short sentences',
    anxiety: 'gentle and reassuring, no urgency language',
  }[profile] ?? 'neutral';

  const systemPrompt = `You are a text rewriter. Rewrite the given text at exactly a Grade ${gradeLevel} reading level (Flesch-Kincaid). Use a ${profileTone} tone. Return ONLY the rewritten text, no explanation, no JSON, no markdown.`;

  const messages = [
    { role: 'user', content: [{ text: `Rewrite this text at Grade ${gradeLevel} level:\n\n${text.slice(0, 20000)}` }] },
  ];

  try {
    const rewritten = await invokeModel(messages, systemPrompt);
    res.json({ rewrittenText: rewritten.trim() });
  } catch (err) {
    console.error('Rewrite error:', err);
    res.status(500).json({ error: err.message ?? 'Rewrite failed' });
  }
});

// Cognitive complexity scoring via Bedrock
app.post('/score', async (req, res) => {
  const { originalText, simplifiedText } = req.body;
  if (!originalText || !simplifiedText) {
    return res.status(400).json({ error: 'Missing originalText or simplifiedText' });
  }

  const systemPrompt = `You are a cognitive load analyst. Given two texts (original and simplified), assess their reading complexity.
Return ONLY valid JSON with this exact shape:
{
  "originalScore": {
    "fleschKincaidGrade": <number 1-20>,
    "fleschReadingEase": <number 0-100>,
    "label": <"Very Easy"|"Easy"|"Fairly Easy"|"Standard"|"Fairly Difficult"|"Difficult"|"Very Confusing">,
    "summary": "<one sentence describing the complexity>"
  },
  "simplifiedScore": {
    "fleschKincaidGrade": <number 1-20>,
    "fleschReadingEase": <number 0-100>,
    "label": <"Very Easy"|"Easy"|"Fairly Easy"|"Standard"|"Fairly Difficult"|"Difficult"|"Very Confusing">,
    "summary": "<one sentence describing the complexity>"
  }
}
Rules:
- fleschKincaidGrade: estimated grade level (1=kindergarten, 12=high school, 16=college)
- fleschReadingEase: 0-100, higher = easier to read
- label: pick the closest match based on readingEase
- summary: brief human-readable description of the text's complexity
- Return ONLY the JSON, no markdown, no explanation`;

  const messages = [
    {
      role: 'user',
      content: [{
        text: `Original text:\n${originalText.slice(0, 10000)}\n\n---\n\nSimplified text:\n${simplifiedText.slice(0, 10000)}`
      }]
    }
  ];

  try {
    const content = await invokeModel(messages, systemPrompt);
    const jsonStr = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    res.json(JSON.parse(jsonStr));
  } catch (err) {
    console.error('Score error:', err);
    res.status(500).json({ error: err.message ?? 'Scoring failed' });
  }
});

// Multi-document synthesis — "week at a glance" summary
app.post('/synthesize', async (req, res) => {
  const { results, fileNames } = req.body;
  if (!Array.isArray(results) || !Array.isArray(fileNames)) {
    return res.status(400).json({ error: 'Missing results or fileNames fields' });
  }

  const mergedTasks = results.flatMap((r, i) =>
    (r.tasks ?? []).map(t => `- [${fileNames[i] ?? `File ${i + 1}`}] ${t.description}${t.deadline ? ` (due: ${t.deadline})` : ''}`)
  ).join('\n');

  const mergedKeyPoints = results.flatMap((r, i) =>
    (r.keyPoints ?? []).map(kp => `- [${fileNames[i] ?? `File ${i + 1}`}] ${kp.text}`)
  ).join('\n');

  const systemPrompt = `You are an academic assistant. Given merged tasks and key points from multiple documents, write a single plain-English "week at a glance" paragraph (3-5 sentences) that summarises what the student needs to do and know this week. Be concise, use Grade 8 reading level or below, and do not use bullet points. Return ONLY the paragraph text, no JSON, no markdown.`;

  const messages = [
    {
      role: 'user',
      content: [{
        text: `Tasks across all documents:\n${mergedTasks}\n\nKey points across all documents:\n${mergedKeyPoints}\n\nWrite a "week at a glance" paragraph.`
      }]
    }
  ];

  try {
    const summary = await invokeModel(messages, systemPrompt);
    res.json({ summary: summary.trim() });
  } catch (err) {
    console.error('Synthesize error:', err);
    res.status(500).json({ error: err.message ?? 'Synthesis failed' });
  }
});

// Highlight & Ask — answer a question about a selected passage
app.post('/ask', async (req, res) => {
  const { selectionText, question, context } = req.body;
  if (!selectionText || !question || !context) {
    return res.status(400).json({ error: 'Missing selectionText, question, or context fields' });
  }

  const systemPrompt = `You are a helpful academic tutor. The student has selected a passage from a document and asked a question about it. Answer the question clearly and concisely using the passage and surrounding context. Use plain English at Grade 8 reading level or below. Return ONLY the answer text, no JSON, no markdown.`;

  const messages = [
    {
      role: 'user',
      content: [{
        text: `Document context:\n${context.slice(0, 10000)}\n\nSelected passage:\n"${selectionText.slice(0, 2000)}"\n\nQuestion: ${question}`
      }]
    }
  ];

  try {
    const answer = await invokeModel(messages, systemPrompt);
    res.json({ answer: answer.trim() });
  } catch (err) {
    console.error('Ask error:', err);
    res.status(500).json({ error: err.message ?? 'Ask failed' });
  }
});

// Glossary — identify jargon terms and return definitions
app.post('/glossary', async (req, res) => {
  const { text, profile } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text field' });
  }

  const gradeInstruction =
    profile === 'dyslexia' || profile === 'anxiety'
      ? 'Write all definitions and example sentences at Grade 6 reading level or below. Use very simple, common words.'
      : 'Write definitions and example sentences at Grade 8 reading level or below.';

  const systemPrompt = `You are a vocabulary specialist. Identify up to 20 jargon, technical, or domain-specific terms from the given text that a student might find confusing. ${gradeInstruction}
Return ONLY valid JSON with this exact shape:
{
  "terms": [
    {
      "term": "<the jargon word or phrase>",
      "definition": "<plain-English definition>",
      "exampleSentence": "<a simple example sentence using the term>"
    }
  ]
}
Rules:
- Include at most 20 terms
- Focus on terms that are genuinely difficult or domain-specific
- definitions and exampleSentence must not be empty
- Return ONLY the JSON object, no markdown, no explanation`;

  const messages = [
    {
      role: 'user',
      content: [{ text: `Identify jargon terms in this text:\n\n${text.slice(0, 20000)}` }]
    }
  ];

  try {
    const content = await invokeModel(messages, systemPrompt);
    const jsonStr = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonStr);
    res.json({ terms: parsed.terms ?? [] });
  } catch (err) {
    console.error('Glossary error:', err);
    res.status(500).json({ error: err.message ?? 'Glossary failed' });
  }
});

app.listen(3001, () => console.log('CogniSync server running on http://localhost:3001'));
