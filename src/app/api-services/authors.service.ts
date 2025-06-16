import { Injectable } from '@angular/core';
import { of, delay, tap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class APIServiceAuthors {

}

export interface AuthorsModel {
  id: string;
  name: string;
  about: string;
  totalBooks: number;
}
