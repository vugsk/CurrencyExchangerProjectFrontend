import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';
import {Title} from '@angular/platform-browser';

interface AboutSiteType {
  name: string;
  url: string;
}

@Component({
  selector: 'app-footer-container',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './footer-container.html',
  styleUrl: './footer-container.css'
})

export class FooterContainer {
    constructor(private titleService: Title) {}
    public setDocTitle(title: string): void {
        this.titleService.setTitle(title);
    }

    public AboutSites: AboutSiteType[] = [
        {name: "Соглашение", url: "contract"},
        {name: "Отзывы",     url: "feedback"},
        {name: "Контакты",   url: "contacts"},
        {name: "Политика",   url: "political"},
    ]
}
