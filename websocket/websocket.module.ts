import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatModule } from '../new-chat/chat.module';
import { MessageModule } from '../new-chat/message/message.module';
import { AuthModule } from '../auth/auth.module';
import { SocketTransport } from './socket.transport';
import { NursingHomeGateway } from './gateways/nursing-home.gateway';
import { NursingHomeModule } from '../nursing-home/nursing-home.module';
import { GatewayInterceptor } from './gateway-interceptor';
import { LoggerModule } from '../logger/logger.module';

@Module({
    providers: [
        ChatGateway,
        NursingHomeGateway,
        SocketTransport,
        GatewayInterceptor,
    ],
    imports: [
        AuthModule,
        ChatModule,
        MessageModule,
        NursingHomeModule,
        LoggerModule,
    ],
})
export class WebsocketModule {}
