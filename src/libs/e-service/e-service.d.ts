declare namespace IES {
    interface UserInfo {
        id: number;
        name: string;
        imageUrl: string;
    }
    namespace Center {
        interface Message {
            id: number;
            user: UserInfo;
            talkId: number;
            content: string;
            type: 'text' | 'image';
            time: number;
        }
    }
}
declare namespace ISK {
    type ListenerHandle<D = any> = (data: D) => void;
    type ResponseData<T = any> = {
        code: number;
        message: string;
        invalids: any;
        data: T;
    };
    type EmitterHandle<D, R> = (data: D, response: ResponseData<D>) => void;

    namespace EmitterData {
        namespace Center {
            namespace Send {
                interface Request {
                    content: string;
                    type: 'text/plain' | 'image/jpeg' | 'image/png';
                }
                interface Response {
                    id: number;
                    content: string;
                    time: number;
                }
            }
        }
    }
    namespace ListenerData {
        interface Message {
            id: number;
            user: IES.UserInfo;
            talkId: number;
            content: string;
            type: 'text' | 'image';
            time: number;
        }
        namespace Talks {
            interface Talk {
                id: number;
                name: string;
                online: boolean;
                executive: IES.UserInfo;
                startAt: number;
                createdAt: number;
                messages: Message[];
            }
            interface Start {
                id: number;
                name: string;
                executive: IES.UserInfo;
                startAt: number;
                createdAt: number;
                messages: Message[];
            }
        }
    }
}

declare namespace SocketIOClient {
    interface Socket {
        on(event: string | symbol, ...args: any[]): this;
        on(event: 'disconnect'): boolean;
        /** 更新 token */
        on(event: 'token', listener: ISK.ListenerHandle<{ token: string }>): boolean;

        on(event: 'talks/talk', listener: ISK.ListenerHandle<ISK.ListenerData.Talks.Talk>): this;

        /** 加入房間, 專員開始服務 */
        on(event: 'talks/start', listener: ISK.ListenerHandle<ISK.ListenerData.Talks.Start>): this;
        on(event: 'talks/waiting', listener: ISK.ListenerHandle): this;

        /** 收到訊息 */
        on(event: 'talks/message', listener: ISK.ListenerHandle<ISK.ListenerData.Message>): this;

        emit(type: string | number, ...args: any[]): boolean;
        /** 傳送訊息 */
        emit(
            event: 'talks/send',
            data: ISK.EmitterData.Center.Send.Request,
            response: (res: ISK.ResponseData<ISK.EmitterData.Center.Send.Response>) => void,
        ): boolean;
    }
}
