import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/**
 * @title Dialog Overview
 */
@Component({
  selector: 'app-popup',
  templateUrl: './popup-generic.component.html',
  styleUrls: ['./popup-generic.component.css'],
})
export class PopupGenericComponent{

	user: String;
	pages: string[] = ['register','login','friends'];
	@Input() currentPage: string; 


	constructor( public dialogRef: MatDialogRef<PopupGenericComponent>,
    	@Inject(MAT_DIALOG_DATA) public data: any) { }

  	onClick(): void {
    	this.dialogRef.close();
  	}

}