import * as React from 'react';
import { ServerType } from './gameParameters';
import { GameParametersProps } from './gameParametersProps';
import LocalGameParametersComponent from './localGameParametersComponent';
import HostGameParametersComponent from './hostGameParametersComponent';
import RemoteGameParametersComponent from './remoteGameParametersComponent';

interface State {
    serverType: ServerType;
}

export default class GameParametersComponent extends React.Component<GameParametersProps, State> {
    constructor(props: GameParametersProps) {
        super(props);

        this.state = {
            serverType: ServerType.Local
        };
    }

    render() {
        return (
            <div>
                {this.renderServerTypeSelector()}
                {this.renderParametersComponent()}
            </div>);
    }

    private renderServerTypeSelector = () => {
        return (
            <div>
                <div>Select server type</div>
                <button className={this.state.serverType === ServerType.Local ? "gameParameters selected" : "gameParameters"} onClick={() => this.onServerTypeChange(ServerType.Local)}>Local</button>
                <button className={this.state.serverType === ServerType.Host ? "gameParameters selected" : "gameParameters"} onClick={() => this.onServerTypeChange(ServerType.Host)}>Host</button>
                <button className={this.state.serverType === ServerType.Remote ? "gameParameters selected" : "gameParameters"} onClick={() => this.onServerTypeChange(ServerType.Remote)}>Remote</button>
            </div>);
    }

    private onServerTypeChange = (serverType: ServerType) => {
        this.setState({
            ...this.state,
            serverType: serverType
        });
    }

    private renderParametersComponent = () => {
        switch (this.state.serverType) {
            case ServerType.Local:
                return <LocalGameParametersComponent {...this.props} />;
            case ServerType.Host:
                return <HostGameParametersComponent {...this.props} />;
            case ServerType.Remote:
                return <RemoteGameParametersComponent {...this.props} />;
            default:
                throw Error("Not implemented");
        }
    }
}
