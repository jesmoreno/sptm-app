import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { CreateGameComponent } from '../../shared/components/create-game/create-game.component';

import { Observable } from 'rxjs/Observable';

//POPUPS INFORMACION
import { MatDialog } from '@angular/material';
import { PopupGenericComponent } from '../../shared/components/popUp/popup-generic.component';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{


    lat: number = 39.1445353;
    long: number = -6.1450819;
    marker : string = "../assets/images/google_markers/football_marker.png";
    zoom : number = 8;

    //MENSAJES RESPUESTA SERVICIOS 
    urlToNavigate:string = '/home'; 
    serviceResponse:string;

    constructor(public dialog: MatDialog) {}
    
    ngOnInit(){}


    ///////////////////////////// METODOS PARA ABRIR EL  POPUP //////////////////////////////////////////
    openDialog(): void {
    let dialogRef = this.dialog.open(PopupGenericComponent, {
      width: '250px',
      data: { text: this.serviceResponse, url: this.urlToNavigate }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed in home');
    });
  }

}