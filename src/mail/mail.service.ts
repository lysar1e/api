import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendResetPassword(email: string, url: string) {

        await this.mailerService.sendMail({
            to: email,
            subject: 'Ссылка для восстановления пароля',
            template: './reset',
            context: {
                email,
                url,
            },
        });
    }
}