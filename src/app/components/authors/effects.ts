import { Injectable, inject} from '@angular/core';
import { StateAuthors, StateAuthorsActions, StateAuthorsEntityCustomMetaData, StateAuthorsServiceStore } from '../authors/store';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { STATE_BASE_ENTITY, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';
import { APIServiceAuthors, AuthorsModel } from '../../api-services/authors.service';

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

        this.runEffectAsyncPipe(
          StateAuthorsActions.LOAD_DATA,
          this.apiServiceAuthors.get()
        );

      }
    );

    this.registerEffect(
      `${StateAuthorsActions.LOAD_DATA}:SUCCESS`,
      (authors: AuthorsModel[]) => {
        console.log('EFFECT: LOAD DATA SUCCESS', authors);
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
        );
      }
    );

    this.registerEffect(
      `${StateAuthorsActions.LOAD_DATA}:ERROR`,
      (result: any) => {
        console.log('EFFECT: LOAD DATA ERROR', result);
      }
    );

  }

}
