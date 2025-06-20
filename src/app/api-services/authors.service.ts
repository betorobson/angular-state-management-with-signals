import { Injectable } from '@angular/core';
import { of, delay, tap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class APIServiceAuthors {
  get(){
    return of<AuthorsModel[]>
      ([
        {
          id: '1',
          name: 'Robert Nogueira',
          about: 'It\'s me',
          totalBooks: 0
        },
        {
          id: '2',
          name: 'Robson Soares',
          about: 'Also It\'s me',
          totalBooks: 0
        }
      ])
      .pipe(delay(2000))
  }
}

export interface AuthorsModel {
  id: string;
  name: string;
  about: string;
  totalBooks: number;
}
