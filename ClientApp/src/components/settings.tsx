import * as React from 'react';
import Cookies from 'universal-cookie';

interface State {
    agreeToStoreNickname: boolean;
    nickname: string;
}

export default class Settings extends React.Component<{}, State> {
    private readonly cookies = new Cookies();

    constructor(props: {}) {
        super(props);

        this.state = {
            agreeToStoreNickname: this.cookies.get("agreeToStoreNickname") === "true",
            nickname: this.cookies.get<string>("nickname") || ""
        }
    }

    render() {
        return (
            <div>
                {this.renderNameConsent()}
                {this.renderNameField()}
            </div>);
    }

    private renderNameConsent = () => {
        return (
            <div>
                <input
                    type="checkbox"
                    checked={this.state.agreeToStoreNickname}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onNameConsentChange(event.target.checked)} />
                <span>I agree to store my nickname in cookies.</span>
            </div>);
    }

    private onNameConsentChange = (consent: boolean) => {
        this.setState({
            ...this.state,
            agreeToStoreNickname: consent
        }, () => {
            this.cookies.set("agreeToStoreNickname", consent, { path: "/", expires: new Date(2030, 1, 1) });
            if (!consent) {
                this.cookies.remove("nickname");
            }
        });
    }

    private renderNameField = () => {
        if (!this.state.agreeToStoreNickname)
            return null;

        return (
            <div>
                <input
                    style={{ "width": "310px" }}
                    placeholder="Enter nickname"
                    value={this.state.nickname}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onNicknameChange(event.target.value)} />
                <button className="gameParameters" onClick={this.onSaveClick}>Save</button>
            </div>);
    }

    private onNicknameChange = (nickname: string) => {
        this.setState({
            ...this.state,
            nickname: nickname
        });
    }

    private onSaveClick = () => {
        this.cookies.set("nickname", this.state.nickname, { path: "/", expires: new Date(2030, 1, 1) });
    }
}