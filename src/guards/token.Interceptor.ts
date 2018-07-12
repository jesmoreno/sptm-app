import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        const idToken = JSON.parse(localStorage.getItem("currentUser")).token;

        const cloned = req.clone({
          headers: req.headers.set("Authorization", 'Bearer '+idToken)
        });

        return next.handle(cloned);
    }
}