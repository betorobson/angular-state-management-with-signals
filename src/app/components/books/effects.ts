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
import { StateBooksServiceStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceEffects {

  private stateAuthorsServiceStore = inject(StateAuthorsServiceStore);
  // private stateBooksServiceStore = inject(StateBooksServiceStore);

  private effects: Effects = {

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

  runEffect(
    name: EffectsNames,
    entity: Observable<BooksModel>
  ){
      if(this.effects[name]){
        return this.effects[name](entity);
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
