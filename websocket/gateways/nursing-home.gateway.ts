import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ITransportPlatform } from '../types/interfaces/transport-platform.interface';
import { ChatService } from '../../new-chat/chat.service';
import { MessageService } from '../../new-chat/message/message.service';
import { AuthService } from '../../auth/auth.service';
import { ITransport } from '../types/interfaces/transport.interface';
import { Inject, UseFilters } from '@nestjs/common';
import { SocketTransport } from '../socket.transport';
import { WebsocketExceptionsFilter } from '../../filters/ws-exception.filter';
import { TransportEvent } from '../types/enums/transport-event.enum';
import { NursingHomeService } from '../../nursing-home/nursing-home.service';
import { HomeEvent } from '../types/enums/home-event.enum';
import { EventType } from '../types/event.type';
import { IGateway } from '../types/interfaces/gateway.interface';
import { CustomLoggerService } from '../../logger/logger.service';

@WebSocketGateway({ cors: true })
export class NursingHomeGateway implements IGateway {
    @WebSocketServer()
    private server: Server;

    constructor(
        private readonly authService: AuthService,
        @Inject(SocketTransport)
        private readonly transport: ITransport,
        private readonly chatService: ChatService,
        private readonly messageService: MessageService,
        private readonly nursingHomeService: NursingHomeService,
        private readonly logger: CustomLoggerService,
    ) {}

    @UseFilters(new WebsocketExceptionsFilter())
    afterInit(): void {
        this.server.use(async (socket: ITransportPlatform, next) => {
            try {
                const authToken: string = socket.handshake?.auth?.token;
                socket.user = await this.authService.getUserFromToken(
                    authToken,
                );
                next();
            } catch (e) {
                this.server
                    .to(socket.id)
                    .emit(TransportEvent.ERROR, { message: e.error });
                this.logger.error(e.error);
            }
        });
    }

    @UseFilters(new WebsocketExceptionsFilter())
    @SubscribeMessage(HomeEvent.CONNECT)
    async connectToHome(
        socket: ITransportPlatform,
        { homeId }: { homeId: string },
    ) {
        const { user } = socket;
        const home = await this.nursingHomeService.getById(homeId);
        const totalUnreadMessagesCount =
            await this.chatService.getTotalUnreadMessagesCount(user, home._id);
        this.transport.joinInRoom(socket, home);
        this.transport.sendToClient(socket, HomeEvent.SUCCESSFULLY_CONNECT, {
            totalUnreadMessagesCount,
            isHaveUnreadMessages: totalUnreadMessagesCount !== 0,
        });
    }

    sendFromServerToRoom(room: string, event: EventType, data?: any) {
        this.server.in(room).emit(event, data);
    }
}
