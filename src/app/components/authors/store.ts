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
import { StateStoreBase, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';

@Injectable({
  providedIn: 'root',
})
export class StateAuthorsServiceStore extends StateStoreBase<StateAuthors, AuthorsModel> {

  protected override STATE = signal<StateAuthors>({
    lastUpdate: 0
  });

  selectors = {
    selectAll: computed(() => this.STATE_ENTITIES().ids.map(id => this.STATE_ENTITIES().entities[id])),
  }

  constructor(){

    super();

    this.setExecReducers();

    this.entityActions[StateStoreEntityActions.ADD_ENTITY]({
      id: '1',
      name: 'Robert Nogueira',
      about: 'It\'s me',
      totalBooks: 0
    });

    this.entityActions[StateStoreEntityActions.ADD_ENTITY]({
      id: '2',
      name: 'Robson Soares',
      about: 'Also It\'s me',
      totalBooks: 0
    });

  }

  addAuthor(author: AuthorsModel){
    this.entityActions[StateStoreEntityActions.ADD_ENTITY](author);
  }

  protected override reducers = {
    [StateAuthorsActions.INCREMENT_TOTAL_BOOKS]: (authorId: string) => {
      console.log(StateAuthorsActions.INCREMENT_TOTAL_BOOKS, authorId);
      this.STATE_ENTITIES.update(
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

  override actions = {
    [StateAuthorsActions.INCREMENT_TOTAL_BOOKS]
      : (authorId: string) => this.execReducer(StateAuthorsActions.INCREMENT_TOTAL_BOOKS, authorId),
  }

}

interface StateAuthors {
  lastUpdate: number,
}

export enum StateAuthorsActions {
  INCREMENT_TOTAL_BOOKS = 'INCREMENT_TOTAL_BOOKS',
}
