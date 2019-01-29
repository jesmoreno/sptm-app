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
import { GetFriendsIn } from '../../models/get-friends-in';


export class UserFriendsDataSource extends DataSource<UserFriends> {


  userInfo:UserFriends;
  private friendsSubject = new BehaviorSubject<UserFriends[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private friendsService : FriendsService){
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<UserFriends[]> {

    return this.friendsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer) : void{

    this.friendsSubject.complete();    
    this.loadingSubject.complete();

  }


  loadFriendsList(data: GetFriendsIn){

    this.loadingSubject.next(true);

    this.friendsService.getFriends(data).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
    )
    .subscribe(friends => {
      this.friendsSubject.next(friends);
    });
  
  }

}