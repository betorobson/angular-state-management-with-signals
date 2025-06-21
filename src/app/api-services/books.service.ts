import { Injectable } from '@angular/core';
import { of, delay, tap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class APIServiceBooks {
  put(bookModel: BooksModel){
    return of(bookModel)
      .pipe(
        delay(500),
        tap(result => {
          if(/bob/.test(result.title)) {
            throw new Error('Bob is not allowed')
          }
        })
      )
  }
}

export interface BooksModel {
  id: string;
  authorId: string;
  title: string;
  rating: number;
}
