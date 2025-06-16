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
import { AuthorsModel } from '../../api-services/authors.service';

@Injectable({
  providedIn: 'root',
})
export class StateAuthorsServiceStore {

  private STATE = signal<StateAuthors>({
    ids: ['1', '2'],
    entities: {
      '1': {
        id: '1',
        name: 'Robert Nogueira',
        about: 'It\'s me',
        totalBooks: 0
      },
      '2': {
        id: '2',
        name: 'Robson Soares',
        about: 'Also It\'s me',
        totalBooks: 0
      }
    }
  });

  constructor(){
    this.dispatchReducers.addEntity.subscribe(
      entity => this.reducers.addEntity(entity)
    );
    this.dispatchReducers.updateTotalBooks.subscribe(
      id => this.reducers.updateTotalBooks(id)
    );
  }

  ///////////////////// SELECTORS
  selectors = {
    selectAll: computed(() => this.STATE().ids.map(id => this.STATE().entities[id]))
  }

  ///////////////////// REDUCERS
  private reducers = {
    addEntity: (author: AuthorsModel) => {
      this.STATE.update(
        state => ({
          ...state,
          ids: [...state.ids, author.id],
          entities: {...state.entities, [author.id]: author}
        })
      )
    },
    updateTotalBooks: (authorId: string) => {
      this.STATE.update(
        state => ({
          ...state,
          entities: {
            ...state.entities,
            [authorId]: {
              ...state.entities[authorId],
              totalBooks: state.entities[authorId].totalBooks + 1
            }
          }
        })
      )
    },
  }

  private dispatchReducers = {
    addEntity: new Subject<AuthorsModel>,
    updateTotalBooks: new Subject<string>,
  }

  ///////////////////// ACTIONS

  addAuthor(book: AuthorsModel){
    this.dispatchReducers.addEntity.next(book);
  }

  updateTotalBooks(authorId: string){
    this.dispatchReducers.updateTotalBooks.next(authorId);
  }

}

interface StateAuthors {
  ids: string[],
  entities: {[key: string]: AuthorsModel};
}
