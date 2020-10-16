import Cookies from 'universal-cookie';
import { StatisticElement } from './statisticElement';

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
    private readonly consentToCollectStatisticsCookie = "agreeToCollectStatistics";
    private readonly statisticsCookie = "statistics";

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

    getConsentToCollectStatistics = (): boolean => {
        return this.cookies.get(this.consentToCollectStatisticsCookie) === "true";
    }

    setConsentToCollectStatistics = (consent: boolean) => {
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 5, 1, 1);
        this.cookies.set(this.consentToCollectStatisticsCookie, consent, { path: "/", expires: this.getExpiresDate() });

        if (!consent) {
            this.deleteStatistics();
        }
    }

    getStatistics = (): StatisticElement[] => {
        return this.cookies.get<StatisticElement[]>(this.statisticsCookie) || [];
    }

    addStatisticElement = (statisticElement: StatisticElement) => {
        const statistics = this.getStatistics();
        statistics.push(statisticElement);
        this.cookies.set(this.statisticsCookie, statistics, { path: "/", expires: this.getExpiresDate() });
    }

    private deleteStatistics = () => {
        this.cookies.remove(this.statisticsCookie);
    }

    private getExpiresDate = (): Date => {
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 5, 1, 1);
        return expiresDate;
    }
}