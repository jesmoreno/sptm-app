import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { merge } from "rxjs/observable/merge";
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
//componentes angular material
import { MatTableDataSource, MatTable, MatPaginator, MatSort } from '@angular/material';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

//Importo servicios que se utilizarán
import { FriendsService } from '../../services/friends.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UserFriendsDataSource } from '../../services/user.friends.datasource';

//Interfaz para los datos de la tabla
import { UserFriends } from '../../models/user-friends';

//Clase con los datos del backend


@Component({
  selector: 'friends-table',
  templateUrl: './friends-table.component.html',
  styleUrls: ['./friends-table.component.css']
})

export class FriendsTableComponent implements AfterViewInit, OnInit{


     @Input() dataShared:boolean = false;


    //Valores para la tabla
    userFriendsCount: Number;
    displayedColumns: string[] = ['name','favSport'];
    dataSource : UserFriendsDataSource;
    hasFriends : boolean = false;



    @ViewChild( MatPaginator ) paginator: MatPaginator;
    @ViewChild( MatSort ) sort: MatSort;
    @ViewChild('input') input: ElementRef;

    constructor(private friendsService: FriendsService, private authenticationService: AuthenticationService) {}
    

    ngOnInit(){

      //Inicializo el tamaño de la tabla
      this.updateTableLength(this.authenticationService.userName,'','asc',0,5);
      this.dataSource = new UserFriendsDataSource(this.friendsService);
      this.dataSource.loadFriendsList(this.authenticationService.userName,'','asc',0,5);

    }


    ngAfterViewInit() {


        // reset the paginator after sorting
          this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        

          fromEvent(this.input.nativeElement,'keyup')
              .pipe(
                  debounceTime(150),
                  distinctUntilChanged(),
                  tap(() => {
                      this.paginator.pageIndex = 0;

                      this.loadFriendsPage();
                  })
              )
              .subscribe();



          merge(this.sort.sortChange, this.paginator.page)
              .pipe(
                  tap(() => this.loadFriendsPage())
              )
              .subscribe();

    }

    //Llamarlo cada vez que se quiera actualizar la longitud de la tabla
    updateTableLength(userName,filter,sort,pageNumber,pageSize){
      this.friendsService.getFriends(userName,filter,sort,pageNumber,pageSize).subscribe(res => {
          
          if(res[0].totalFriends > 0){
            this.hasFriends = false;
          }else{
            this.hasFriends = true;
          }
          this.paginator.length = res[0].totalFriends;
          
      });
    }


    loadFriendsPage() {
        this.dataSource.loadFriendsList(
          this.authenticationService.userName,
          this.input.nativeElement.value,
          this.sort.direction,
          this.paginator.pageIndex,
          this.paginator.pageSize
        );

        this.updateTableLength(this.authenticationService.userName,
          this.input.nativeElement.value,
          this.sort.direction,
          this.paginator.pageIndex,
          this.paginator.pageSize);
    }



}