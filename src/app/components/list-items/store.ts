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

@Injectable({
  providedIn: 'root',
})
export class ItemsStateService {

  private stateItems = signal<ItemsState>({
    loaded: false,
    items: [],
  });

  getState = computed(() => this.stateItems());

  private getList = new Subject<Subscriber<any>>();
  private itemStateAdd = new Subject<Omit<ItemModel, 'id'>>();
  private itemStateUpdate = new Subject<ItemUpdateSubjectData>();

  private apiServiceItems = inject(APIServiceItems) ;
  private initialRun = false;

  constructor() {

    this.effectPutList();

    // this.subscriberGetList();
    this.subscriberItemAdd();
    this.subscriberItemStateUpdate();

    // this.load().subscribe();

  }

  // private load() {
  //   return new Observable((subscriber) => {
  //     this.getList.next(subscriber);
  //   });
  // }

  private effectPutList(){
    effect(() => {
      if(this.stateItems() && this.initialRun){
        console.log('effect apiServiceItems.putList', this.stateItems().items);
        this.apiServiceItems.putList(this.stateItems().items).subscribe();
      }
      this.initialRun = this.stateItems().loaded;
    });
  }

  itemAdd(item: Omit<ItemModel, 'id'>) {
    this.itemStateAdd.next(item);
  }

  // itemUpdate(updatedItem: ItemUpdate) {
  //   return new Observable((subscriber) => {
  //     this.itemStateUpdate.next({
  //       subscriber,
  //       itemUpdate: updatedItem,
  //     });
  //   });
  // }

  itemUpdate(updatedItem: ItemUpdate) {
    this.itemStateUpdate.next({
      itemUpdate: updatedItem,
    });
  }

  load(){
    this.initialRun = false;
    this.stateItems.update(state => {
      return {
        ...state,
        loaded: false,
        items: []
      }
    });
    // this.getList.subscribe(subscription => {
      this.apiServiceItems.getList().pipe(take(1)).subscribe(
        result => {
          this.stateItems.update(state => {
            return {
              ...state,
              loaded: true,
              items: (result as ItemState[]).map(
                item => ({...item, loading: false})
              )
            }
          });
          // subscription.next(true);
          // subscription.complete();
        },
        error => {
          // subscription.error(error);
          // subscription.complete();
        }
      )
    // });
  }

  private subscriberItemAdd(){
    this.itemStateAdd.subscribe((item) => {
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
  }

  private pipeSetItemLoading(itemStateSubjectData: ItemUpdateSubjectData) {
    if (itemStateSubjectData.itemStateReference) {
      itemStateSubjectData.itemStateReference.loading = true;
      this.stateItems.update((state) => ({ ...state }));
    }
  }

  private subscriberItemStateUpdate(){
    this.itemStateUpdate
      .pipe(

        takeUntilDestroyed(),

        // set item state reference
        tap(
          (itemStateSubjectData) =>
            (itemStateSubjectData.itemStateReference =
              this.stateItems().items.find(
                (item) => item.id === itemStateSubjectData.itemUpdate.id
              ))
        ),

        // set item loading
        tap(itemStateSubjectData => this.pipeSetItemLoading(itemStateSubjectData)),

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

                // itemStateSubjectData.subscriber.error(error);

                return of(itemStateSubjectData);
              })
            );
        })

      )

      // complete subscribe
      .subscribe((itemStateSubjectData) => {
        console.log('result', itemStateSubjectData);
        // itemStateSubjectData.subscriber.next(itemStateSubjectData);
        // itemStateSubjectData.subscriber.complete();
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
  // subscriber: Subscriber<any>;
}
