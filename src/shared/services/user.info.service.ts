import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

//rxjs
import { map, catchError } from "rxjs/operators";
import { Observable, BehaviorSubject  } from 'rxjs';

//Interfaces de las respuestas
import { User } from '../../shared/models/user';
import { UpdatedUser } from '../../shared/models/updated-user';
import { ResponseMessage } from '../../shared/models/response-message';
import { Password } from '../../shared/models/password';

 
@Injectable()
export class UserInfoService {
    
 
    constructor(private http: HttpClient){}
 

    private favSportSubject = new BehaviorSubject(null);

    getFavSportSubject(){
        return this.favSportSubject;
    }

    getUserInfo(username: string): Observable<User>{

        let friendsUrl = '/api/user_info';

        return this.http.get<User>(friendsUrl, {
        	params: new HttpParams()
        		.set('userName', username)
        }).map(res => {
            this.favSportSubject.next(res.favSport);
            return res;
        });
    }

    updatePassword(data: Password): Observable<ResponseMessage>{
    	let saveData = '/api/update_password';
        let httpParams = new HttpParams();
        Object.keys(data).forEach(function (key) {
            httpParams = httpParams.append(key, data[key]);
        });

        return this.http.post<ResponseMessage>(saveData, {params: httpParams});
    }


    updateProfile(data: UpdatedUser): Observable<ResponseMessage>{
        let saveData = '/api/update_profile';
        let httpParams = new HttpParams();

        Object.keys(data).forEach(function (key) {
            httpParams = httpParams.append(key, data[key]);
         });

        return this.http.post<ResponseMessage>(saveData, {params: httpParams}).map(res => {
            if(data.favSport){
                this.favSportSubject.next(data.favSport);
            }
            return res;
        });
    }

}