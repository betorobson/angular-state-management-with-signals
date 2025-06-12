import { Injectable } from '@angular/core';
import { of, delay, tap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class APIServiceItems {

  getList(){
    return new Observable<ItemModel[]>(
      subscriber => {
        try {
          subscriber.next(
            JSON.parse(
              window.localStorage.getItem(
                'list'
              ) || '[]'
            )
          )
        }catch(error){
          subscriber.error(error);
        }
        subscriber.complete();
      }
    ).pipe(delay(1500));
  }

  putList(items: ItemModel[]){
    return new Observable<boolean | ErrorEvent>(
      subscriber => {
        try {
          window.localStorage.setItem(
            'list',
            JSON.stringify(items)
          );
          subscriber.next(true);
        }catch(error){
          subscriber.error(error);
        }
        subscriber.complete();
      });
  }

  patchItem(item: ItemModel) {
    return of(item).pipe(
      delay(1000),
      map((result) => {
        console.log('check letter a');
        if (/a/.test(result.desc)) {
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
