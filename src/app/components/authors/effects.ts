import { Injectable, inject} from '@angular/core';
import { StateAuthors, StateAuthorsActions, StateAuthorsEntityCustomMetaData, StateAuthorsServiceStore } from '../authors/store';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { STATE_BASE_ENTITY, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';
import { APIServiceAuthors, AuthorsModel } from '../../api-services/authors.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateAuthorsServiceEffects extends StateEffectsBase<StateAuthors, AuthorsModel, StateAuthorsEntityCustomMetaData> {

  protected override stateStoreReference: StateAuthorsServiceStore;
  private apiServiceAuthors = inject(APIServiceAuthors);

  register(){

    this.registerEffect(
      StateAuthorsActions.LOAD_DATA,
      () => {

        this.apiServiceAuthors.get()
          .pipe(tap(authors =>
              this.stateStoreReference.entityActions[StateStoreEntityActions.ADD_ENTITIES](
                authors.map<STATE_BASE_ENTITY<AuthorsModel, StateAuthorsEntityCustomMetaData>>(
                  author => ({
                    meta_data: {
                      error: null,
                      loading: false,
                      custom: {
                        totalBooks: 0
                      }
                    },
                    data: author
                  })
                )
              )
          ))
          .subscribe(
            authors => this.stateStoreReference.actions[`${StateAuthorsActions.LOAD_DATA}:SUCCESS`](authors),
            error => console.log(`EFFECT: ${StateAuthorsActions.LOAD_DATA} ERROR`, error)
          );

      }
    );

  }

}
