import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';


@Injectable()
export class LocationService {
  

	registryUrl = 'https://maps.googleapis.com/maps/api/geocode/json?parameters';


	constructor(private http: HttpClient) { }

	/**GET: pido informacion d ela geolocalizacion*/
	getCurrentPosition (direction : string ){

  		return this.http.post(this.registryUrl, null ,{params: new HttpParams()
  				.set('key','')
				.set('address',direction)
				.set('region','ES')
		})
    }

}


