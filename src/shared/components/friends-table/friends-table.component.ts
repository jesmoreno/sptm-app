import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { merge } from "rxjs/observable/merge";
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
//componentes angular material
import { MatTableDataSource, MatTable, MatPaginator, MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

//Importo servicios que se utilizarán
import { FriendsService } from '../../services/friends.service';
import { AuthenticationService } from '../../services/authentication.service';
import { UserFriendsDataSource } from '../../services/user.friends.datasource';

//Interfaz para los datos de la tabla
import { UserFriends } from '../../models/user-friends';
import { ResponseMessage } from '../../models/response-message';

import { PopupGenericComponent } from '../../components/popUp/popup-generic.component';


@Component({
  selector: 'friends-table',
  templateUrl: './friends-table.component.html',
  styleUrls: ['./friends-table.component.css']
})

export class FriendsTableComponent implements AfterViewInit, OnInit{


     @Input() dataShared:boolean = false;


    //Valores para la tabla
    userFriendsCount: Number;
    displayedColumns: string[] = ['name','favSport','remove'];
    dataSource : UserFriendsDataSource;
    hasFriends : boolean = false;

    //Variables para la respuesta al eliminar amigo
    removeFriendResponse : ResponseMessage;

    //Cuando elimino un amigo correctamente emito el evento para que lo sepa la tabla de lista de todos los usuarios
    @Output() emitEvent:EventEmitter<boolean> = new EventEmitter<boolean>();
    removed : boolean = false;


    @ViewChild( MatPaginator ) paginator: MatPaginator;
    @ViewChild( MatSort ) sort: MatSort;
    @ViewChild('input') input: ElementRef;

    constructor(private friendsService: FriendsService, private authenticationService: AuthenticationService, public dialog: MatDialog) {}
    

    openDialog(): void {
      
      let dialogRef = this.dialog.open(PopupGenericComponent, {
        width: '250px',
        data: { text: this.removeFriendResponse.text, url: "/friends" }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }


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


    remove(rowInfo){
      //console.log(rowInfo);
      let friendName = rowInfo.name;

      this.friendsService.removeFriend(this.authenticationService.userName,friendName).subscribe(res => {
        //Datos para el popUp que indica amigo eliminado
        this.removeFriendResponse = res;
        this.openDialog();

        //Dejo la página de la tabla en 0 y llamo al servicio para actualizar los datos
        this.paginator.pageIndex = 0;
        this.loadFriendsPage();
        //Emito evento de amigo eliminado
        this.removed = true;
        this.emitEvent.emit(!this.removed);

      }, err =>{
        //Datos en caso de fallar eliminar amigo
        this.removeFriendResponse = err;
        this.openDialog();

      });
  }

}