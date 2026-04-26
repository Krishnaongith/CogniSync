import { v4 as uuidv4 } from 'uuid';
import type { MockResponse } from '../types';

export async function getMockResponse(
  _inputText: string,
  delayRange?: { min: number; max: number },
): Promise<MockResponse> {
  const range = delayRange ?? { min: 500, max: 1500 };
  const delayMs = Math.random() * (range.max - range.min) + range.min;
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  return {
    keyPoints: [
      { id: uuidv4(), text: 'Cognitive load theory suggests that working memory has limited capacity.' },
      { id: uuidv4(), text: 'Chunking information into smaller units improves retention and recall.' },
      { id: uuidv4(), text: 'Spaced repetition is more effective than massed practice for long-term learning.' },
      { id: uuidv4(), text: 'Active recall strengthens memory pathways more than passive re-reading.' },
      { id: uuidv4(), text: 'Interleaving different topics during study sessions enhances transfer of knowledge.' },
    ],
    tasks: [
      {
        id: uuidv4(),
        description: 'Review the key concepts from the assigned reading chapters.',
        completed: false,
      },
      {
        id: uuidv4(),
        description: 'Complete the practice problems at the end of each section.',
        deadline: '2025-08-15',
        completed: false,
      },
      {
        id: uuidv4(),
        description: 'Summarise the main arguments in your own words.',
        completed: false,
      },
      {
        id: uuidv4(),
        description: 'Prepare a list of questions to bring to the next study session.',
        completed: false,
      },
    ],
    rewrittenText:
      'Our brains can only hold a small amount of information at once. ' +
      'Breaking big ideas into smaller pieces makes them easier to remember. ' +
      'Studying a little bit over many days works better than cramming everything in one go. ' +
      'Testing yourself on what you have learned helps you remember it much longer. ' +
      'Mixing up different subjects while you study helps you use what you know in new situations.',
  };
}
