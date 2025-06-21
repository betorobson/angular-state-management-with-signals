import { Component, inject, OnInit } from '@angular/core';
import { StateBooksActions, StateBooksServiceStore } from './store';
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
\      <button
        type="submit"
        (click)="addBook()"
        [disabled]="!formGroup.valid || dataAuthorsLoading()"
      >add</button>
      <button
        type="button"
        (click)="test()"
      >TEST({{lastUpdate()}})</button>
      <button
        type="button"
        (click)="testIncrement()"
      >+</button>
      |
      <button
        type="button"
        [disabled]="dataAuthorsLoading()"
        (click)="addAuthor()"
      >Add Author</button>
      </form>
    </div>
    <hr />
    <div style="display: flex">
      <div>
      @for(item of data(); track $index){
      <div style="display: flex">
          <div style="display: flex; flex-direction: column">
          <button (click)="updateRating(item, item.rating - 1)">DOWN RATING</button>
          <button (click)="updateRating(item, item.rating + 1)">UP RATING</button>
          <button (click)="removeBook(item)">REMOVE</button>
          </div>
          <pre>{{item | json}}</pre>
      </div>
      }
      </div>
      <div>
        <strong>Best title</strong>
        @for(item of bestTitle(); track $index){
          <p>{{item.title}}</p>
        }
      </div>
    </div>
  `,
  styles: `
    pre {
      padding: 16px;
      background: #ccc;
      margin: 8px;
    }
  `
})
export class ListBooksComponent implements OnInit {

  private stateAuthorsServiceStore = inject(StateAuthorsServiceStore);
  private stateBooksServiceStore = inject(StateBooksServiceStore);

  dataAuthors = this.stateAuthorsServiceStore.selectors.selectAll;
  dataAuthorsLoading = this.stateAuthorsServiceStore.selectors.loading;

  lastUpdate = this.stateBooksServiceStore.selectors.lastUpdate;
  data = this.stateBooksServiceStore.selectors.selectAll;
  bestTitle = this.stateBooksServiceStore.selectors.filterRatingTitle;

  formGroup = new FormGroup({
    authorId: new FormControl<string>('1', [Validators.required]),
    title: new FormControl<string>('', [Validators.required]),
  })

  // ONLY FOR TEST
  test(){
    this.stateBooksServiceStore.actions[StateBooksActions.SET_LAST_UPDATE](new Date().getTime());
  }

  testIncrement(){
    this.stateBooksServiceStore.actions[StateBooksActions.INCREMENT]();
  }

  constructor(){

  }

  ngOnInit(): void {
    this.stateBooksServiceStore.actions[StateBooksActions.LOAD_DATA]();
  }

  addAuthor(){
    this.stateAuthorsServiceStore.addAuthor({
      id: new Date().getTime().toString(),
      name: 'New name ' + this.dataAuthors().length,
      about: 'test',
      totalBooks: 0
    })
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

  removeBook(book: BooksModel){
    this.stateBooksServiceStore.removeBook(book);
  }

  updateRating(book: BooksModel, rating: number){
    this.stateBooksServiceStore.updateBook({
      ...book,
      rating
    })
  }

}
