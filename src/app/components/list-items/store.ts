import { Injectable, signal, computed } from '@angular/core';
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
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APIServiceItems, ItemModel } from '../../api-services/items.service';

@Injectable({
  providedIn: 'root',
})
export class ItemsStateService {
  private stateItems = signal<ItemsState>({
    items: [],
  });
  state = computed(() => this.stateItems());
  items = computed(() => this.stateItems().items);
  itemAdd = new Subject<Omit<ItemModel, 'id'>>();
  itemStateUpdate = new Subject<ItemUpdateSubjectData>();
  constructor(private apiServiceItems: APIServiceItems) {
    this.itemAdd.subscribe((item) => {
      return this.stateItems.update((state) => {
        state.items.push({
          loading: false,
          error: null,
          ...item,
          id: new Date().getTime(),
        });
        return {
          ...state,
        };
      });
    });

    this.itemStateUpdate
      .pipe(

        // set item state reference
        tap(
          (itemStateSubjectData) =>
            (itemStateSubjectData.itemStateReference =
              this.stateItems().items.find(
                (item) => item.id === itemStateSubjectData.itemUpdate.id
              ))
        ),

        // set item loading
        tap((itemStateSubjectData) => {
          if (itemStateSubjectData.itemStateReference) {
            itemStateSubjectData.itemStateReference.loading = true;
            this.stateItems.update((state) => ({ ...state }));
          }
        }),

        // push update to API
        mergeMap((itemStateSubjectData) => {
          console.log('mergeMap', itemStateSubjectData);
          return this.apiServiceItems
            .patch({
              id: itemStateSubjectData.itemUpdate.id,
              ...itemStateSubjectData.itemUpdate.itemProperties,
            })
            .pipe(
              map((result) => {
                if (itemStateSubjectData.itemStateReference) {
                  Object.assign(itemStateSubjectData.itemStateReference, {
                    ...result.body,
                    loading: false,
                    error: null,
                  });
                  this.stateItems.update((state) => ({ ...state }));
                }
                return itemStateSubjectData;
              }),
              catchError((error) => {
                if (itemStateSubjectData.itemStateReference) {
                  itemStateSubjectData.itemStateReference.loading = false;
                  itemStateSubjectData.itemStateReference.error = error;
                  this.stateItems.update((state) => ({ ...state }));
                }

                itemStateSubjectData.subscriber.error(error);

                return of(itemStateSubjectData);
              })
            );
        }),
        takeUntilDestroyed()
      )

      // complete subscribe
      .subscribe((itemStateSubjectData) => {
        console.log('result', itemStateSubjectData);
        itemStateSubjectData.subscriber.next(itemStateSubjectData);
        itemStateSubjectData.subscriber.complete();
      });
  }

  itemUpdate(updatedItem: ItemUpdate) {
    return new Observable((subscriber) => {
      this.itemStateUpdate.next({
        subscriber,
        itemUpdate: updatedItem,
      });
    });
  }
}

export interface ItemsState {
  items: ItemState[];
}

export type ItemState = ItemModel & {
  loading: boolean;
  error: any;
};

export interface ItemUpdate {
  id: number;
  itemProperties: Omit<ItemModel, 'id'>;
}

export interface ItemUpdateSubjectData {
  itemUpdate: ItemUpdate;
  itemStateReference?: ItemState;
  subscriber: Subscriber<any>;
}
