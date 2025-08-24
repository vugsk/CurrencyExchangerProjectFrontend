import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';

interface PageContentError {
  status: number;
  message: string;
  title: string;
}

interface ErrorP {
  pageContent: PageContentError;
  isBackButton: boolean;
}

@Injectable({providedIn: 'root'})
export class GenerationErrorService implements OnInit, OnDestroy {
  public nullErrorP: ErrorP = {pageContent: {status: 0, message: "", title: ""}, isBackButton: false};
  private destroy$: Subject<void> = new Subject<void>();
  private ObjectErrorSubject: BehaviorSubject<ErrorP> = new BehaviorSubject<ErrorP>(this.nullErrorP);
  public ObjectError$: Observable<ErrorP> = this.ObjectErrorSubject.asObservable();

  constructor(private router: Router) {}

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async createError(error: HttpErrorResponse, page: string): Promise<void> {
    this.ObjectErrorSubject.next({
      isBackButton: error.status.toString()[0] !== '5',
      pageContent: error.error ? {status: error.status, message: error.error.message, title: error.error.title}
                               : {status: error.status, message: error.message, title: error.statusText}
    });
    await this.router.navigate(['errors', page]);
  }

}
