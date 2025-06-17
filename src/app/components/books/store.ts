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

    ///////////////////// LISTENERS REDUCERS
    this.dispatchReducers.addEntity.subscribe(entity => this.reducers.addEntity(entity))

    this.dispatchReducers.updateEntity.pipe(delay(2000)).subscribe(
      entity => this.reducers.updateEntity(entity)
    );

    ///////////////////// LISTENERS EFFECTS
    // this.dispatchEffects.addEntity.subscribe(
    //   entity => this.effects.addEntity(entity)
    // );

    this.dispatchEffects.addEntity_success.subscribe(
      entity => this.effects.addEntity_success(entity)
    );

    this.dispatchEffects.addEntity_error.subscribe(
      entity => this.effects.addEntity_error(entity)
    );

    // this.dispatchReducers.updateEntity.pipe(delay(2000)).subscribe(
    //   entity => this.reducers.updateEntity(entity)
    // );

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
    this.effects.addEntity(book)
      .subscribe(
        () => {
          this.dispatchReducers.addEntity.next(book);
          this.dispatchEffects.addEntity_success.next(book);
        },
        error => {
          this.dispatchEffects.addEntity_error.next(book);
        }
      )
  }

  updateBook(book: BooksModel){
    this.dispatchReducers.updateEntity.next(book);
  }

  ///////////////////// EFFECTS

  private dispatchEffects = {
    addEntity: new Subject<BooksModel>,
    addEntity_success: new Subject<BooksModel>,
    addEntity_error: new Subject<BooksModel>,
    updateEntity: new Subject<BooksModel>,
  }

  private effects = {
    addEntity: (entity: BooksModel) => of(entity)
      .pipe(
        // takeUntilDestroyed(),
        tap(entity => {
          if(entity.authorId === '1') throw new Error('Invalid ID')
        }),
        // catchError((error, caght) => error)
      ),
    addEntity_success: (entity: BooksModel) => this.stateAuthorsServiceStore.updateTotalBooks(entity.authorId),
    addEntity_error: (entity: BooksModel) => console.log('error', entity),
    updateEntity: new Subject<BooksModel>,
  }

}

interface StateBooks {
  ids: string[],
  entities: {[bookId: string]: BooksModel};
}
