import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

interface AboutSiteType {
  name: string;
  url: string;
}

@Component({
  selector: 'app-home-footer-container',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './home-footer-container.html',
  styleUrl: './home-footer-container.css'
})

export class HomeFooterContainer {
  public AboutSites: AboutSiteType[] = [
    {name: "Соглашение", url: "contract"},
    {name: "Отзывы",     url: "feedback"},
    {name: "Контакты",   url: "contacts"},
    {name: "Политика",   url: "political"},
  ]
}
