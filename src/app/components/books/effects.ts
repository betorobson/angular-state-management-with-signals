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
import { StateAuthorsServiceStore } from '../authors/store';
import { StateBooks, StateBooksActions, StateBooksServiceStore } from './store';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { EffectNameSuffixes, StateStoreBase } from '../../state-store-management-base/state.store.base';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceEffects extends StateEffectsBase<StateBooks> {

  private stateAuthorsServiceStore = inject(StateAuthorsServiceStore);
  protected override stateStoreReference: StateBooksServiceStore;

  private testCount = 0;
  protected override effects = {
    [StateBooksActions.LOAD_DATA]: () => {

      this.stateStoreReference.actions[StateBooksActions.SET_LAST_UPDATE](-1);

      this.runEffectAsyncPipe(
        StateBooksActions.LOAD_DATA,
        of({lastUpdate: 123})
          .pipe(
            delay(2000),
            tap(result => {
              if(result.lastUpdate < 1000) {
                throw new Error('too low');
              }
            })
          )
      );

    },

    [`${StateBooksActions.LOAD_DATA}:SUCCESS`]: (result: {lastUpdate: number}) => {
      console.log('EFFECT: LOAD DATA SUCCESS', result);
      // this.stateStoreReference.actions[StateBooksActions.SET_LAST_UPDATE](result.lastUpdate);
    },

    [`${StateBooksActions.LOAD_DATA}:ERROR`]: (result: any) => {
      console.log('EFFECT: LOAD DATA ERROR', result);
      // this.stateStoreReference.actions[StateBooksActions.SET_LAST_UPDATE](1);
    },

    [StateBooksActions.SET_LAST_UPDATE]: (properties: any) => {
      console.log('EFFECT: SET_LAST_UPDATE', properties)
      // this.testCount++;
      // return stateModelObservable
      //   .pipe(
      //     tap(() => {
      //       if(this.testCount > 3){
      //         throw new Error('Only allowed 3 times update');
      //       }
      //     })
      //   );
    },
    // [`${StateBooksActions.SET_LAST_UPDATE}:${EffectNameSuffixes.ERROR}`]: (properties: any) => {
    //   console.log('error', properties);
    //   // this.testCount = 0;
    //   // this.stateStoreReference.actions[StateBooksActions.SET_LAST_UPDATE](0);
    //   // return stateModel;
    // }
  }

  private entiryEffects: Effects = {

    [EffectsNames.ADD_ENTITY]: entity => {
      return entity.pipe(

          delay(1000),

          tap(entity => {
            if(/bob/.test(entity.title)) throw new Error('Bob is not an allowed world in book title')
            console.log('observableEntity 2', entity);
          })

      );
    },

    [EffectsNames.ADD_ENTITY_SUCCESS]: (entity) => {
      return entity.pipe(
        // UPDATE Parent State
        tap(entity => {
          this.stateAuthorsServiceStore.updateTotalBooks(entity.authorId)
        })
      )
    },

    [EffectsNames.UPDATE_ENTITY]: (entity) => {
      return entity.pipe(
        delay(300),
        // Validation
        tap(entity => {
          if(entity.rating > 10 || entity.rating < 0){
            throw new Error('Rating value must be between 0 and 10');
          }
        })
      )
    }

  }

  runEntityEffect(
    name: EffectsNames,
    entity: Observable<BooksModel>
  ){
      if(this.entiryEffects[name]){
        return this.entiryEffects[name](entity);
      }else{
        return entity;
      }
  }

}

type Effects = {
  [effectName in EffectsNames]?: (entity: Observable<BooksModel>) => Observable<BooksModel>;
}

export enum EffectsNames {
  ADD_ENTITY,
  ADD_ENTITY_SUCCESS,
  ADD_ENTITY_ERROR,
  UPDATE_ENTITY
}
