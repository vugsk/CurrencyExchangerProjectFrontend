import {Component, OnDestroy, OnInit} from '@angular/core';
import {FooterContainer} from '../footer-container/footer-container';
import {Router, RouterLink} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Subject, takeUntil} from 'rxjs';
import {GenerationErrorService} from '../../services/generation_error_service/generationErrorService';

@Component({
  selector: 'app-page-error',
  standalone: true,
  imports: [FooterContainer, RouterLink],
  templateUrl: 'page-error.html',
  styleUrl: 'page-error.css',
})

export class ErrorPage implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private titleService: Title,
              private router: Router,
              private errorService: GenerationErrorService) {}

  public ngOnInit(): void {
    this.errorService.ObjectError$.pipe(takeUntil(this.destroy$)).subscribe((error): void => {
      if (error !== this.errorService.nullErrorP) {
        this.titleService.setTitle(error.pageContent.title + ' - ' + error.pageContent.status);
        let func: (id: string, content: string) => void = (id: string, content: string): void => {
          let element: HTMLElement | null = document.getElementById(id);
          if (element) {
            element.textContent = content;
          }
        };

        func("error-code", error.pageContent.status.toString());
        func("error-title", error.pageContent.title);
        func("error-message", error.pageContent.message);

        let elementBackButton: HTMLElement | null = document.getElementById("back-button");
        if (elementBackButton && error.isBackButton)
          elementBackButton.style.display = "block";
        else if (elementBackButton && !error.isBackButton)
            elementBackButton.style.display = "none";
      }
      else this.router.navigate(["/"]).then();
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
