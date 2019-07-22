declare namespace IES {
    interface UserInfo {
        id: number;
        name: string;
        imageUrl: string;
    }
    namespace Center {
        interface Message {
            id: number;
            user: {
                id: number;
                name: string;
            };
            taskId: number;
            content: string;
            type: 'text' | 'image';
            time: number;
        }
        interface Task {}
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
                    time: string;
                }
            }
        }
    }
    namespace ListenerData {
        interface Message {
            id: number;
            user: IES.UserInfo;
            taskId: number;
            content: string;
            type: 'text' | 'image';
            time: number;
        }
        namespace Center {
            interface Join {
                taskId: number;
                user: {
                    id: number;
                    name: string;
                };
            }
            interface Leave {
                taskId: number;
                userId: number;
            }
            interface Start {
                id: number;
                name: string;
                executive: IES.UserInfo;
                disconnectedAt: string | null;
                startAt: string | null;
                closedAt: string | null;
                createdAt: string;
                watchers: IES.UserInfo[];
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
        /** 收到訊息 */
        on(event: 'center/message', listener: ISK.ListenerHandle<ISK.ListenerData.Message>): this;
        /** 主管加入 */
        on(event: 'center/join', listener: ISK.ListenerHandle<ISK.ListenerData.Center.Join>): this;
        /** 主管離開 */
        on(event: 'center/leave', listener: ISK.ListenerHandle<ISK.ListenerData.Center.Leave>): this;

        /** 加入房間, 專員開始服務 */
        on(event: 'center/start', listener: ISK.ListenerHandle): this;

        emit(type: string | number, ...args: any[]): boolean;
        /** 傳送訊息 */
        emit(
            event: 'center/send',
            data: ISK.EmitterData.Center.Send.Request,
            response: (res: ISK.ResponseData<ISK.EmitterData.Center.Send.Response>) => void,
        ): boolean;
    }
}
