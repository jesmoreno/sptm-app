import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

// Interfaz de datos
import { ResponseMessage } from '../models/response-message';
@Injectable()
export class AuthenticationService {
    public token: string;
    public userId: string;
    public userName: string;
    loginUrl = '/api/authenticate';

    constructor(private http: HttpClient) {
        // set token if saved in local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        // Si es distinto de undefined lo asigno
        this.token = currentUser && currentUser.token;
        this.userName = currentUser && currentUser.username;
        this.userId = currentUser && currentUser.id;
    }

    login (data: any): Observable<ResponseMessage> {

        let httpParams = new HttpParams();
        Object.keys(data).forEach(function (key) {
            httpParams = httpParams.append(key, data[key]);
        });

        return this.http.post<ResponseMessage>(this.loginUrl, null , {params: httpParams});
    }


    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        this.userName = null;
        this.userId = null;
        localStorage.removeItem('currentUser');
    }
}
