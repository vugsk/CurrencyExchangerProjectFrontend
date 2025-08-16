import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

interface LabelProfile {
    id: string;
    name: string;
}

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})

export class UserProfile {
    constructor(private titleService: Title) {
        this.titleService.setTitle("Мой кабинет");
    }
    protected buttonSaveDataProfile(): void {
        console.log("save");
    };

    protected labelsPasswords: LabelProfile[] = [
        {id: "now-password", name: "Текущий пароль"},
        {id: "new-password", name: "Новый пароль"},
        {id: "confirmation-new-password", name: "Подтвердите новый пароль"},
    ];

    protected labelsTexts: LabelProfile[] = [
        {id: "label-login", name: "Ваш логин"},
        {id: "label-nik-name", name: "Ваш ник"},
        {id: "label-email", name: "Ваш e-mail"},
    ];
}
