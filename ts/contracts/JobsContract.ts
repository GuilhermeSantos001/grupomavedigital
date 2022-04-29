/**
 * @description Contrato de implementação dos jobs
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

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
  attempts: 5, // If job fails it will retry till 5 times
  backoff: 5000 // static 5 sec delay between retry
}