import { ClientWorkspace } from '@/types';
import { INITIAL_METRICS_OVERVIEW } from './mock-data';

export const INITIAL_CLIENT_WORKSPACES: ClientWorkspace[] = [
  {
    id: 'ws-primary-default',
    name: 'Primary Workspace',
    clientName: 'Main Brand Account',
    category: 'E-commerce & Growth',
    currency: 'BDT',
    colorTag: 'blue',
    isPinned: true,
    connectedAccounts: {},
    metrics: INITIAL_METRICS_OVERVIEW,
    campaigns: [],
    creatives: [],
  },
];
