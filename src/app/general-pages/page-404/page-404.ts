import {Component, inject} from '@angular/core';
import {FooterContainer} from '../footer-container/footer-container';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'app-page-404',
    imports: [FooterContainer],
    templateUrl: 'page-404.html',
    styleUrl: 'page-404.css',
})

export class PageError404 {
    constructor(private titleService: Title) {
        this.titleService.setTitle("Page Not Found");
    }

    protected router: Router = inject(Router);
    protected clickBackToHome(): void {
        this.router.navigate(['change']).then();
    }
}
