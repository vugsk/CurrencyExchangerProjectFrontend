import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {
  CreateRequest_Request,
  CreateRequestRegistration_Request,
  LoginRequest,
  RegistrationRequest,
  RecoveryPasswordRequest
} from './RequestsTypes';
import {ErrorResponse, LoginResponse} from './ResponsesTypes';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged, EMPTY, lastValueFrom, map,
  Observable, startWith,
  Subject, takeUntil
} from 'rxjs';
import {GenerationErrorService} from '../generation_error_service/generationErrorService';

@Injectable({providedIn: 'root'})
export class AuthService implements OnDestroy, OnInit {
  private baseUrl: string = "/api/";
  private destroy$: Subject<void> = new Subject<void>();

  private isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isLoggedIn$: Observable<boolean> = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient, private errorService: GenerationErrorService) {
    http.get(this.baseUrl + "user", {
      params: {
        operation: "status",
      },
      reportProgress: true,
      withCredentials: true,
      observe: "body",
      mode: 'cors'
    }).pipe(
      startWith(0),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      catchError(async (error: HttpErrorResponse): Promise<boolean> => {
        switch (error.status) {
          case 401:
            return false;
          default:
            this.errorService.createError(error, "login").then();
            return false;
        }
      })
    ).subscribe((res: boolean | Object): void => {
      if (typeof res === 'boolean') {
        this.isAuthenticated.next(res);
      }
      else {
        switch ((res as ErrorResponse).code) {
          case "USER_SESSION_ID_VALID":
            this.isAuthenticated.next(true);
            break;
        }
      }
    });
  }

  public ngOnInit(): void {

  }
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async login(user: LoginRequest, is_email: boolean, is_login: boolean): Promise<Observable<HttpResponse<LoginResponse>>> {
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

  public async createUser(user: RegistrationRequest): Promise<Observable<ErrorResponse>> {
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

  public async logout(): Promise<Observable<ErrorResponse>> {
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

  public async createRequest(request: CreateRequest_Request | CreateRequestRegistration_Request): Promise<Observable<ErrorResponse>> {
    return this.http.post(this.baseUrl + "create_request", request, {
      params: {
        registration: 'telegramId' in request
      },
      reportProgress: true,
      withCredentials: true,
      observe: "body",
      mode: 'cors'
    }).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map((res: object): ErrorResponse => res as ErrorResponse),
      catchError((error: HttpErrorResponse): Observable<never> => {
        this.errorService.createError(error, "create_request").then();
        return EMPTY;
      })
    );
  }

  public async recoveryPassword(request: RecoveryPasswordRequest, is_email: boolean, is_login: boolean): Promise<ErrorResponse> {
    return lastValueFrom(this.http.post(this.baseUrl + "user", request, {
      params: {
        operation: "recovery",
        login: is_login,
        email: is_email
      },
      reportProgress: true,
      withCredentials: true,
      observe: "body",
      mode: 'cors'
    }).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map((res: object): ErrorResponse => res as ErrorResponse),
      catchError((error: HttpErrorResponse): Observable<never> => {
        this.errorService.createError(error, "recovery").then();
        return EMPTY;
      })
    ));
  }
}
