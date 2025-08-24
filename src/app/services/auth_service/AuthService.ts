import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {LoginRequest, RegistrationRequest} from './RequestsTypes';
import {ErrorResponse, LoginResponse} from './ResponsesTypes';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged, EMPTY, interval, map,
  Observable, startWith,
  Subject, switchMap, takeUntil
} from 'rxjs';
import {GenerationErrorService} from '../generation_error_service/generationErrorService';

@Injectable({providedIn: 'root'})
export class AuthService implements OnDestroy, OnInit {
  private baseUrl: string = "/api/";
  private timeInterval: number = 60 * 60 * 1000;
  private destroy$: Subject<void> = new Subject<void>();

  private isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isLoggedIn$: Observable<boolean> = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient, private errorService: GenerationErrorService) {}

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public login(user: LoginRequest, is_email: boolean, is_login: boolean): Observable<HttpResponse<LoginResponse>> {
    return this.http.post(this.baseUrl + "user", user, {
      params: {
        operation: "login",
        login: is_login,
        email: is_email,
      },
      reportProgress: true,
      withCredentials: true,
      observe: "response",
      credentials: 'same-origin',
      mode: 'cors'
    }).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map((res: HttpResponse<object>): HttpResponse<LoginResponse> => {
        this.isAuthenticated.next(true);
        return res as HttpResponse<LoginResponse>;
      }),
      catchError((error: HttpErrorResponse): Observable<never> => {
        this.errorService.createError(error, "login").then();
        return EMPTY;
      })
    );
  }

  public createUser(user: RegistrationRequest): Observable<ErrorResponse> {
    return this.http.post(this.baseUrl + "user", user, {
      params: {
        operation: "create"
      },
      reportProgress: true,
      withCredentials: true,
      observe: "body",
      credentials: 'same-origin',
      mode: 'cors'
    }).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map((res: object): ErrorResponse => res as ErrorResponse),
      catchError((error: HttpErrorResponse): Observable<never> => {
        this.errorService.createError(error, "registration").then();
        return EMPTY;
      })
    );
  }

  public logout(): Observable<ErrorResponse> {
    return this.http.get(this.baseUrl + "user", {
      params: {
        operation: "logout",
      },
      reportProgress: true,
      withCredentials: true,
      observe: "body",
      mode: 'cors'
    }).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map((res: object): ErrorResponse => {
        this.isAuthenticated.next(false);
        return res as ErrorResponse;
      }),
      catchError((error: HttpErrorResponse): Observable<never> => {
        this.errorService.createError(error, "logout").then();
        return EMPTY;
      })
    );
  }

  public updateDataUser() {

  }

  private updateStatusUser(): void {
    interval(this.timeInterval).pipe(
      startWith(0),
      switchMap((): Observable<ErrorResponse> => this.http.get(this.baseUrl + "user", {
          params: {
            operation: "status",
          },
          reportProgress: true,
          withCredentials: true,
          observe: "body",
          mode: 'cors'
        }).pipe(
          map((response: object): ErrorResponse => response as ErrorResponse),
          catchError((error: HttpErrorResponse): Observable<never> => {
            switch (error.status) {
              case 401:
                this.isAuthenticated.next(false);
                break;
            }
            return EMPTY;
          })
        )
      ),
      takeUntil(this.destroy$),
    ).subscribe((response: ErrorResponse): void => {
      switch (response.code) {
        case "USER_SESSION_ID_VALID":
          this.isAuthenticated.next(true);
          break;
      }
    });
  }
}
