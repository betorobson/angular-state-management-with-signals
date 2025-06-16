# App

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## References
https://modernangular.com/articles/state-management-with-rxjs-and-signals
https://sergeygultyayev.medium.com/5-mistakes-developers-make-when-using-signals-in-angular-159dee1a0b26
https://angular.love/breakthrough-in-state-management-discover-the-simplicity-of-signal-store-part-1
https://medium.com/strands-tech-corner/reduce-boilerplate-with-redux-toolkit-d56047455d63
https://javascript.plainenglish.io/common-terms-in-ngrx-and-state-management-for-angular-beginners-c03e49e140bc
https://blog.flotes.app/posts/angular-fine-grain-reactivity

---
To update the parent state when an entity within an NgRx Entity state changes, you'll typically follow these steps:

1. Define Actions
Create specific actions for updating the parent state. These actions should clearly describe the changes you want to make to the parent state. For example:
TypeScript
```
// parent.actions.ts
import { createAction, props } from '@ngrx/store';

export const updateParentState = createAction(
  '[Parent] Update Parent State',
  props<{ parentProperty: any }>() // Adjust type as needed
);
```
2. Update Reducer
In the parent reducer, handle the new action to update the necessary properties of the parent state.
TypeScript
```
// parent.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { updateParentState } from './parent.actions';

export interface ParentState {
  parentProperty: any; // Adjust type as needed
}

export const initialState: ParentState = {
  parentProperty: null,
};

export const parentReducer = createReducer(
  initialState,
  on(updateParentState, (state, { parentProperty }) => ({
    ...state,
    parentProperty: parentProperty,
  }))
);
```
3. Dispatch Action from Entity Reducer or Effect
When an entity is updated, you need to dispatch the updateParentState action. This can be done in a few ways:
Within the entity reducer:
If the entity update directly triggers a change in the parent state, you can dispatch the action directly from the entity reducer.
Using an effect:
If the parent state update depends on the updated entity or some logic, it's recommended to use an effect to handle the update.
TypeScript
```
// entity.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs/operators';
import { updateEntity } from './entity.actions'; // Example entity update action
import { updateParentState } from './parent.actions';
import { selectEntity } from './entity.selectors'; // Example entity selector
import { ParentState } from './parent.reducer';

@Injectable()
export class EntityEffects {
  updateParentState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateEntity), // Replace with your entity update action
      withLatestFrom(this.store.select(selectEntity)), // Select updated entity
      tap(([action, entity]) => {
        // Perform logic to determine new parent state
        const parentProperty = entity.someProperty; // Example logic
        this.store.dispatch(updateParentState({ parentProperty }));
      })
    ), {dispatch: false}
  );

  constructor(
    private actions$: Actions,
    private store: Store<{ parent: ParentState }>
  ) {}
}
```
4. Select Parent State
In the components or services that need the parent state, use a selector to access it.
TypeScript
```
// parent.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ParentState } from './parent.reducer';

export const selectParentState = createFeatureSelector<ParentState>('parent'); // Use your feature name

export const selectParentProperty = createSelector(
  selectParentState,
  (state) => state.parentProperty
);
```
Key Considerations:
Immutability: Ensure that your reducers update the state immutably, creating new state objects rather than modifying existing ones.
Effects: Use effects for side effects, such as API calls or complex logic, to keep reducers pure.
Selectors: Use selectors to efficiently access and derive data from the store.
Performance: Avoid complex logic in reducers. Keep them simple and focused on state updates.
Clear Actions: Use clear action names to describe the changes you are making.
Normalization: Consider normalizing your data to avoid issues with nested or hierarchical data structures.
By following these steps, you can effectively update parent state based on changes to entities within your NgRx store.
