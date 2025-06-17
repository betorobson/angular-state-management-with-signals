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
import { EffectsNames, StateBooksServiceEffects } from './effects';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceStore {

  private stateBooksServiceEffects = inject(StateBooksServiceEffects);

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
          this.effects.addEntity_success(book);
        },
        error => {
          console.log('addBook', error);
          this.effects.addEntity_error(book, error);
        }
      )
  }

  updateBook(book: BooksModel){
    this.dispatchReducers.updateEntity.next(book);
  }

  ///////////////////// EFFECTS

  private effects = {

    addEntity: (entity: BooksModel) => this.stateBooksServiceEffects.runEffect(
      EffectsNames.ADD_ENTITY,
      of(entity)
    ),

    addEntity_success: (entity: BooksModel) => this.stateBooksServiceEffects.runEffect(
      EffectsNames.ADD_ENTITY_SUCCESS,
      of(entity)
    ).subscribe(),

    addEntity_error: (entity: BooksModel, error: ErrorEvent) => this.stateBooksServiceEffects.runEffect(
      EffectsNames.ADD_ENTITY_ERROR,
      of(entity)
    ).subscribe(),

  }

}

interface StateBooks {
  ids: string[],
  entities: {[bookId: string]: BooksModel};
}
