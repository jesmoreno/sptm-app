import { AddressComponentsGoogle } from '../models/address-components-google';


export interface AddressGoogle {

	address_components: AddressComponentsGoogle[],
	formatted_address: string,
    location: {
    	lat: number,
    	lng: number
   	}
	place_id: string
}