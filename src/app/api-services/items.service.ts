import { Injectable } from '@angular/core';
import { of, delay, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class APIServiceItems {
  patch(item: ItemModel) {
    console.log('patch item', item);
    return of({
      body: item,
    }).pipe(
      delay(1000),
      map((result) => {
        console.log('check letter a');
        if (/a/.test(result.body.desc)) {
          throw new Error('Letter A not allowed');
        }
        return result;
      })
    );
  }
}

export interface ItemModel {
  readonly id: number;
  readonly desc: string;
}
