import { Injectable } from '@angular/core';
import { of, delay, tap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class APIServiceCounter {
  get(count: number){
    return of(count)
      .pipe(
        delay(200),
        map(count => {
          if(count === 5){ // mock a API Error
            throw new Error('Server error at count ' + count);
          }else{
            return {
              message: `Você clicou ${count} vezes`
            } as APIServiceCounterGETResponse
          }
        })
      )
  }
}

export interface APIServiceCounterGETResponse {
  message: string;
}
