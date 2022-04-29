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