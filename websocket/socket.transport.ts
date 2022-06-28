import { ITransport } from './types/interfaces/transport.interface';
import { ITransportPlatform } from './types/interfaces/transport-platform.interface';
import { ChatEvent } from './types/enums/chat-event.enum';
import { Chat } from '../new-chat/chat.schema';
import { Injectable } from '@nestjs/common';
import { NursingHome } from '../nursing-home/nursing-home.schema';

@Injectable()
export class SocketTransport implements ITransport {
    generateSocketId(roomId: string, chatId: string) {
        return `${roomId}:${chatId}`;
    }

    joinInRoom(platform: ITransportPlatform, room: Chat | NursingHome): void {
        const { user } = platform;
        platform.room = room;
        const socketId = this.generateSocketId(
            room._id.toString(),
            user._id.toString(),
        );
        platform.join(socketId);
        platform.join(room._id.toString());
    }

    sendInRoom(
        platform: ITransportPlatform,
        event: ChatEvent,
        data?: any,
    ): void {
        const { room } = platform;
        platform.in(room._id.toString()).emit(event, data);
    }

    sendToClient(
        platform: ITransportPlatform,
        event: ChatEvent,
        data?: any,
    ): void {
        platform.emit(event, data);
    }

    sendToRoomAndClient(
        platform: ITransportPlatform,
        event: ChatEvent,
        data?: any,
    ): void {
        this.sendInRoom(platform, event, data);
        this.sendToClient(platform, event, data);
    }
}
