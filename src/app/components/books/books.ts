import { Component, inject } from '@angular/core';
import { StateBooksServiceStore } from './store';
import { CommonModule } from '@angular/common';
import { StateAuthorsServiceStore } from '../authors/store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BooksModel } from '../../api-services/books.service';

@Component({
  selector: 'list-books',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="display: flex">
      <select [formControl]="authorIdFormControl">
        @for(author of dataAuthors(); track $index){
          <option
            [value]="author.id"
          >{{author.name}} ({{author.totalBooks}})</option>
        }
      </select>
      <button
        (click)="addBook()"
        [disabled]="!authorIdFormControl.value"
      >add</button> {{this.authorIdFormControl.value}}
    </div>
    <hr />
    @for(item of data(); track $index){
    <div style="display: flex">
        <div style="display: flex; flex-direction: column">
        <button (click)="updateRating(item, item.rating - 1)">DOWN RATING</button>
        <button (click)="updateRating(item, item.rating + 1)">UP RATING</button>
        </div>
        <pre>{{item | json}}</pre>
    </div>
    }
  `,
  styles: `
    pre {
      padding: 16px;
      background: #ccc;
      margin: 8px;
    }
  `
})
export class ListBooksComponent {

  private stateAuthorsServiceStore = inject(StateAuthorsServiceStore);
  private stateBooksServiceStore = inject(StateBooksServiceStore);

  dataAuthors = this.stateAuthorsServiceStore.selectors.selectAll;
  data = this.stateBooksServiceStore.selectors.selectAll;

  authorIdFormControl = new FormControl<string>('1');

  constructor(){

  }

  addBook(){
    this.stateBooksServiceStore.addBook({
      id: (new Date()).getTime().toString(),
      authorId: this.authorIdFormControl.value,
      rating: 7,
      title: 'How to do that?'
    })
  }

  updateRating(book: BooksModel, rating: number){
    this.stateBooksServiceStore.updateBook({
      ...book,
      rating
    })
  }

}
