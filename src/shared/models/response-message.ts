 export interface ResponseMessage {
 	text: string;
	status: number;
	content?: any;
 	errorCodeToShow ?: number;
 	token?: string;
 	userId?: string;
 }