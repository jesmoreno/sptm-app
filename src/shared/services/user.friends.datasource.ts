import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs/observable/of";

//componentes angular material
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

//Importo servicios que se utilizarán
import { FriendsService } from '../../shared/services/friends.service';

//Interfaz para los datos de la tabla
import { UserFriends } from '../../shared/models/user-friends';



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


  loadFriendsList(userName: string, filter: string, sortDirection: string, pageIndex: number, pageSize: number){

    //Envio el nombre de usuario para la busqueda
    //let userName = this.authenticationService.userName;
    this.loadingSubject.next(true);

    this.friendsService.getFriends(userName, filter, sortDirection, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
    )
    .subscribe(friends => {
      this.friendsSubject.next(friends);
    });
  
  }

}