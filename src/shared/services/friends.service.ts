import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

//rxjs
import { map, catchError } from "rxjs/operators";
import { Observable  } from 'rxjs';

//Interfaces de las respuestas
import { UserFriends } from '../../shared/models/user-friends';
import { UserInfo } from '../../shared/models/user-Info';
import { ResponseMessage } from '../../shared/models/response-message';
import { GetFriendsIn } from '../../shared/models/get-friends-in';

 
@Injectable()
export class FriendsService {
    
 
    constructor(private http: HttpClient){}
 

    getFriends (data: GetFriendsIn): Observable<UserFriends[]>{

        let friendsUrl = '/api/friends';

        let httpParams = new HttpParams();
        Object.keys(data).forEach(function (key) {
            httpParams = httpParams.append(key, data[key]);
        });

        return this.http.get<UserFriends[]>(friendsUrl, {params: httpParams});
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


    removeFriend (userName: string, friendName: string): Observable<ResponseMessage>{

        let addFriendUrl = "/api/remove_friend";
        let headers = new HttpHeaders( {'Content-Type': 'application/json'} );


        return this.http.post<ResponseMessage>(addFriendUrl,
                JSON.stringify({username: userName,
                    friendname: friendName}),
                {headers: headers}
        )
    }
}