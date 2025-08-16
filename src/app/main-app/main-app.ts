import {Component, signal} from '@angular/core';
import {Title} from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import {HomeHeaderContainer} from './home-header-container/home-header-container';
import {FooterContainer} from '../general-pages/footer-container/footer-container';
import {OnlineSupport} from './online-support/online-support';

@Component({
    selector: 'app-currencyExchangerProjectFrontend',
    imports: [RouterOutlet, HomeHeaderContainer, FooterContainer, OnlineSupport],
    templateUrl: 'main-app.html',
    styleUrl: 'main-app.css',
    providers: [Title]
})

export class CurrencyExchangerProjectFrontendComponent {
    protected readonly title = signal('CurrencyExchangerProjectFrontend');
}
