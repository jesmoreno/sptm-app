import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

//Interfaz objeto contraseña
import { Password } from '../../models/password';

@Component({
  selector: 'new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})

export class NewPassworComponent implements OnInit{

  @Input() showPopUp: boolean;
  @Output() emitEvent:EventEmitter<Password> = new EventEmitter<Password>();
  //@Output() emitEvent:EventEmitter<string> = new EventEmitter<string>();

  constructor() {}
    

  ngOnInit(){}

  cancel() {
    this.showPopUp = false;
    this.emitEvent.emit({confirmed: false});
  }

}