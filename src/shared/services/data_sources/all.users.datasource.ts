import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs/observable/of";

//componentes angular material
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

//Importo servicios que se utilizarán
import { FriendsService } from '../../services/friends.service';

//Interfaz para los datos de la tabla
import { UserInfo } from '../../models/user-Info';



export class AllUsersDataSource extends DataSource<UserInfo> {


  userInfo:UserInfo;
  private usersSubject = new BehaviorSubject<UserInfo[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private friendsService : FriendsService){
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<UserInfo[]> {

    return this.usersSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer) : void{

    this.usersSubject.complete();    
    this.loadingSubject.complete();

  }


  loadUsersList(userName: string, filter: string, sortDirection: string, pageIndex: number, pageSize: number){

    this.loadingSubject.next(true);

    this.friendsService.getUsersToAdd(userName,filter, sortDirection, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
    )
    .subscribe(users => {
      this.usersSubject.next(users);
    });
  
  }

}