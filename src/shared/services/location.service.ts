import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers } from '@angular/http';


const headers = new Headers( {'Content-Type': 'application/json'} );


@Injectable()
export class LocationService {
  

	registryUrl = 'https://www.googleapis.com/geolocation/v1/geolocate/';


	constructor(private http: Http) { }

	/**GET: pido informacion d ela geolocalizacion*/
	getCurrentPosition (){
  		return this.http.post(this.registryUrl, {key:"AIzaSyAfPhXLrvv0Aiv7LvFEBgNZCLzjuIjkH3A"})
  			.map(response => response.json());
    }

}


