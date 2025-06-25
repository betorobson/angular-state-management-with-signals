import { Injectable, inject} from '@angular/core';
import { StateAuthors, StateAuthorsActions, StateAuthorsServiceStore } from '../authors/store';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { StateStoreEntityActions } from '../../state-store-management-base/state.store.base';
import { APIServiceAuthors, AuthorsModel } from '../../api-services/authors.service';

@Injectable({
  providedIn: 'root',
})
export class StateAuthorsServiceEffects extends StateEffectsBase<StateAuthors, AuthorsModel> {

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
        this.stateStoreReference.entityActions[StateStoreEntityActions.ADD_ENTITIES](authors);
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
