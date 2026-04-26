import type { ProcessorConfig, ProcessorResult, AdaptationProfile } from '../types';
import { getMockResponse } from './mockApi';
import { getLiveResponse, getBedrockScore } from './liveApi';
import { scoreText } from '../scorer/scorer';

export async function processDocument(
  text: string,
  config: ProcessorConfig,
  profile: AdaptationProfile = 'default',
): Promise<ProcessorResult> {
  const response = config.useMock
    ? await getMockResponse(text, config.mockDelayMs)
    : await getLiveResponse(text, profile);

  if (config.useMock) {
    // Client-side FK scoring in mock mode
    return {
      keyPoints: response.keyPoints,
      tasks: response.tasks,
      rewrittenText: response.rewrittenText,
      originalScore: scoreText(text),
      simplifiedScore: scoreText(response.rewrittenText),
    };
  }

  // Live mode: ask Bedrock to score complexity
  try {
    const scores = await getBedrockScore(text, response.rewrittenText);
    return {
      keyPoints: response.keyPoints,
      tasks: response.tasks,
      rewrittenText: response.rewrittenText,
      originalScore: scores.originalScore,
      simplifiedScore: scores.simplifiedScore,
    };
  } catch {
    // Fall back to client-side scoring if /score fails
    return {
      keyPoints: response.keyPoints,
      tasks: response.tasks,
      rewrittenText: response.rewrittenText,
      originalScore: scoreText(text),
      simplifiedScore: scoreText(response.rewrittenText),
    };
  }
}

export const defaultConfig: ProcessorConfig = {
  useMock: false,
};
