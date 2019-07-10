export interface GameInfo {
 	host: string;
 	name: string;
 	sport: string;
 	maxPlayers: number;
 	date: string;
 	address: any;
 	_id ?: string;
 	userToAdd ?: {
 		name: string,
 		id: string
	 };
	 players?: [{
		 _id: string,
		 playerName: string
	 }];
 	userId ?: string;
 	postCode ?: string;
}