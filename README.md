# Uma abordagem simplificada de controle de estado com Signals no Angular

Durante meus estudos recentes sobre controle de estado no Angular, me propus a explorar alternativas mais simples e diretas do que soluções robustas e, muitas vezes, complexas como o NgRX ou Redux. Meu objetivo era manter os princípios fundamentais de _state management_ — como ações, efeitos, reducers e store — mas utilizando os recursos mais modernos do Angular, como os _signals_, que vêm ganhando força com as atualizações mais recentes do framework.

Para embasar esse estudo, analisei dois artigos fundamentais:

 - [State Management with RxJS and Signals — Modern Angular](https://modernangular.com/articles/state-management-with-rxjs-and-signals)
Esse artigo trata da integração entre RxJS e signals, apontando caminhos para uma arquitetura de estado mais fluida e reativa
 - [Common Terms in NgRx and State Management — Plain English (Medium)](https://javascript.plainenglish.io/common-terms-in-ngrx-and-state-management-for-angular-beginners-c03e49e140bc)
Esse outro fornece uma introdução clara aos conceitos principais do NgRX e suas estruturas, como actions, selectors e reducers, que me ajudaram a entender o que realmente deveria ser mantido em uma solução mais enxuta.

Com base nesse conhecimento, desenvolvi uma classe abstrata em TypeScript que funciona como uma **State Store Base**. Qualquer componente Angular pode passar a ter controle de estado de forma isolada e organizada, bastando criar um **Angular Service** que estenda essa classe base.

Apesar de estar em uma fase inicial, a solução já provou ser eficaz, e considero o seu uso extremamente simples e intuitivo. Ao invés de depender de uma biblioteca externa cheia de convenções rígidas, minha proposta permite que o próprio desenvolvedor controle sua estrutura de estado com flexibilidade, clareza e sem sair dos padrões já conhecidos de _state management_.

A classe implementa os conceitos de **Actions**, **Effects**, **Reducer** e **Store**, mas de forma desacoplada e minimalista. O uso de _signals_ como mecanismo central de reatividade torna o controle de estado mais leve e integrado ao Angular moderno, evitando a verbosidade e o _boilerplate_ de bibliotecas como o NgRX.

Compartilhei um exemplo básico dessa implementação no meu [GitHub](#), que, embora ainda esteja cru, será gradualmente aprimorado com documentação mais detalhada e exemplos práticos. Acredito que essa abordagem possa ajudar outros desenvolvedores que, como eu, buscam soluções mais simples e eficazes para controle de estado em aplicações Angular.

Em resumo, este estudo reforça minha crença de que é possível construir sistemas escaláveis e bem estruturados sem abrir mão da simplicidade. A comunidade Angular está evoluindo rapidamente, e acredito que ideias como essa têm espaço para crescer e amadurecer ainda mais.

Acredito que o Angular, com a introdução de Signals, criou um movimento muito forte para programação reativa com controle de estado. Além disso, o Angular pode ser configurado sem o uso do Zone.js, o que torna tudo baseado em Signals — ou seja, um bom controle de estado precisa ser implementado. Mas, nesse momento, ainda prefiro ter o melhor dos dois mundos, seja controlando estado com Signals ou declarando propriedades no componente e referenciando no template.

---

## Exemplo básico de uso do State Store Base

A seguir, um exemplo simplificado de como utilizar a `StateStoreBase` em um `Angular Service`:

```ts
// store.ts
import { Injectable, signal, computed, inject} from '@angular/core';
import { StateStoreBase } from '../../state-store-management-base/state.store.base';
import { StateCounterServiceEffects } from './effects';
import { APIServiceCounterGETResponse } from '../../api-services/counter.service';

@Injectable({
  providedIn: 'root',
})
export class CounterStoreService extends StateStoreBase<StateCounterModel, any> {

  constructor(){

    super();

    this.initState({
      count: 0,
      message: ''
    });

    this.initActions(
      inject(StateCounterServiceEffects)
    );

  }

  ///////////////////// SELECTORS
  selectors = {
    count: computed(() => this.STATE_STORE().count),
    message: computed(() => this.STATE_STORE().message),
  }

  ///////////////////// ACTIONS

  override actions = {

    [StateCounterActions.INCREMENT]: () => {
      this.updateStateStore(state => ({...state, count: state.count + 1}));
    },

    [StateCounterActions.DECREMENT]: () => {
      this.updateStateStore(state => ({...state, count: state.count - 1}));
    },

    [StateCounterActions.RESET]: () => {
      this.updateStateStore(state => ({...state, count: 0}));
    },

    [StateCounterActions.GET_API]: (count: number) => {},

    [`${StateCounterActions.GET_API}:SUCCESS`]: (response: APIServiceCounterGETResponse) => {
      this.updateStateStore(state => ({...state, message: response.message}));
    },

    [`${StateCounterActions.GET_API}:ERROR`]: (error: ErrorEvent) => {
      this.updateStateStore(state => ({...state, message: error.message}));
    },

  }

}

export interface StateCounterModel {
  count: number;
  message: string;
}

export enum StateCounterActions {
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
  RESET = 'RESET',
  GET_API = 'GET_API'
}

```

Exemplo de effects enviando o dado para o servidor de forma assíncrona e depois executando as actions de sucesso ou erro dependendo da resposta.
```ts
// effects.ts
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


```

No componente, o uso fica simples e direto:
```ts
// counter.ts
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

```
Esse exemplo simples mostra como a arquitetura baseada em signals e uma StateStoreBase pode fornecer uma estrutura leve, intuitiva e eficaz para gerenciar estado sem a complexidade de bibliotecas como NgRX.

Caso deseje contribuir, sugerir melhorias ou acompanhar a evolução desse estudo, fique à vontade para visitar o repositório e abrir issues ou pull requests.
