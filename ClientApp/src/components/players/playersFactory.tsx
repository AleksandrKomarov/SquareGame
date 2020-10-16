import * as React from 'react';
import { IPlayer, PlayerProps } from './player';
import { Props as HumanPlayerProps, HumanPlayer } from './humanPlayer';
import ComputerPlayer from './computerPlayer';
import { Props as RemotePlayerProps, RemotePlayer } from './remotePlayer';
import { ServerType, OpponentType, GameParameters } from '../gameParameters/gameParameters';

const playersRefs: any[] = [];

export function getPlayersTables(
    defaultProps: PlayerProps,
    gameParameters: GameParameters,
    isGameEnd: boolean,
    activePlayerNumber: number): JSX.Element[] {

    if (gameParameters.serverType === ServerType.Local) {
        return getLocalPlayersTables(defaultProps, gameParameters, isGameEnd, activePlayerNumber);
    } else {
        return getRemotePlayersTables(defaultProps, gameParameters, isGameEnd, activePlayerNumber);
    }
}

function getLocalPlayersTables(
    defaultProps: PlayerProps,
    gameParameters: GameParameters,
    isGameEnd: boolean,
    activePlayerNumber: number): JSX.Element[] {
    const result: JSX.Element[] = [];

    for (let i = 0; i < gameParameters.playersCount; ++i) {
        const props: HumanPlayerProps = {
            ...defaultProps,
            isUser: gameParameters.opponentType === OpponentType.Computer,
            playerNumber: i,
            isActive: !isGameEnd && activePlayerNumber === i
        };

        if (playersRefs.length < i + 1) {
            playersRefs.push(React.createRef());
        }
        const ref = playersRefs[i];

        if (i === 0) {
            result.push(<HumanPlayer key={i} ref={ref} {...props} />);
            continue;
        }

        switch (gameParameters.opponentType) {
            case OpponentType.Human:
                result.push(<HumanPlayer key={i} ref={ref} {...props} />);
                break;
            default:
                result.push(<ComputerPlayer key={i} ref={ref} {...props} />);
                break;
        }
    }

    return result;
}

function getRemotePlayersTables(
    defaultProps: PlayerProps,
    gameParameters: GameParameters,
    isGameEnd: boolean,
    activePlayerNumber: number): JSX.Element[] {
    const remoteGame = gameParameters.remoteGame;

    if (remoteGame === null) {
        throw Error("Invalid operation");
    }

    const result: JSX.Element[] = [];

    for (let i = 0; i < remoteGame.getPlayersCount(); ++i) {
        const isUser = i === remoteGame.getPlayerNumber();

        const props: RemotePlayerProps = {
            ...defaultProps,
            isUser: isUser,
            remoteGame: remoteGame,
            playerNumber: i,
            isActive: !isGameEnd && isUser && activePlayerNumber === i
        };

        if (playersRefs.length < i + 1) {
            playersRefs.push(React.createRef());
        }
        const ref = playersRefs[i];

        result.push(<RemotePlayer key={i} ref={ref} {...props} />);
    }

    return result;
}

export function getPlayers(): IPlayer[] {
    return playersRefs.map(ref => ref.current as IPlayer);
}