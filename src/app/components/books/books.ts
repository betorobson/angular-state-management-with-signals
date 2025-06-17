import { Component, inject } from '@angular/core';
import { StateBooksServiceStore } from './store';
import { CommonModule } from '@angular/common';
import { StateAuthorsServiceStore } from '../authors/store';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooksModel } from '../../api-services/books.service';

@Component({
  selector: 'list-books',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="display: flex">
      <form (submit)="addBook()">
      <select [formControl]="formGroup.controls['authorId']">
        @for(author of dataAuthors(); track $index){
          <option
            [value]="author.id"
          >{{author.name}} ({{author.totalBooks}})</option>
        }
      </select>
      <input [formControl]="formGroup.controls['title']" />
      <button
        type="submit"
        (click)="addBook()"
        [disabled]="!formGroup.valid"
      >add</button>
      </form>
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

  formGroup = new FormGroup({
    authorId: new FormControl<string>('1', [Validators.required]),
    title: new FormControl<string>('', [Validators.required]),
  })

  constructor(){

  }

  addBook(){
    this.stateBooksServiceStore.addBook({
      id: (new Date()).getTime().toString(),
      authorId: this.formGroup.value.authorId,
      rating: 7,
      title: this.formGroup.value.title
    });

    return false;
  }

  updateRating(book: BooksModel, rating: number){
    this.stateBooksServiceStore.updateBook({
      ...book,
      rating
    })
  }

}
