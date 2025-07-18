import { Injectable, inject} from '@angular/core';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { CounterStoreService, StateCounterActions, StateCounterModel } from './store';
import { APIServiceCounter } from '../../api-services/counter.service';

@Injectable({
  providedIn: 'root',
})
export class StateCounterServiceEffects extends StateEffectsBase<StateCounterModel, any> {

  protected override stateStoreReference: CounterStoreService;

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
      (count: number) => this.apiServiceCounter.get(count).subscribe(
        result => this.stateStoreReference.actions[`${StateCounterActions.GET_API}:SUCCESS`](result),
        error => this.stateStoreReference.actions[`${StateCounterActions.GET_API}:ERROR`](error)
      )
    );

  }

}
