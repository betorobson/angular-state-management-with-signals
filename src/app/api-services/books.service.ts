import { Injectable } from '@angular/core';
import { of, delay, tap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class APIServiceBooks {

}

export interface BooksModel {
  id: string;
  authorId: string;
  title: string;
  rating: number;
}
