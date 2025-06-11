import { Injectable, signal, computed, effect } from '@angular/core';
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
    loaded: false,
    items: [],
  });
  state = computed(() => this.stateItems());
  items = computed(() => this.stateItems().items);
  loaded = computed(() => this.stateItems().loaded);
  getList = new Subject<Subscriber<any>>();
  itemAdd = new Subject<Omit<ItemModel, 'id'>>();
  itemStateUpdate = new Subject<ItemUpdateSubjectData>();
  constructor(private apiServiceItems: APIServiceItems) {

    effect(() => {
      if(this.loaded()){
        console.log('effect apiServiceItems.putList', this.stateItems().items);
        this.apiServiceItems.putList(this.stateItems().items).subscribe();
      }
    });

    this.getList.subscribe(subscription => {
      this.apiServiceItems.getList().subscribe(
        result => {
          this.stateItems.update(state => {
            return {
              ...state,
              loaded: true,
              items: result as ItemState[]
            }
          });
          subscription.next(true);
          subscription.complete();
        },
        error => {
          subscription.error(error);
          subscription.complete();
        }
      )
    });

    this.load().subscribe();

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
            .patchItem({
              id: itemStateSubjectData.itemUpdate.id,
              ...itemStateSubjectData.itemUpdate.itemProperties,
            })
            .pipe(
              map((result) => {
                if (itemStateSubjectData.itemStateReference) {
                  Object.assign(itemStateSubjectData.itemStateReference, {
                    ...result,
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
                  itemStateSubjectData.itemStateReference.error = error.message;
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

  load() {
    return new Observable((subscriber) => {
      this.getList.next(subscriber);
    });
  }

}

export interface ItemsState {
  loaded: boolean;
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
