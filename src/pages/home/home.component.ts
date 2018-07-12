import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { CreateGameComponent } from '../../shared/components/create-game/create-game.component';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{

 
    constructor() {}
    

    ngOnInit(){

    }


	initMap = function(){
/*		var map;
		map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8
        });*/
	}

}