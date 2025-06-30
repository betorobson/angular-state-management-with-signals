import { Component, inject, OnInit } from '@angular/core';
import { STATE_BASE_BOOK_ENTITY, StateBooksActions, StateBooksServiceStore } from './store';
import { CommonModule } from '@angular/common';
import { StateAuthorsServiceStore } from '../authors/store';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooksModel } from '../../api-services/books.service';
import { STATE_BASE_ENTITY } from '../../state-store-management-base/state.store.base';

@Component({
  selector: 'list-books',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="display: flex">
      <form (submit)="addBook()">
      <select [formControl]="formGroup.controls['authorId']">
        @for(author of dataAuthors(); track $index){
          <option
            [value]="author.data.id"
          >{{author.data.name}} ({{author.meta_data.custom.totalBooks}})</option>
        }
      </select>
      <input [formControl]="formGroup.controls['title']" />
      <button
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
      |
      <button
        type="button"
        (click)="saveAllBooks()"
        [disabled]="pendingBooks().length === 0"
      >Save {{(pendingBooks().length)}} Pending</button>
      </form>
    </div>
    <hr />
    <div style="display: flex">
      <div>
      @for(item of data(); track $index){
      <div style="display: flex">
          <div style="display: flex; flex-direction: column">
          <button (click)="updateRating(item, item.data.rating - 1)" [disabled]="item.meta_data.loading">DOWN RATING</button>
          <button (click)="updateRating(item, item.data.rating + 1)" [disabled]="item.meta_data.loading">UP RATING</button>
          <button (click)="removeBook(item)" [disabled]="item.meta_data.loading">REMOVE</button>
          </div>
          <pre>{{item | json}}</pre>
          <pre>{{dataAuthor(item.data.authorId)() | json}}</pre>
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
  dataAuthorsEntities = this.stateAuthorsServiceStore.selectors.entities;
  dataAuthor = (id: string) => this.stateAuthorsServiceStore.entitiesSelectors.selectEntity(id);

  lastUpdate = this.stateBooksServiceStore.selectors.lastUpdate;
  data = this.stateBooksServiceStore.selectors.selectAll;
  bestTitle = this.stateBooksServiceStore.selectors.filterRatingTitle;
  pendingBooks = this.stateBooksServiceStore.selectors.filterPendingBooks;

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

  saveAllBooks(){
    this.stateBooksServiceStore.actions[StateBooksActions.SAVE_DATA]();
  }

  removeBook(book: STATE_BASE_BOOK_ENTITY){
    this.stateBooksServiceStore.removeBook(book);
  }

  updateRating(book: STATE_BASE_BOOK_ENTITY, rating: number){
    this.stateBooksServiceStore.updateBook({
      ...book,
      meta_data: {
        ...book.meta_data,
        custom: {
          pending: true
        }
      },
      data: {
        ...book.data,
        rating
      }
    })
  }

}
