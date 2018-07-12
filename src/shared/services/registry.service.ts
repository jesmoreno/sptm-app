import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Http, Headers } from '@angular/http';

//Modelos de datos
import { User } from '../models/user';
import { ResponseMessage } from '../models/response-message';


@Injectable()
export class ResgistryService {
  

	registryUrl = '/api/register-user';
	private registered : Boolean = false;

	constructor(private http: Http) { }

	/**POST: add a new user to the database if it does not exist*/
	registerUser (user: User): Observable<ResponseMessage>{

        let headers = new Headers( {'Content-Type': 'application/json'} );

  		return this.http.post(this.registryUrl, user, {headers: headers}).map(response => response.json());
    }

    getState () : Boolean {
    	return this.registered;
    }

    setState (state : Boolean) : void {
    	this.registered = state;
    } 

}