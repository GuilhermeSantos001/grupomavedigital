import {
  Job,
  JobsOptions
} from 'bullmq';

import { JobKeys } from '@/jobs/index';
import { JobData } from '@/jobs/index';

export interface JobContract {
  key: JobKeys
  options: JobsOptions
  handle: (job: Job<JobData>) => Promise<void>
}

export const JobOptionsDefault: JobsOptions = {
  attempts: 5
  , backoff: {
    type: "fixed",
    delay: 5000
  }
}