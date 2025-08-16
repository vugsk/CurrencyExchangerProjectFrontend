import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home-header-container',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './home-header-container.html',
  styleUrl: './home-header-container.css'
})

export class HomeHeaderContainer {
  image_lang: string = "assets/home/en.png";
  image_logo: string = "assets/home/logo.svg";

}
