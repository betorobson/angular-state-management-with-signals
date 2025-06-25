// import { Injectable } from '@angular/core';
// import { of, delay, tap, map, Observable } from 'rxjs';
// import { StateBooks, StateBooksRawData } from '../components/books/store';

// @Injectable({
//   providedIn: 'root',
// })
// export class APIServiceBooks {

//   get(){

//     let data;

//     try {
//       data = JSON.parse(window.localStorage.getItem('APIServiceBooks'))
//       console.log(data);
//     }catch(error){
//       console.log(error);
//     }

//     return of<StateBooksRawData>(data)
//       .pipe(delay(500))

//   }

//   saveAllBooks(data: StateBooksRawData){
//     return of(data)
//       .pipe(
//         delay(500),
//         tap(() => window.localStorage.setItem('APIServiceBooks', JSON.stringify(data)))
//       )
//   }

//   put(bookModel: BooksModel){
//     return of(bookModel)
//       .pipe(
//         delay(500),
//         tap(result => {
//           if(/bob/.test(result.title)) {
//             throw new Error('Bob is not allowed')
//           }
//         })
//       )
//   }

// }

// export interface BooksModel {
//   id: string;
//   authorId: string;
//   title: string;
//   rating: number;
// }
