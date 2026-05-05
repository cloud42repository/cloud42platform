import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, MarkReadDto } from './notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  findAll(@Query('userEmail') userEmail: string) {
    return this.service.findAllByUser(userEmail);
  }

  @Get('unread')
  findUnread(@Query('userEmail') userEmail: string) {
    return this.service.findUnreadByUser(userEmail);
  }

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.service.create(dto);
  }

  @Patch('read')
  markAsRead(@Body() dto: MarkReadDto) {
    return this.service.markAsRead(dto.ids);
  }

  @Patch('read-all')
  markAllRead(@Body() body: { userEmail: string }) {
    return this.service.markAllRead(body.userEmail);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  removeAll(@Query('userEmail') userEmail: string) {
    return this.service.removeAllByUser(userEmail);
  }
}
