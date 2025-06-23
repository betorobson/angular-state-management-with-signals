import { Component, inject } from '@angular/core';
import { CounterStoreService, StateCounterActions } from './store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counter',
  imports: [CommonModule],
  template: `
    <div>Valor atual: {{ count() }}</div>
    <div>Mensagem: {{ message() }}</div>
    <button (click)="increment()">Incrementar</button>
    <button (click)="decrement()">Decrementar</button>
    <button (click)="reset()">Resetar</button>
  `,
})
export class AppCounterComponent {

  private counterStoreService = inject(CounterStoreService);

  count = this.counterStoreService.selectors.count;
  message = this.counterStoreService.selectors.message;

  increment(){
    this.counterStoreService.actions[StateCounterActions.INCREMENT]();
  }

  decrement(){
    this.counterStoreService.actions[StateCounterActions.DECREMENT]();
  }

  reset(){
    this.counterStoreService.actions[StateCounterActions.RESET]();
  }

}
