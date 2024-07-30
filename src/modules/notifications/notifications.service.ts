import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notifications.entity';
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async markNotificationAsRead(options: MarkNotificationAsReadDto, notification_id: string, userId: string) {
    try {
      if (!notification_id || !options) {
        throw new BadRequestException({
          status: 'error',
          message: 'Invalid Request',
          status_code: HttpStatus.BAD_REQUEST,
        });
      }

      const notificationExists = await this.notificationRepository.findOne({
        where: { id: notification_id },
        relations: ['user'],
      });

      if (!notificationExists) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Notification not found',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        );
      }

      notificationExists.isRead = options.is_read;
      await this.notificationRepository.save(notificationExists);

      return {
        status: 'success',
        message: 'Notification marked as read successfully',
        status_code: HttpStatus.OK,
        data: {
          notification_id: notificationExists.id,
          message: notificationExists.message,
          is_read: notificationExists.isRead,
          updatedAt: notificationExists.updated_at,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('An unexpected error ocurred', error);
        throw new HttpException(
          {
            status: 'error',
            message: 'An unexpected error ocurred',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}