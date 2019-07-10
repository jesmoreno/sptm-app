import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { merge } from "rxjs/observable/merge";
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';

//Componentes propios
import { PopupGenericComponent } from '../../components/popUp/popup-generic.component';

//componentes angular material
import { MatTableDataSource, MatTable, MatPaginator, MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

//Importo servicios que se utilizarán
import { FriendsService } from '../../services/friends.service';
import { AuthenticationService } from '../../services/authentication.service';
import { AllUsersDataSource } from '../../services/data_sources/all.users.datasource';

//Modelos de datos
import { UserFriends } from '../../models/user-friends';
import { ResponseMessage } from '../../models/response-message';


//Clase con los datos del backend


@Component({
  selector: 'all-users-table',
  templateUrl: './all-users-table.component.html',
  styleUrls: ['./all-users-table.component.css']
})

export class AllUsersTableComponent implements AfterViewInit, OnInit{


    //Cuando añada un amigo correctamente emito el evento para que lo sepa la tabla de lista de amigos
    @Output() emitEvent:EventEmitter<boolean> = new EventEmitter<boolean>();
    added:boolean = false;

    //Variables para la respuesta al añadir amigo
    addFriendResponse : ResponseMessage;

    //Valores para la tabla
    userFriendsCount: Number;
    displayedColumns: string[] = ['name','favSport','add'];
    dataSource : AllUsersDataSource;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('input') input: ElementRef;


    //Mensaje que imprime cuando no encuentra resultado con el filtro
    allUsersMessage : string = "No se encuentran resultados para los criterios de búsqueda introducidos";
    //Booleano para mostrar el mensaje de error
    usersFound : boolean =false;

    constructor(private friendsService: FriendsService, private authenticationService: AuthenticationService, public dialog: MatDialog) {}
    

    openDialog(): void {
      let dialogRef = this.dialog.open(PopupGenericComponent, {
        width: '250px',
        data: { text: this.addFriendResponse.text, url: "/friends" }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }



    ngOnInit(){

      //Inicializo el tamaño de la tabla
      this.updateTableLength(this.authenticationService.userName,'','asc',0,5);
      this.dataSource = new AllUsersDataSource(this.friendsService);
      this.dataSource.loadUsersList(this.authenticationService.userName,'','asc',0,5);

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

                    this.loadUsersPage();
                })
            )
            .subscribe();



        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadUsersPage())
            )
            .subscribe();
    }

    //Llamarlo cada vez que se quiera actualizar la longitud de la tabla
    updateTableLength(userName,filter,sort,pageNumber,pageSize){
      this.friendsService.getUsersToAdd(userName,filter,sort,pageNumber,pageSize).subscribe(res => {
          //Si encuentra resultados devuelve un array con los usuarios, sino array vacío
          //console.log(res);
          if(res.length){
            this.paginator.length = res[0].totalUsers;
            this.usersFound = true;
          }else{
            this.paginator.length = 0;
            this.usersFound = false;
          }
          


      });
    }


    loadUsersPage() {
        this.dataSource.loadUsersList(
          this.authenticationService.userName,
          this.input.nativeElement.value,
          this.sort.direction,
          this.paginator.pageIndex,
          this.paginator.pageSize
        );

        this.updateTableLength(
          this.authenticationService.userName,
          this.input.nativeElement.value,
          this.sort.direction,
          this.paginator.pageIndex,
          this.paginator.pageSize);
    }


    addToFriends(rowInfo) {
      //console.log(rowInfo);
      let friendName = rowInfo.name;

      this.friendsService.addFriend(this.authenticationService.userName,friendName).subscribe(res => {
        //Datos para el popUp que indica amigo añadido
        this.addFriendResponse = res;
        this.openDialog();

        //Dejo la página de la tabla en 0 y llamo al servicio para actualizar los datos
        this.paginator.pageIndex = 0;
        this.loadUsersPage();
        //Emito evento de amigo añadido
        this.emitEvent.emit(!this.added);

      }, err =>{
        //Datos en caso de fallar el añadir amigo
        this.addFriendResponse = err;
        this.openDialog();

      });
    }
}