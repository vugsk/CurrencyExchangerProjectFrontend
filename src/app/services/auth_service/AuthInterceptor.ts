import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {AuthService} from './AuthService';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    console.log('intercept request', request);
    console.log('intercept response', next);
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  };

}
