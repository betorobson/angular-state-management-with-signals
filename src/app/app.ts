import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListBooksComponent } from './components/books/books';
import { AppCounterComponent } from './components/counter/counter';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ListBooksComponent, AppCounterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'app';
}
