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

    this.initActions(
      inject(StateAuthorsServiceEffects)
    );

    this.actions[StateAuthorsActions.LOAD_DATA]();

  }

  getInitialStateStore(){
    return {
      lastUpdate: 0,
      loading: true
    }
  }

  selectors = {
    selectAll: computed(() => this.STATE_STORE_ENTITIES().ids.map(id => this.STATE_STORE_ENTITIES().entities[id])),
    loading: computed(() => this.STATE_STORE().loading),
    entities: computed(() => this.STATE_STORE_ENTITIES().entities),
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

    [StateAuthorsActions.UPDATE_TOTAL_BOOKS]: (data: {authorId: string, increment: boolean}) => {
      console.log(StateAuthorsActions.UPDATE_TOTAL_BOOKS, data.authorId);
      this.updateStateStoreEntities(
        state => ({
          ...state,
          entities: {
            ...state.entities,
            [data.authorId]: {
              ...state.entities[data.authorId],
              totalBooks: state.entities[data.authorId].totalBooks + (data.increment ? 1 : -1)
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
  UPDATE_TOTAL_BOOKS = 'INCREMENT_TOTAL_BOOKS',
  LOAD_DATA = 'LOAD_DATA'
}
