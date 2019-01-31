import { Component, OnInit, AfterViewInit, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Validators , AbstractControl , ValidationErrors, FormControl} from '@angular/forms';

//RXJS
import { Observable } from 'rxjs/Observable';
import { merge } from "rxjs/observable/merge";
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import { of } from 'rxjs';

//Interfaces
import { UserFriends } from '../../models/user-friends';

//Services
import { FriendsService } from '../../services/friends.service';
import { AuthenticationService } from '../../services/authentication.service';


@Component({
  selector: 'friends-searcher',
  templateUrl: './friends-searcher.component.html',
  styleUrls: ['./friends-searcher.component.css']
})


export class FriendsSearcherComponent implements OnInit, AfterViewInit{

  // Evento sobre el input añadir a amigos
  @ViewChild('input') input: ElementRef;

  // Salida del componente con el nombre del usuario para añadir
  @Output() userAdded: EventEmitter<UserFriends> = new EventEmitter<UserFriends>();

  // Control para el input de añadir amigo
  myControl: FormControl;
  // Se lo asigna el datasource una vez es recuperado
  filteredOptions: Observable<UserFriends[]>;
  // variable para desbloquear el boton cuando pinchan una opcion.
  addBlocked: boolean = true;
  // Variable con la opcion selecionada por el usuario
  optionClicked: UserFriends;

  constructor(private friendsService: FriendsService, private authenticationService: AuthenticationService) {
    this.myControl = new FormControl();
  }

  ngOnInit(){

    //No hay opciones iniciales en la busqueda de amigos para añadir a partidas
    this.filteredOptions = of([]);
    
  }

  ngAfterViewInit() {

    fromEvent(this.input.nativeElement,'keyup')
      .pipe(
            debounceTime(250),
            distinctUntilChanged(),
            tap(() => {
              this.loadFriendsPage();
            })
          ).subscribe();
  }


  loadFriendsPage() {
    let filterValue = this.input.nativeElement.value.trim();
    if(filterValue.length && filterValue.length >=3){
      this.filteredOptions = this.friendsService.getFriends({username: this.authenticationService.userName, filter:filterValue});
    }
    
  }

  //Imprime en el input el campo nombre, pero mantiene todo el objeto de entrada
  displayFn(user?: any): string | undefined {
    return user ? user.name : undefined;
  }




  add(name: string) {
    //Envio info al componente home
    this.userAdded.emit(this.optionClicked);
    //reseteo
    this.addBlocked= false;
    this.myControl.reset();
    this.optionClicked = null;
  }

  opSelec(val) {
    //No tiene fallos al seleccionar una de las opciones
    this.addBlocked= false;
    this.optionClicked = val.option.value;
    console.log(val.option);
  }


}