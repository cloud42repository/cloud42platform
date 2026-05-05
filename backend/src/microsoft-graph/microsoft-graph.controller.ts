import { Body, Controller, Post } from '@nestjs/common';
import { MicrosoftGraphService } from './microsoft-graph.service';
import type { SendMailRequest } from './microsoft-graph.dto';

@Controller('microsoft-graph')
export class MicrosoftGraphController {
  constructor(private readonly service: MicrosoftGraphService) {}

  @Post('send-mail')
  sendMail(@Body() body: SendMailRequest) {
    return this.service.sendMail(body);
  }
}
