import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ITransportPlatform } from '../types/interfaces/transport-platform.interface';
import { ChatService } from '../../new-chat/chat.service';
import { ChatEvent } from '../types/enums/chat-event.enum';
import { CreateMessageDto } from '../../new-chat/message/dto/create-message.dto';
import { MessageService } from '../../new-chat/message/message.service';
import { AuthService } from '../../auth/auth.service';
import { ITransport } from '../types/interfaces/transport.interface';
import { forwardRef, Inject, UseFilters } from '@nestjs/common';
import { SocketTransport } from '../socket.transport';
import { Message } from '../../new-chat/message/message.schema';
import { plainToClass } from 'class-transformer';
import { WebsocketExceptionsFilter } from '../../filters/ws-exception.filter';
import { TransportEvent } from '../types/enums/transport-event.enum';
import { Chat } from '../../new-chat/chat.schema';
import { HomeEvent } from '../types/enums/home-event.enum';
import { EventType } from '../types/event.type';
import { GatewayInterceptor } from '../gateway-interceptor';
import { IGateway } from '../types/interfaces/gateway.interface';
import { GatewayList } from '../types/enums/gateway-list.enum';
import { CustomLoggerService } from '../../logger/logger.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements IGateway {
    @WebSocketServer()
    private server: Server;

    constructor(
        @Inject(SocketTransport)
        private readonly transport: ITransport,
        @Inject(forwardRef(() => GatewayInterceptor))
        private readonly gatewayInterceptor: GatewayInterceptor,
        private readonly authService: AuthService,
        private readonly chatService: ChatService,
        private readonly messageService: MessageService,
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
                this.logger.error(e.message);
            }
        });
    }

    @UseFilters(new WebsocketExceptionsFilter())
    @SubscribeMessage(ChatEvent.CONNECT)
    async connectToChat(
        socket: ITransportPlatform,
        { chatId }: { chatId: string },
    ) {
        const { user } = socket;
        const chat = await this.chatService.getById(user, chatId);
        this.transport.joinInRoom(socket, chat);
        this.transport.sendToClient(socket, ChatEvent.SUCCESSFULLY_CONNECT, {
            chat: plainToClass(Chat, chat, {
                excludeExtraneousValues: true,
            }),
        });
        this.transport.sendInRoom(socket, ChatEvent.MESSAGES_HAVE_BEEN_READ);
    }

    @UseFilters(new WebsocketExceptionsFilter())
    @SubscribeMessage(ChatEvent.SEND_MESSAGE)
    async newMessage(
        socket: ITransportPlatform,
        { messageDto }: { messageDto: CreateMessageDto },
    ) {
        const { user, room } = socket;
        const message = await this.messageService.createMessage(
            user,
            messageDto,
            room._id,
        );
        this.transport.sendInRoom(socket, ChatEvent.NEW_MESSAGE, {
            message: plainToClass(Message, message, {
                excludeExtraneousValues: true,
            }),
        });
        this.transport.sendToClient(socket, ChatEvent.RETURN_MESSAGE, {
            message: plainToClass(Message, message, {
                excludeExtraneousValues: true,
            }),
        });
        this.gatewayInterceptor.interceptForRoom(
            GatewayList.NursingHomeGateway,
            (room as Chat).resident.nursingHome._id.toString(),
            HomeEvent.NEW_MESSAGE,
            {
                chatId: room._id,
                message: plainToClass(Message, message, {
                    excludeExtraneousValues: true,
                }),
            },
        );
    }

    @SubscribeMessage(ChatEvent.READ_MESSAGES)
    async readMessage(socket: ITransportPlatform) {
        const { user, room } = socket;
        await this.chatService.viewChat(room as Chat, user);
        this.transport.sendInRoom(socket, ChatEvent.MESSAGES_HAVE_BEEN_READ);
    }

    sendFromServerToRoom(room: string, event: EventType, data?: any) {
        this.server.in(room).emit(event, data);
    }
}
