export enum ChatEvent {
    NEW_MESSAGE = 'chat:new_message',
    SEND_MESSAGE = 'chat:send_message',
    RETURN_MESSAGE = 'chat:return_message',
    CONNECT = 'chat:connect',
    SUCCESSFULLY_CONNECT = 'chat:successfully_connect',
    READ_MESSAGES = 'chat:read_messages',
    MESSAGES_HAVE_BEEN_READ = 'chat:messages_have_been_read',
}
