import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListItems } from './components/list-items/list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ListItems],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'app';
}
