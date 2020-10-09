import * as React from 'react';
import { IPlayer, PlayerProps } from './player';
import HumanPlayer from './humanPlayer';
import ComputerPlayer from './computerPlayer';
import { OpponentType, GameParameters } from '../gameParameters';

const playersRefs: any[] = [];

export function getPlayersTables(
    defaultProps: PlayerProps,
    gameParameters: GameParameters,
    isGameEnd: boolean,
    activePlayerNumber: number): JSX.Element[] {
    const result: JSX.Element[] = [];

    for (let i = 0; i < gameParameters.playersCount; ++i) {
        const props = {
            ...defaultProps,
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

export function getPlayers(): IPlayer[] {
    return playersRefs.map(ref => ref.current as IPlayer);
}