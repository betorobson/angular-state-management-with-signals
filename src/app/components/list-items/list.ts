import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ItemComponent } from './items';
import { ItemsStateService } from './store';

@Component({
  selector: 'list-items',
  template: `
    @if(!loaded()){
      loading...
    }@else{
      <div>
        <input type="text" #iptDesc />
        <button type="button" (click)="add(iptDesc.value)">Add</button>
        <button type="button" (click)="load()">Load</button>
        <hr />
      </div>
      <div style="display: flex; flex-direction: row">
        <div>
          @for(item of items(); track $index){
            <item [item]="item"></item>
          }
          <pre>{{items() | json}}</pre>
        </div>
        <div style="margin-left: 16px;">
          <div style="display: flex; flex-direction: row">
            <input [value]="this.filterQuery()" (ngOnChange)="setFilter(iptfilter.value)" #iptfilter /><button (click)="setFilter(iptfilter.value)">Filtrar</button>
          </div>
          @for(item of filteredItems(); track $index){
            <item [item]="item"></item>
          }
          <!-- <pre>{{filteredItems() | json}}</pre> -->
          <!-- <pre>{{mudouOFiltro() | json}}</pre> -->
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: normal;
    }
  `,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ItemComponent,
  ],
})
export class ListItems implements OnInit {
  loaded = computed(() => this.itemsStateService.getState().loaded);
  items = computed(() => this.itemsStateService.getState().items);
  filteredItems = computed(() => {
    const reg = new RegExp(this.filterQuery(), 'gi');
    return this.itemsStateService.getState().items.filter((item) => {
      reg.lastIndex = -1;
      return reg.test(item.desc);
    });
  });

  // mudancas = 0;
  // mudouOFiltro = computed(() => {
  //   this.filteredItems();
  //   this.mudancas++;
  //   console.log('mudouOFiltro');
  // });

  constructor(private itemsStateService: ItemsStateService) {
    // effect(() => {
    //   if (this.itemsStateService.state()) {
    //     console.log('effect itemsStateService.items()');
    //   }
    // });
    // effect(() => {
    //   if (this.filterQuery()) {
    //     console.log('effect this.filterQuery()');
    //   }
    // });
  }
  ngOnInit(): void {
    this.load();
  }

  load(){
    this.itemsStateService.load();
  }

  add(desc: string) {
    this.itemsStateService.itemAdd({
      desc,
    });
  }

  ////

  filterQuery = signal<string>('w');

  setFilter(query: string) {
    this.filterQuery.set(query);
  }
}

/**  Copyright 2025 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license */
