import { Injectable, inject} from '@angular/core';
import { APIServiceBooks, BooksModel } from '../../api-services/books.service';
import { StateAuthorsActions, StateAuthorsServiceStore } from '../authors/store';
import { STATE_BASE_BOOK_ENTITY, StateBooks, StateBooksActions, StateBooksRawData, StateBooksServiceStore } from './store';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { STATE_BASE_ENTITY, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceEffects extends StateEffectsBase<StateBooks, BooksModel> {

  protected override stateStoreReference: StateBooksServiceStore;
  private stateAuthorsServiceStore = inject(StateAuthorsServiceStore);

  private apiServiceBooks = inject(APIServiceBooks);

  register(){

    // LOAD DATA

    this.registerEffect(
      StateBooksActions.LOAD_DATA,
      () => {
        this.apiServiceBooks.get().subscribe(
          result => this.stateStoreReference.actions[StateBooksActions.LOAD_DATA_SUCCESS](result),
          error => this.stateStoreReference.actions[StateBooksActions.LOAD_DATA_ERROR](error)
        )
      }
    );

    // SAVE DATA

    this.registerEffect(
      StateBooksActions.SAVE_DATA,
      () => {

        // this.stateStoreReference.actions[StateBooksActions.SET_LAST_UPDATE](
        //   new Date().getTime()
        // );

        this.apiServiceBooks.saveAllBooks(
          this.stateStoreReference.selectors.rawData()
        ).subscribe(
          () => this.stateStoreReference.actions[StateBooksActions.SAVE_DATA_SUCCESS]()
        );

      }
    );

    // ADD ENTRY

    this.registerEffect(
      StateBooksActions.ASYNC_ADD_ENTITY_API,
      (bookModel: BooksModel) => {
        this.apiServiceBooks.post(bookModel).subscribe(
          () =>
            this.stateStoreReference.entityActions[StateStoreEntityActions.ADD_ENTITY]({
              meta_data: {
                error: null,
                loading: false,
                custom: {
                  pending: false
                }
              },
              data: bookModel
            }),
          error => {
            console.log(`EFFECT: ${StateBooksActions.ASYNC_ADD_ENTITY_API} ERROR`, error);
            alert(error);
          }
        );
      }
    );

    // UPDATE ENTRY

    this.registerEffect(
      StateBooksActions.ASYNC_UPDATE_ENTITY_API,
      (stateBaseEntityBook: STATE_BASE_BOOK_ENTITY) => {

        this.stateStoreReference.entityActions[StateStoreEntityActions.UPDATE_ENTITY](
          {
            ...stateBaseEntityBook,
            meta_data: {
              error: null,
              loading: true
            }
          }
        );

        this.apiServiceBooks.put(stateBaseEntityBook.data).subscribe(
          (result) => this.stateStoreReference.entityActions[StateStoreEntityActions.UPDATE_ENTITY]({
            meta_data: {
              error: null,
              loading: false,
            },
            data: stateBaseEntityBook.data
          }),
          error => {
            console.log(`${StateStoreEntityActions.UPDATE_ENTITY}:ERROR`, error);
            alert(error)
          }
        );

      }
    );

    this.registerEffect(
      StateBooksActions.SET_LAST_UPDATE,
      (properties: any) => {
        console.log('EFFECT: SET_LAST_UPDATE', properties)
        this.apiServiceBooks.saveAllBooks(
          this.stateStoreReference.selectors.rawData()
        ).subscribe()
      }
    );

    // ENTITY

    this.registerEffect(
      StateStoreEntityActions.ADD_ENTITY,
      (entityBaseBook: STATE_BASE_BOOK_ENTITY) => {

        this.stateStoreReference.actions[StateBooksActions.SAVE_DATA]();

        this.stateAuthorsServiceStore
          .actions[StateAuthorsActions.UPDATE_TOTAL_BOOKS]({authorId: entityBaseBook.data.authorId, increment: true});

      }
    );

    this.registerEffect(
      StateStoreEntityActions.REMOVE_ENTITY,
      (entityBaseBook: STATE_BASE_BOOK_ENTITY) => {

        this.stateStoreReference.actions[StateBooksActions.SAVE_DATA]();

        this.stateAuthorsServiceStore
          .actions[StateAuthorsActions.UPDATE_TOTAL_BOOKS]({authorId: entityBaseBook.data.authorId, increment: false});

      }
    );

    this.registerEffect(
      StateStoreEntityActions.UPDATE_ENTITY,
      (registerEffect: STATE_BASE_BOOK_ENTITY) => {
        // this.stateStoreReference.actions[StateBooksActions.SAVE_DATA]();
      }
    );

  }

}
