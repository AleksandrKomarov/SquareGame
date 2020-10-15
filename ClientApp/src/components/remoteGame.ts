export interface IRemoteGameListener {
    onStatusChange: (status: RemoteGameStatus) => void;
    onMessage: (message: Message) => void;
}

export enum RemoteGameStatus {
    Connecting,
    Ready,
    Ended
}

export interface Message {
    type: MessageType;
    data: any;
}

export enum MessageType {
    PlayerNumber = 0,
    PlayersChanged = 1,
    GameStarted = 2,
    PlayerNickname = 3,
    Roll = 10,
    Rotate = 11,
    Skip = 12,
    Place = 13,
    MouseMove = 14
}

interface PlayerNickname {
    playerNumber: number;
    nickname: string;
}

export class RemoteGame {
    private readonly gameGuid: string;
    private readonly webSocket: WebSocket;
    private readonly playerNicknames: PlayerNickname[] = [];

    private gameStarted: boolean = false;
    private playerNumber: number = 0;
    private playersCount: number = 0;
    private status: RemoteGameStatus;
    private listeners: IRemoteGameListener[] = [];

    constructor(gameGuid: string) {
        this.gameGuid = gameGuid;
        const scheme = document.location.protocol === "https:" ? "wss" : "ws";
        const port = document.location.port ? (`:${document.location.port}`) : "";
        this.webSocket = new WebSocket(`${scheme}://${document.location.hostname}${port}?gameGuid=${gameGuid}`);
        this.status = RemoteGameStatus.Connecting;
        this.webSocket.onopen = this.onOpen;
        this.webSocket.onerror = this.onEnd;
        this.webSocket.onmessage = this.onMessage;
        this.webSocket.onclose = this.onEnd;
    }

    private onOpen = () => {
        this.status = RemoteGameStatus.Ready;
        this.listeners.forEach(l => l.onStatusChange(RemoteGameStatus.Ready));
    }

    private onEnd = () => {
        this.status = RemoteGameStatus.Ended;
        this.listeners.forEach(l => l.onStatusChange(RemoteGameStatus.Ended));
    }

    private onMessage = (event: MessageEvent) => {
        const message: Message = JSON.parse(event.data);

        switch (message.type) {
            case MessageType.PlayerNumber:
                this.playerNumber = message.data - 1;
                break;
            case MessageType.PlayersChanged:
                if (!this.gameStarted) {
                    this.playersCount = message.data;
                }
                this.listeners.forEach(l => l.onMessage(message));
                break;
            case MessageType.GameStarted:
                this.gameStarted = true;
                this.listeners.forEach(l => l.onMessage(message));
                break;
            case MessageType.PlayerNickname:
                this.playerNicknames.push(message.data);
                break;
            default:
                this.listeners.forEach(l => l.onMessage(message));
        }
    }

    getGameGuid = () => {
        return this.gameGuid;
    }

    getStatus = () => {
        return this.status;
    }

    getPlayersCount = () => {
        return this.playersCount;
    }

    getPlayerNumber = () => {
        return this.playerNumber;
    }

    tryGetPlayerNickname = (playerNumber: number): string | null => {
        const playerNickname = this.playerNicknames.find(pn => pn.playerNumber === playerNumber);
        if (playerNickname !== undefined && playerNickname !== null) {
            return playerNickname.nickname;
        }

        return null;
    }

    addListener = (listener: IRemoteGameListener) => {
        this.listeners.push(listener);
    }

    removeListener = (listener: IRemoteGameListener) => {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    sendNickname = (nickname: string) => {
        const playerNickname: PlayerNickname = {
            playerNumber: this.playerNumber,
            nickname: nickname
        };

        this.playerNicknames.push(playerNickname);
        this.send({
            type: MessageType.PlayerNickname,
            data: playerNickname
        });
    }

    send = (message: Message) => {
        this.webSocket.send(JSON.stringify(message));
    }

    disconnect = () => {
        this.webSocket.close();
    }
}