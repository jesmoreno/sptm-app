import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

//Interfaz de datos
import { ResponseMessage } from '../models/response-message';

const headers = new Headers( {'Content-Type': 'application/json'} );
 
@Injectable()
export class AuthenticationService {
    
    public token: string;
    public userName: string; 
    loginUrl = '/api/authenticate';

    constructor(private http: Http) {
        // set token if saved in local storage
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        //Si es distinto de undefined lo asigno
        this.token = currentUser && currentUser.token;
        this.userName = currentUser && currentUser.username;
    }
 

    login (username: string, password: string): Observable<ResponseMessage>{
          return this.http.post(this.loginUrl, {username,password}, {headers: headers})
            .map(response => response.json());
    }


    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        this.userName = null;
        localStorage.removeItem('currentUser');
    }
}