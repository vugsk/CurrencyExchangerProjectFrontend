import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HomeHeaderContainer} from './home-header-container/home-header-container';
import {HomeFooterContainer} from './home-footer-container/home-footer-container';
import {OnlineSupport} from './online-support/online-support';

@Component({
  selector: 'app-root',
    imports: [RouterOutlet, HomeHeaderContainer, HomeFooterContainer, OnlineSupport],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('CurrencyExchangerProjectFrontend');
}
