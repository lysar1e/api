import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

export const getMailConfig = async (): Promise<any> => {
    const transport = "smtps://fasfafsa.fun@yandex.ru:fasfafsafun@smtp.yandex.ru"
    const mailFromName = "FasfafsaFun"
    const mailFromAddress = "fasfafsa.fun@yandex.ru";

    return {
        transport,
        defaults: {
            from: `"${mailFromName}" <${mailFromAddress}>`,
        },
        template: {
            adapter: new EjsAdapter(),
            options: {
                strict: false,
            },
        },
    };
};