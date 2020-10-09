import * as React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './navMenu';
import GameParametersComponent from './gameParametersComponent';
import Field from './field';
import Welcome from './welcome';
import { OpponentType, GameType, FigureType, GameParameters } from './gameParameters';

interface Props {
}

interface State {
    view: string;
    gameParameters: GameParameters;
}

export default class Home extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            view: "start",
            gameParameters: {
                fieldSize: 15,
                opponentType: OpponentType.Human,
                playersCount: 2,
                gameType: GameType.Pvp,
                figureType: FigureType.Dice
    }
        };
    }

    render() {
        let content: JSX.Element | null = null;
        if (this.state.view === "start")
            content = <Welcome />;
        if (this.state.view === "create")
            content = <GameParametersComponent previousParameters={this.state.gameParameters} onCreateNewGame={this.onCreateNewGame} />;
        if (this.state.view === "game")
            content = <Field gameParameters={this.state.gameParameters} />;

        return (
            <React.Fragment>
                <NavMenu links={["Create new game", "Home"]} onLinkClick={this.onLinkClick}/>
                <Container id="container">
                    {content}
                </Container>
            </React.Fragment>);
    }

    private onLinkClick = (link: string) => {
        if (link === "Create new game") {
            this.setState({
                ...this.state,
                view: "create"
            });
        }

        if (link === "Home") {
            this.setState({
                ...this.state,
                view: "start"
            });
        }
    }

    private onCreateNewGame = (gameParameters: GameParameters) => {
        this.setState({
            ...this.state,
            view: "game",
            gameParameters: {
                ...gameParameters
            }
        });
    }
}