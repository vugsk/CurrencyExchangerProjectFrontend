import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

enum PageType {
    Register = 'register',
    Profile = 'profile',
}

@Component({
    selector: 'app-login-form',
    imports: [],
    templateUrl: './login-form.html',
    styleUrl: './login-form.css'
})



export class LoginForm {
    protected readonly PageType: typeof PageType = PageType;
    protected router: Router = inject(Router);
    protected clickNextPage(page: PageType, isFrom: boolean = false): void {
        let funcCheckCorrection: (r: boolean) => void = (r: boolean): void => {
            if (!r) console.log("Error -> ", page, r);
        };

        let id: string = ((): string => {
            // get response with server
            return "000";
        })();

        switch (page) {
            case PageType.Register:
                this.router.navigate(['change/registration']).then(funcCheckCorrection);
                break;
            case PageType.Profile:
                this.router.navigate(['change/profile', id]).then(funcCheckCorrection);
                break;
        }
    }

    constructor(private titleService: Title) {
        this.titleService.setTitle("Login");
    }
}
