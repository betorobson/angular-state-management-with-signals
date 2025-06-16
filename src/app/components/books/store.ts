import { Injectable, signal, computed, effect, inject, untracked} from '@angular/core';
import {
  Subject,
  switchMap,
  of,
  catchError,
  throwError,
  tap,
  Observable,
  Subscriber,
  map,
  delay,
  concatMap,
  mergeMap,
  take,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APIServiceItems, ItemModel } from '../../api-services/items.service';
import { BooksModel } from '../../api-services/books.service';
import { StateAuthorsServiceStore } from '../authors/store';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceStore {

  private stateAuthorsServiceStore = inject(StateAuthorsServiceStore);

  private STATE = signal<StateBooks>({
    ids: [],
    entities: {}
  });

  constructor(){

    this.dispatchReducers.addEntity.subscribe(
      entity => this.reducers.addEntity(entity)
    );

    this.dispatchReducers.updateEntity.pipe(delay(2000)).subscribe(
      entity => this.reducers.updateEntity(entity)
    );

  }

  ///////////////////// SELECTORS
  selectors = {
    selectAll: computed(() => this.STATE().ids.map(id => this.STATE().entities[id]))
  }

  ///////////////////// REDUCERS
  private reducers = {
    addEntity: (book: BooksModel) => {
      this.STATE.update(
        state => ({
          ...state,
          ids: [...state.ids, book.id],
          entities: {...state.entities, [book.id]: book}
        })
      )
      // [todo] padronizar os side effects
      this.stateAuthorsServiceStore.updateTotalBooks(book.authorId);
    },
    updateEntity: (book: BooksModel) => {
      this.STATE.update(
        state => ({
          ...state,
          entities: {
            ...state.entities,
            [book.id]: book
          }
        })
      )
    }
  }

  private dispatchReducers = {
    addEntity: new Subject<BooksModel>,
    updateEntity: new Subject<BooksModel>,
  }

  ///////////////////// ACTIONS

  addBook(book: BooksModel){
    this.dispatchReducers.addEntity.next(book);
  }

  updateBook(book: BooksModel){
    this.dispatchReducers.updateEntity.next(book);
  }

}

interface StateBooks {
  ids: string[],
  entities: {[bookId: string]: BooksModel};
}
