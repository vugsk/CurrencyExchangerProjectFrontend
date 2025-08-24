import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {AuthService} from '../../services/auth_service/AuthService';

@Component({
  selector: 'app-home-header-container',
  imports: [RouterLink],
  templateUrl: './home-header-container.html',
  styleUrl: './home-header-container.css'
})

export class HomeHeaderContainer implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject();
  private clickListener: (event: MouseEvent) => void = (): void => {};
  protected isDropdownOpen: boolean = false;
  protected isAuthenticated$: boolean = false;

  constructor(private authService: AuthService) {}

  public ngOnInit(): void {
    this.authService.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe((state: boolean): void => {
      this.isAuthenticated$ = state;
    });

    this.clickListener = this.onDocumentClick.bind(this);
    document.addEventListener('click', this.clickListener);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  protected closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  protected onDocumentClick(event: MouseEvent): void {
    const dropdown: Element | null = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
    }
  }

  protected onLogout(): void {
    this.authService.logout().subscribe();
  }
}
