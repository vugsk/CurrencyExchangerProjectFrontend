import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {LoginRequest, RegistrationRequest} from './RequestsTypes';
import {ErrorResponseServer, IsResponseServer} from './ResponsesTypes';
import {
  catchError,
  debounceTime,
  distinctUntilChanged, map,
  Observable,
  Subject,
  takeUntil,
  throwError
} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService implements OnDestroy {
  private baseUrl: string = "/api/";
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private http: HttpClient) {}

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkStatus(error: HttpErrorResponse, checkError: (error: HttpErrorResponse) => Error): Observable<Error> {
    if (IsResponseServer(error.error)) {
      return throwError((): Error => checkError(error));
    }
    let message: string;
    switch (error.status) {
      case 500:
        message = error.message;
        break;
      case 503:
        message = error.message;
        break;
      case 504:
        message = error.message;
        break;
      case 505:
        message = error.message;
        break;
    }
    return throwError(() => new Error(message));
  };

  public login(user: LoginRequest, email: boolean, login: boolean): Observable<HttpResponse<ErrorResponseServer> | Error> {
    return this.http.post(this.baseUrl + "user", user, {
      params: {
        operation: "login",
        login: login,
        email: email,
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
      map((res: HttpResponse<any>): HttpResponse<ErrorResponseServer> => res as HttpResponse<ErrorResponseServer>),
      catchError((error: HttpErrorResponse): Observable<Error> => {
        return this.checkStatus(error, (error: HttpErrorResponse): Error => {
          let message: string = "";
          switch (error.status) {
            case 401:
              message = error.message;
              break;
            case 403:
              message = error.message;
              break;
            case 422:
              message = error.message;
              break;
            case 429:
              message = error.message;
              break;
          }
          return new Error(message);
        });
      })
    );
  }

  public createUser(user: RegistrationRequest): Observable<Error | HttpResponse<ErrorResponseServer>> {
    return this.http.post(this.baseUrl + "user", user, {
      params: {
        operation: "create"
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
      map((res: HttpResponse<any>): HttpResponse<ErrorResponseServer> => res as HttpResponse<ErrorResponseServer>),
      catchError((error: HttpErrorResponse): Observable<Error> => {
        return this.checkStatus(error, (error: HttpErrorResponse): Error => {
          let message: string = "";
          switch (error.status) {
            case 409:
              message = error.message;
              break;
            case 429:
              message = error.message;
              break;
          }
          return new Error(message);
        })
      })
    );
  }

  public verificationUser() {}

  public updateUser() {}

  public  logout() {}
}
