import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

	constructor(private router:Router){}

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

    	let cloned = req.clone();

      //Si estoy en login aun no existe el token y no puede enviarlo en la petición
      //Para la API del tiempo no incluyo el token en el header ya que no esta permitido
    	if(localStorage.getItem("currentUser") && !req.url.includes('https://openweathermap.org')){
    		const idToken = JSON.parse(localStorage.getItem("currentUser")).token;

        	cloned = req.clone({
          		headers: req.headers.set("Authorization", 'Bearer '+idToken)
       		});
    	}

        return next.handle(cloned).pipe(
        	tap(event => {
        		if (event instanceof HttpResponse) {
      				// do stuff with response if you want
    			}
        	}, error => {
            if(error.status === 401 && !error.error.text){
              this.router.navigate(['/login']);
            }
        		console.log(error);
    		})
        )
    }
}