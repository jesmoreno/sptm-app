import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { CreateGameComponent } from '../../shared/components/create-game/create-game.component';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{

    //lat: Observable<number> = new Observable<number>();
    //long:  Observable<number> = new Observable<number>();

    lat: number = 39.1445353;
    long: number = -6.1450819;
    marker : string = "../assets/images/google_markers/football_marker.png";
    zoom : number = 8;

    constructor() {}
    
    ngOnInit(){
      //this.getCurrentPosition();
    }
   

    



    /*getCurrentPosition() {

      var assignCoords = function(data){
        this.lat = data.coords.latitude;
        this.long = data.coords.longitude;
      };



      if(navigator && navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(datos){
          //console.log(typeof(datos.coords.latitude));
          assignCoords(datos);
        },
        function(){
          alert('Geolocalización desactivada')
        })
      }else{
        alert('Geolocalización no disponible, por favor actualice el navegador')
      }

    }*/
}