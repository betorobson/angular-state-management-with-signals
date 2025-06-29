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
          about: 'It\'s me'
        },
        {
          id: '2',
          name: 'Robson Soares',
          about: 'Also It\'s me'
        }
      ])
      .pipe(delay(2000))
  }
}

export interface AuthorsModel {
  id: string;
  name: string;
  about: string;
}
