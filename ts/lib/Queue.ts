/**
 * @description Configuração das jobs
 * @author GuilhermeSantos001
 * @update 07/02/2022
 */

import { Queue, Worker } from 'bullmq';
import redisConfig from '@/config/jobs.redis.config';

import * as jobs from '@/jobs/index';
import {
  JobKeys,
  ConfirmMailData,
  AccountForgotPasswordData,
  AccountRetrieveData,
  SessionNewAccessData,
  HerculesOrdersData
} from '@/jobs/index';

const queues = Object.values(jobs).map(job => ({
  bull: new Queue(job.key, { connection: redisConfig }),
  name: job.key,
  options: job.options,
  handle: job.handle
}));

export default {
  queues,
  async addConfirmMail(data: ConfirmMailData) {
    const
      name: JobKeys = 'CONFIRM_MAIL',
      queue = await queues.find(queue => queue.name === name);

    return queue?.bull.add(name, data, queue.options);
  },
  async addAccountForgotPassword(data: AccountForgotPasswordData) {
    const
      name: JobKeys = 'ACCOUNT_FORGOT_PASSWORD',
      queue = await queues.find(queue => queue.name === name);

    return queue?.bull.add(name, data, queue.options);
  },
  async addAccountRetrieveTwofactor(data: AccountRetrieveData) {
    const
      name: JobKeys = 'ACCOUNT_RETRIEVE',
      queue = await queues.find(queue => queue.name === name);

    return queue?.bull.add(name, data, queue.options);
  },
  async addSessionNewAccess(data: SessionNewAccessData) {
    const
      name: JobKeys = 'SESSION_NEW_ACCESS',
      queue = await queues.find(queue => queue.name === name);

    return queue?.bull.add(name, data, queue.options);
  },
  async addHerculesOrders(data: HerculesOrdersData) {
    const
      name: JobKeys = 'HERCULES_ORDERS',
      queue = await queues.find(queue => queue.name === name);

    return queue?.bull.add(name, data, queue.options);
  },
  async process() {
    for (const queue of queues) {
      const worker = new Worker(queue.name, queue.handle, { connection: redisConfig });

      if (!worker.isRunning()) {
        await worker.run();
      } else if (worker.isPaused()) {
        worker.resume();
      }

      worker.on('resumed', () => {
        console.log(`[Worker] ${process.pid} resumed!`);
      });

      worker.on('paused', () => {
        console.log(`[Worker] ${process.pid} has paused!`);
      });

      worker.on('closed', () => {
        console.log(`[Worker] ${process.pid} closed`);
      });

      worker.on('active', (job) => {
        console.log(`[Job Active]: ${job.name}(${job.id}) is active!`);
      })

      worker.on('completed', (job) => {
        console.log(`[Job Success]: ${job.name}(${job.id}) has completed!`);
      });

      worker.on('progress', (job, progress) => {
        console.log(`[Job Progress]: ${job.name}(${job.id}) is ${progress}% complete!`);
      })

      worker.on('failed', (job, err) => {
        console.log(`[Job Failed]: ${job.name}(${job.id})`, err);
      });
    }
  }
}