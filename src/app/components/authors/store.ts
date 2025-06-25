import { Injectable, computed, inject} from '@angular/core';
import { AuthorsModel } from '../../api-services/authors.service';
import { StateStoreBase, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';
import { StateAuthorsServiceEffects } from './effects';

@Injectable({
  providedIn: 'root',
})
export class StateAuthorsServiceStore extends StateStoreBase<StateAuthors, AuthorsModel> {

  constructor(){

    super();

    this.init(
      {
        lastUpdate: 0,
        loading: true
      },
      inject(StateAuthorsServiceEffects)
    );

    this.actions[StateAuthorsActions.LOAD_DATA]();

  }

  selectors = {
    selectAll: computed(() => this.STATE_STORE_ENTITIES().ids.map(id => this.STATE_STORE_ENTITIES().entities[id])),
    loading: computed(() => this.STATE_STORE().loading),
    // [todo] this does not look safe
    getAuthor: (id: string) => computed(() => this.STATE_STORE_ENTITIES().entities[id]),
  }

  addAuthor(author: AuthorsModel){
    this.entityActions[StateStoreEntityActions.ADD_ENTITY](author);
  }

  override actions = {
    [StateAuthorsActions.LOAD_DATA]: () => {},
    [`${StateAuthorsActions.LOAD_DATA}:SUCCESS`]: (authors: AuthorsModel[]) => {
      this.updateStateStore(
        state => ({
          ...state,
          loading: false
        })
      );
    },
    [`${StateAuthorsActions.LOAD_DATA}:ERROR`]: (error: any) => {},

    [StateAuthorsActions.INCREMENT_TOTAL_BOOKS]: (authorId: string) => {
      console.log(StateAuthorsActions.INCREMENT_TOTAL_BOOKS, authorId);
      this.updateStateStoreEntities(
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

}

export interface StateAuthors {
  lastUpdate: number,
  loading: boolean
}

export enum StateAuthorsActions {
  INCREMENT_TOTAL_BOOKS = 'INCREMENT_TOTAL_BOOKS',
  LOAD_DATA = 'LOAD_DATA'
}
