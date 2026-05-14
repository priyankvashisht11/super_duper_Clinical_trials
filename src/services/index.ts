// Service exports
export { protocolService } from './protocolService';
export { aiService } from './aiService';

// Re-export types from protocol service
export type {
  Protocol,
  ProtocolSection,
  Objective,
  EligibilityCriterion,
  Intervention,
  CreateProtocolInput
} from './protocolService';
