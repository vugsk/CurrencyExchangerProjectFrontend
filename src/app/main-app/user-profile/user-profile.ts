import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Subject, takeUntil} from 'rxjs';
import {AuthService} from '../../services/auth_service/AuthService';

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

export class UserProfile implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private titleService: Title, private authService: AuthService, private router: Router) {}

  public ngOnInit(): void {
    this.titleService.setTitle("Мой кабинет");

    this.authService.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe((state: boolean): void => {
      if (!state) {
        this.router.navigate(['/change/login']).then();
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
