import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

//Modelos de datos
import { User } from '../models/user';
import { ResponseMessage } from '../models/response-message';


@Injectable()
export class ResgistryService {
  
	private registered : Boolean = false;

	constructor(private http: HttpClient) { }

	/**POST: add a new user to the database if it does not exist*/
	registerUser (user: User): Observable<ResponseMessage>{
        let registryUrl = '/api/register-user';
        let httpParams = new HttpParams();

        Object.keys(user).forEach(function (key) {
            httpParams = httpParams.append(key, user[key]);
        });

  		return this.http.post<ResponseMessage>(registryUrl, {params: httpParams});
    }

    getState () : Boolean {
    	return this.registered;
    }

    setState (state : Boolean) : void {
    	this.registered = state;
    } 

}