import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

//rxjs
import { map, catchError } from "rxjs/operators";
import { Observable  } from 'rxjs';

//Interfaces de las respuestas
import { UserFriends } from '../../shared/models/user-friends';
import { UserInfo } from '../../shared/models/user-Info';
import { ResponseMessage } from '../../shared/models/response-message';

 
@Injectable()
export class FriendsService {
    
 
    constructor(private http: HttpClient){}
 

    getFriends (username: string, filter: string, sortOrder : string, pageNumber : number, pageSize : number): Observable<UserFriends[]>{

        let friendsUrl = '/api/friends';

        return this.http.get<UserFriends[]>(friendsUrl, {
        	params: new HttpParams()
        		.set('userName', username)
        		.set('filter', filter)
        		.set('sortOrder', sortOrder)
        		.set('pageNumber', pageNumber.toString())
        		.set('pageSize', pageSize.toString())
        });
    }


    getUsersToAdd (username: string, filter: string, sortOrder : string, pageNumber : number, pageSize : number): Observable<UserInfo[]>{

        let allUsersUrl = '/api/all_users';
        
        return this.http.get<UserInfo[]>(allUsersUrl, {
            params: new HttpParams()
                .set('userName', username)
                .set('filter', filter)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
        });
    }


    addFriend (userName: string, friendName: string): Observable<ResponseMessage>{

        let addFriendUrl = "/api/add_friend";
        let headers = new HttpHeaders( {'Content-Type': 'application/json'} );


        return this.http.post<ResponseMessage>(addFriendUrl,
                JSON.stringify({username: userName,
                    friendname: friendName}),
                {headers: headers}
        )
    }

}