import * as React from 'react';
import CookieManager from './cookieManager';

interface State {
    agreeToStoreNickname: boolean;
    nickname: string;
}

export default class Settings extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);

        this.state = {
            agreeToStoreNickname: CookieManager.getInstance().getConsentToStoreNickname(),
            nickname: CookieManager.getInstance().getNickname()
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
        }, () => CookieManager.getInstance().setConsentToStoreNickname(consent));
    }

    private renderNameField = () => {
        if (!this.state.agreeToStoreNickname)
            return null;

        return (
            <div>
                <input
                    style={{ "width": "150px" }}
                    placeholder="Enter nickname"
                    value={this.state.nickname}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onNicknameChange(event.target.value)} />
                <button className="gameParameters" onClick={this.onSaveClick}>Save</button>
            </div>);
    }

    private onNicknameChange = (nickname: string) => {
        if (nickname.length > 10)
            return;

        this.setState({
            ...this.state,
            nickname: nickname
        });
    }

    private onSaveClick = () => {
        CookieManager.getInstance().setNickname(this.state.nickname);
    }
}