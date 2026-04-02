import { Component, inject, signal, OnInit } from '@angular/core';
import { AnimalsService } from '../../../api/services';
import { Animal } from '../../../api/models/animal';

@Component({
  selector: 'app-animals-page',
  templateUrl: './animals-page.html',
})
export class AnimalsPage implements OnInit {
  private animalsService = inject(AnimalsService);

  animals = signal<Animal[]>([]);
  loading = signal(true);

  async ngOnInit() {
    const data = await this.animalsService.apiAnimalsGet();
    this.animals.set(data);
    this.loading.set(false);
  }
}
