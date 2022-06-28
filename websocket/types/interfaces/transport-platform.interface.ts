import { Socket } from 'socket.io';
import { Chat } from '../../../new-chat/chat.schema';
import { User } from '../../../user/user.schema';
import { NursingHome } from '../../../nursing-home/nursing-home.schema';

export interface ITransportPlatform extends Socket {
    room: Chat | NursingHome;
    user: User;
}
