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
import { GameInfo } from '../../shared/models/game-info';

 
@Injectable()
export class UserInfoService {
    
 
    constructor(private http: HttpClient){}
 

    private favSportSubject = new BehaviorSubject(null);

    // GETS //

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


    getGames(username: string) : Observable<GameInfo>{
        let createGameUrl = '/api/games_info';

        return this.http.post<GameInfo>(createGameUrl, {params: new HttpParams().set('userName',username)});
    }


    // POST //

    updatePassword(data: Password): Observable<ResponseMessage>{
    	let updatePassUrl = '/api/update_password';
        let httpParams = new HttpParams();
        Object.keys(data).forEach(function (key) {
            httpParams = httpParams.append(key, data[key]);
        });

        return this.http.post<ResponseMessage>(updatePassUrl, {params: httpParams});
    }


    updateProfile(data: UpdatedUser): Observable<ResponseMessage>{
        let updateProfUrl = '/api/update_profile';
        let httpParams = new HttpParams();

        Object.keys(data).forEach(function (key) {
            httpParams = httpParams.append(key, data[key]);
         });

        return this.http.post<ResponseMessage>(updateProfUrl, {params: httpParams}).map(res => {
            if(data.favSport){
                this.favSportSubject.next(data.favSport);
            }
            return res;
        });
    }

    saveCreatedGame(data: GameInfo) : Observable<ResponseMessage>{
        let createGameUrl = '/api/new_game';
        let httpParams = new HttpParams();

        Object.keys(data).forEach(function (key) {
            httpParams = httpParams.append(key, data[key]);
         });

        return this.http.post<ResponseMessage>(createGameUrl, {params: httpParams});
    }

}