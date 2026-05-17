import { Controller, Get, Logger } from '@nestjs/common';
import { NestarBatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BATCH_ROOLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_PROPERTIES } from './lib/congif';

@Controller()
export class BatchController {
	private logger: Logger = new Logger(BatchController.name);
	constructor(private readonly batchService: NestarBatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	@Cron('00 00 01 * * *', { name: BATCH_ROOLLBACK })
	handleBatchRollback() {
		try {
			this.logger['context'] = BATCH_ROOLLBACK;
			this.logger.debug('Called every day at 1:00 AM');
			this.batchService.batchRollback();
		} catch (error) {
			this.logger.error(`Error in batchRollback: ${error}`);
		}
	}

	@Cron('20 00 01 * * *', { name: BATCH_TOP_PROPERTIES })
	handleTopPropertiesCron() {
		try {													
		this.logger['context'] = BATCH_TOP_PROPERTIES;
		this.logger.debug('Called every day at 1:20 AM');
		this.batchService.batchTopProperties();
		} catch (error) {
			this.logger.error(`Error in batchTopProperties: ${error}`);
		}
	}

	@Cron('40 00 01 * * *', { name: BATCH_TOP_AGENTS })
	handleTopAgentsCron() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug('Called every day at 1:40 AM');
			this.batchService.batchTopAgents();
		} catch (error) {
			this.logger.error(`Error in batchTopAgents: ${error}`);
		}
	}
		


	// @Interval(1000)
	// handleInterval() {
	// 	this.logger.debug('Called every 1 second');
	// }
	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
