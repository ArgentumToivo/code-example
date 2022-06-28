import { Chat } from '../../../new-chat/chat.schema';
import { ITransportPlatform } from './transport-platform.interface';
import { NursingHome } from '../../../nursing-home/nursing-home.schema';
import { EventType } from '../event.type';

export interface ITransport {
    joinInRoom(platform: ITransportPlatform, room: Chat | NursingHome): void;
    sendInRoom(
        platform: ITransportPlatform,
        event: EventType,
        data?: any,
    ): void;
    sendToRoomAndClient(
        platform: ITransportPlatform,
        event: EventType,
        data?: any,
    ): void;
    sendToClient(
        platform: ITransportPlatform,
        event: EventType,
        data?: any,
    ): void;
}
