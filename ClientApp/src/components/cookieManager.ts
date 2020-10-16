import Cookies from 'universal-cookie';

export default class CookieManager {
    private static instance: CookieManager | null = null;

    private readonly cookies = new Cookies();

    private constructor() {
    }

    static getInstance = (): CookieManager => {
        if (CookieManager.instance === null) {
            CookieManager.instance = new CookieManager();
        }

        return CookieManager.instance;
    }

    private readonly consentToStoreNicknameCookie = "agreeToStoreNickname";
    private readonly nicknameCookie = "nickname";

    getConsentToStoreNickname = (): boolean => {
        return this.cookies.get(this.consentToStoreNicknameCookie) === "true";
    }

    setConsentToStoreNickname = (consent: boolean) => {
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 5, 1, 1);
        this.cookies.set(this.consentToStoreNicknameCookie, consent, { path: "/", expires: this.getExpiresDate() });

        if (!consent) {
            this.deleteNickname();
        }
    }

    getNickname = (): string => {
        return this.cookies.get<string>(this.nicknameCookie) || "";
    }

    setNickname = (nickname: string) => {
        this.cookies.set(this.nicknameCookie, nickname, { path: "/", expires: this.getExpiresDate() });
    }

    private deleteNickname = () => {
        this.cookies.remove(this.nicknameCookie);
    }

    private getExpiresDate = (): Date => {
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 5, 1, 1);
        return expiresDate;
    }
}