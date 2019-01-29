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


@Component({
  selector: 'friend-searcher',
  templateUrl: './friend-searcher.component.html',
  styleUrls: ['./friend-searcher.component.css']
})

export class FriendSearcherComponent implements OnInit, AfterViewInit{

  //Evento sobre el input añadir a amigos
  @ViewChild('input') input: ElementRef;

  //Control para el input de añadir amigo
  myControl: FormControl = new FormControl();
  //Se lo asigna el datasource una vez es recuperado
  filteredOptions: Observable<UserFriends[]>;

  constructor(private friendsService: FriendsService) {}

  ngOnInit(){

    //No hay opciones iniciales en la busqueda de amigos para añadir a partidas
    this.filteredOptions = of([]);

  }

  ngAfterViewInit() {

    fromEvent(this.input.nativeElement,'keyup')
      .pipe(
            debounceTime(150),
            distinctUntilChanged(),
            tap(() => {
              this.loadFriendsPage();
            })
          ).subscribe();
  }


  loadFriendsPage() {
    this.filteredOptions = this.friendsService.getFriends({username: this.authenticationService.userName, filter:this.input.nativeElement.value.trim()});
  }


}