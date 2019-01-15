import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { key } from '../config/config';
import { Coords } from '../models/coords';

@Injectable()
export class LocationService {
  


	constructor(private http: HttpClient) { }

	private registryUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

	/**GET: pido informacion de la geolocalizacion, latitud y longitud sabiendo direccion*/
	getCurrentPositionLatAndLog (direction : string ){

  		return this.http.get<any>(this.registryUrl,{params: new HttpParams()
  				.set('key',key.googleKey)
				.set('address',direction)
				.set('region','es')
		})
    }

    /**GET: pido informacion d ela geolocalizacion, direccion sabiendo latitud y longitud */
	getCurrentPositionAddress (direction : Coords ){

		let coords: string = direction.latitude+','+direction.longitude;

  		return this.http.get<any>(this.registryUrl,{params: new HttpParams()
  				.set('key',key.googleKey)
				.set('latlng',coords)
				.set('language','es')

		})
    }

}


