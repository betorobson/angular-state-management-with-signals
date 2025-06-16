import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListItems } from './components/list-items/list';
import { ListBooksComponent } from './components/books/books';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ListItems, ListBooksComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'app';
}
