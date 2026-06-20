import type { MockResponse } from '../types';

export const MOCK_RESPONSE: MockResponse = {
  tldr: 'Climate change is driven by human activities releasing greenhouse gases, causing global temperatures to rise. This leads to melting ice, rising seas, and more extreme weather. Urgent action is needed to reduce emissions and adapt to ongoing changes.',
  keyPoints: [
    { id: 'kp-1', text: 'Human activities like burning fossil fuels are the main cause of climate change since the 1800s' },
    { id: 'kp-2', text: 'Greenhouse gases trap heat in the atmosphere, raising global temperatures' },
    { id: 'kp-3', text: 'Effects include rising sea levels, extreme weather events, and ecosystem disruption' },
    { id: 'kp-4', text: 'Limiting warming to 1.5°C above pre-industrial levels is a critical scientific target' },
    { id: 'kp-5', text: 'Renewable energy and forest protection are key mitigation strategies' },
  ],
  tasks: [
    { id: 't-1', description: 'Review the key causes of climate change', urgency: 'not-urgent', importance: 'important', completed: false },
    { id: 't-2', description: 'Summarise three mitigation strategies in your own words', urgency: 'not-urgent', importance: 'important', completed: false },
    { id: 't-3', description: 'Research one real-world example of climate adaptation', urgency: 'urgent', importance: 'important', completed: false },
  ],
  rewrittenText: `## What Is Climate Change?

Climate change means long-term shifts in global temperatures and weather patterns. While some changes are natural, human activities have been the main driver since the 1800s.

## What Causes It?

The main cause is burning fossil fuels like coal, oil, and gas. This releases greenhouse gases, mainly carbon dioxide, into the atmosphere. These gases act like a blanket around Earth, trapping heat and causing temperatures to rise.

## What Are the Effects?

Rising temperatures lead to serious problems. Sea levels are climbing as ice sheets melt. Extreme weather events like floods, droughts, and storms are becoming more frequent. Many ecosystems and animal species are under threat.

## What Can We Do?

Scientists say limiting warming to **1.5°C** above pre-industrial levels is critical. Key solutions include switching to renewable energy sources like wind and solar, improving energy efficiency, and protecting forests. Communities are also learning to adapt to changes that are already happening.`,
};

export const MOCK_REWRITTEN = MOCK_RESPONSE.rewrittenText;
