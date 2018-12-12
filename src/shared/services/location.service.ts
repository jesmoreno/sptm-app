import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class LocationService {
  


	constructor(private http: HttpClient) { }

	private registryUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
	private key = '';

	/**GET: pido informacion de la geolocalizacion, latitud y longitud sabiendo direccion*/
	getCurrentPositionLatAndLog (direction : string ){

  		return this.http.get<any>(this.registryUrl,{params: new HttpParams()
  				.set('key',this.key)
				.set('address',direction)
				.set('region','es')
		})
    }

    /**GET: pido informacion d ela geolocalizacion, direccion sabiendo latitud y longitud */
	getCurrentPositionAddress (direction : string ){

  		return this.http.get<any>(this.registryUrl,{params: new HttpParams()
  				.set('key',this.key)
				.set('latlng',direction)
				.set('language','es')

		})
    }

}


