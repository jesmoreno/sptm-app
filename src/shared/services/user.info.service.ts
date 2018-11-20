import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

//rxjs
import { map, catchError } from "rxjs/operators";
import { Observable  } from 'rxjs';

//Interfaces de las respuestas
import { User } from '../../shared/models/user';
import { ResponseMessage } from '../../shared/models/response-message';

 
@Injectable()
export class UserInfoService {
    
 
    constructor(private http: HttpClient){}
 

    getUserInfo(username: string): Observable<User>{

        let friendsUrl = '/api/user_info';

        return this.http.get<User>(friendsUrl, {
        	params: new HttpParams()
        		.set('userName', username)
        });
    }

    updateProfileInfo(username: string): Observable<ResponseMessage>{
    	let saveData = '/api/save_data';

        return this.http.post<ResponseMessage>(saveData, {
        	params: new HttpParams()
        		.set('userName', username)
        });
    }

}