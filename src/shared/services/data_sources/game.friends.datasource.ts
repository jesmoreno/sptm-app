import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs/observable/of";

//componentes angular material
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

//Importo servicios que se utilizarán
import { FriendsService } from '../../services/friends.service';

//Interfaz para los datos de la tabla
import { UserFriends } from '../../models/user-friends';



export class GameFriendsDataSource extends DataSource<UserFriends> {


  private usersSubject = new BehaviorSubject<UserFriends[]>([]);


  constructor(private friendsService : FriendsService){
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<UserFriends[]> {

    return this.usersSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer) : void{

    this.usersSubject.complete();    

  }


  loadFriendsList(userName: string){


    this.friendsService.getFriends({username:userName}).pipe(
            catchError(() => of([])),
    )
    .subscribe(users => {
      this.usersSubject.next(users);
    });
  
  }

}