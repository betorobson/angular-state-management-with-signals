import { Injectable, inject} from '@angular/core';
import { StateAuthorsServiceStore } from '../authors/store';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { CounterStoreService, StateCounterActions, StateCounterModel } from './store';
import { APIServiceCounter } from '../../api-services/counter.service';

@Injectable({
  providedIn: 'root',
})
export class StateCounterServiceEffects extends StateEffectsBase<StateCounterModel, any> {

  protected override stateStoreReference: CounterStoreService;
  private stateAuthorsServiceStore = inject(StateAuthorsServiceStore);

  private apiServiceCounter = inject(APIServiceCounter);

  register(){

    this.registerEffect(
      StateCounterActions.INCREMENT,
      () => {
        this.stateStoreReference.actions[StateCounterActions.GET_API](
          this.stateStoreReference.selectors.count()
        );
      }
    );

    this.registerEffect(
      StateCounterActions.GET_API,
      (count: number) => {
        this.runEffectAsyncPipe(
          StateCounterActions.GET_API,
          this.apiServiceCounter.get(count)
        );
      }
    );

  }

}
