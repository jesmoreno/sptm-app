import { Component, OnInit} from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { FriendsTableComponent } from '../../shared/components/friends-table/friends-table.component';
import { AllUsersTableComponent } from '../../shared/components/all-users-table/all-users-table.component';

@Component({
  selector: 'friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})

export class FriendListComponent implements OnInit{

    constructor() {}
    

    ngOnInit(){}

}