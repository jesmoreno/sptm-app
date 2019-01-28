export interface GameInfo {
 	host : string,
 	name : string,
 	sport : string,
 	maxPlayers : number,
 	date : string,
 	address : any,
 	_id ?: string,
 	userToAdd ?: {
 		name: string,
 		id: string
 	},
 	userId ?: string,
 	postCode ?: string
}