import {Component, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-home-header-container',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './home-header-container.html',
  styleUrl: './home-header-container.css'
})

export class HomeHeaderContainer {
    private router: Router = inject(Router);
    protected buttonRegistrationOrLogin(): void {
        this.router.navigate(['change/login']).then(r => {});
    }
}
