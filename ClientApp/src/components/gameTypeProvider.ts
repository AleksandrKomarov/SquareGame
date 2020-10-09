import { IPlayer } from './players/player';
import { Coordinates } from './coordinates';
import { GameType, GameParameters } from './gameParameters';

export interface IGameTypeProvider {
    getGameEndMessage(players: IPlayer[], playersCells: Coordinates[][]): string;
}

class PvPGameTypeProvider implements IGameTypeProvider {
    getGameEndMessage(players: IPlayer[], playersCells: Object[][]): string {
        const playerResults = playersCells.map(cells => cells.length);
        const maxPersonalResult = playerResults.reduce((p, c) => p > c ? p : c, 0);
        if (maxPersonalResult === 0)
            return "Are you f*cking kidding me?! Try to play, not to skip!";
        if (playerResults.filter(r => r === maxPersonalResult).length > 1)
            return `It's a draw!`;

        const res = playerResults
            .reduce<{ index: number, length: number }>(
                (cur, length, index) => length > cur.length ? { index: index, length: length } : cur,
                { index: 0, length: 0 });

        return `${players[res.index].getPlayerName()} won with ${res.length} points`;
    }
}

class PvEGameTypeProvider implements IGameTypeProvider {
    private readonly fieldSize: number;

    constructor(fieldSize: number) {
        this.fieldSize = fieldSize;
    }

    getGameEndMessage(players: Object[], playersCells: Object[][]): string {
        const result = playersCells.map(cells => cells.length).reduce((p, c) => p + c, 0);
        const maxResult = this.fieldSize * this.fieldSize;
        const percent = 100 * result / maxResult;

        return percent >= 95
            ? `Your team won with ${percent.toFixed(0)}% filled field.`
            : `Your team lost with only ${percent.toFixed(0)}% filled field.`;
    }
}

export function createGameTypeProvider(gameParameters: GameParameters): IGameTypeProvider {
    switch (gameParameters.gameType) {
        case GameType.Pvp:
            return new PvPGameTypeProvider();
        case GameType.Pve:
            return new PvEGameTypeProvider(gameParameters.fieldSize);
        default:
            throw new Error("Not implemented");
    }
}