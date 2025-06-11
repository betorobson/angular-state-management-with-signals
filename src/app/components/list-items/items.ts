import { Input, Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ItemsStateService, ItemState } from './store';

@Component({
  selector: 'item',
  template: `
    <mat-card>
    <div>id: {{item.id}}</div>
    @if(editing){
      <div>desc: <input #iptDesc [value]="item.desc" /></div>
      <button (click)="save(iptDesc.value)">Save</button>
    }@else{
      <div>desc: {{item.desc}}</div>
      @if(item.loading){
        loading...
      } @else {
        <button (click)="edit()">Edit</button>
        @if(item.error){
          {{item.error}}
        }
      }
    }
    </mat-card>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    mat-card {
      padding: 16px;
      margin: 16px 0;
    }
  `,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCard,
  ],
})
export class ItemComponent {
  editing = false;
  @Input({ required: true }) item: ItemState;
  constructor(private itemsStateService: ItemsStateService) {}
  edit() {
    this.editing = true;
  }
  save(desc: string) {
    this.editing = false;
    // this.item.desc = desc;
    this.itemsStateService
      .itemUpdate({
        id: this.item.id,
        itemProperties: { desc },
      })
      .subscribe(
        (result) => console.log('result in subs', result),
        (error) => console.log('error in subs', error)
      );
  }
}

/**  Copyright 2025 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license */
