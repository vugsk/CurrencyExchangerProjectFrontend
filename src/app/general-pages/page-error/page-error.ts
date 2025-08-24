import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FooterContainer} from '../footer-container/footer-container';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-page-error',
    imports: [FooterContainer],
    templateUrl: 'page-error.html',
    styleUrl: 'page-error.css',
})

export class ErrorPage implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private titleService: Title, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    console.log('params ', this.route.params);
    this.titleService.setTitle("kldf");
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected router: Router = inject(Router);
  protected clickBackToHome(): void {
      this.router.navigate(['/']).then();
  }
}
