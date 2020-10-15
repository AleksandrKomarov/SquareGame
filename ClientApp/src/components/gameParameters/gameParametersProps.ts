import { GameParameters } from './gameParameters';

export interface GameParametersProps {
    previousGameParameters: GameParameters;
    onCreateNewGame: (gameParameters: GameParameters) => void;
}