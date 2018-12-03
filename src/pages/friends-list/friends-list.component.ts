import { Component, OnInit, ViewChild} from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { FriendsTableComponent } from '../../shared/components/friends-table/friends-table.component';
import { AllUsersTableComponent } from '../../shared/components/all-users-table/all-users-table.component';

//Operadores para los eventos
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

@Component({
  selector: 'friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})

export class FriendListComponent implements OnInit{

	@ViewChild('allUsersTable') allUsers: AllUsersTableComponent;
	@ViewChild('friendsTable') friends: FriendsTableComponent;


    constructor() {}
    

    ngOnInit(){

    	this.allUsers.emitEvent
    	.subscribe(res => {
        console.log(res);
    		this.friends.loadFriendsPage();
    	});


      this.friends.emitEvent
      .subscribe(res => {
        console.log(res);
        this.allUsers.loadUsersPage();
      });
    }

}