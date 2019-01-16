import { AddressComponentsGoogle } from '../models/address-components-google';


export interface AddressGoogle {

	address_components: AddressComponentsGoogle[],
	formatted_address: string,
	location: {
        coordinates: [number,number]
    }
	place_id: string
}