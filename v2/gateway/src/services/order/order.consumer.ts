import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job, Queue } from "bull";
import { LoyaltyService } from "../loyalty/loyalty.service";


interface LoyaltyJob {
        try: number, 
        creationTime: number,
        request: 'updateLoyalty', 
        requestData: {
          username: string, 
          type: 'dec' | 'inc',
        }
      
}
 
@Processor('queue1')
export class MessageConsumer {

    constructor(
        private readonly loyalty: LoyaltyService,
        @InjectQueue('queue1') private queue: Queue
    ){}
 
    @Process('job1')
    async readOperationJob(job:Job<LoyaltyJob>){
        Logger.log(job.data)
        // let res = null;
        // while (job.data.creationTime + 10*60*60*1000 < Date.now() && !res) {
        //     res = await this.loyalty.updateLoyaltyCount(job.data.requestData.username, job.data.requestData.type);
        //     Logger.log('res', JSON.stringify(res))
        // }
        if (job.data.creationTime + 10*1000 < Date.now()) return; 
        const res = await this.loyalty.updateLoyaltyCount(job.data.requestData.username, job.data.requestData.type).toPromise();
        Logger.log( JSON.stringify(res), 'res')
        if (!res) {
            await this.queue.add('job1',
            {
              try: job.data.try + 1, 
              creationTime: job.data.creationTime,
              request: job.data.request, 
              requestData: job.data.requestData
            })
        } 
        
    }
}