import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch';
import {Router} from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

	constructor(private router:Router){}

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        const idToken = JSON.parse(localStorage.getItem("currentUser")).token;

        const cloned = req.clone({
          headers: req.headers.set("Authorization", 'Bearer '+idToken)
        });

        return next.handle(cloned)
        .catch((error, caught) => {
		//intercept the respons error and displace it to the console
		console.log("Error Occurred");
		console.log(error);
		
		//Si ha caducado la sesion redirijo al login
		if(error.status === 401 && error.statusText === "Unauthorized"){
			this.router.navigate(['login']);
		}
		//return the error to the method that called it
		return Observable.throw(error);

		}) as any;
    }
}