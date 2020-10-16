import * as React from 'react';
import CookieManager from './cookieManager';

interface State {
    agreeToStoreNickname: boolean;
    nickname: string;
    errorMessage: string | null;
    agreeToCollectStatistics: boolean;
}

export default class Settings extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);

        this.state = {
            agreeToStoreNickname: CookieManager.getInstance().getConsentToStoreNickname(),
            nickname: CookieManager.getInstance().getNickname(),
            errorMessage: null,
            agreeToCollectStatistics: CookieManager.getInstance().getConsentToCollectStatistics()
        }
    }

    render() {
        return (
            <div>
                {this.renderNicknameConsent()}
                {this.renderNicknameField()}
                {this.renderStatisticsConsent()}
            </div>);
    }

    private renderNicknameConsent = () => {
        return (
            <div>
                <input
                    type="checkbox"
                    checked={this.state.agreeToStoreNickname}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onNicknameConsentChange(event.target.checked)} />
                <span>I agree to store my nickname in cookies.</span>
            </div>);
    }

    private onNicknameConsentChange = (consent: boolean) => {
        this.setState({
            ...this.state,
            agreeToStoreNickname: consent
        }, () => CookieManager.getInstance().setConsentToStoreNickname(consent));
    }

    private renderNicknameField = () => {
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
                <span className="error-message">{this.state.errorMessage}</span>
            </div>);
    }

    private onNicknameChange = (nickname: string) => {
        if (nickname.length > 10) {
            this.setState({
                ...this.state,
                errorMessage: "Max nickname length is 10 symbols"
            });
            return;
        }

        this.setState({
            ...this.state,
            nickname: nickname,
            errorMessage: null
        });
    }

    private onSaveClick = () => {
        CookieManager.getInstance().setNickname(this.state.nickname);
    }

    private renderStatisticsConsent = () => {
        return (
            <div>
                <input
                    type="checkbox"
                    checked={this.state.agreeToCollectStatistics}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onStatisticsConsentChange(event.target.checked)} />
                <span>I agree to collect my statistics in cookies.</span>
            </div>);
    }

    private onStatisticsConsentChange = (consent: boolean) => {
        this.setState({
            ...this.state,
            agreeToCollectStatistics: consent
        }, () => CookieManager.getInstance().setConsentToCollectStatistics(consent));
    }
}