import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorPlus, phosphorCaretLeft, phosphorCaretRight } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, NgIcon],
  viewProviders: [provideIcons({ phosphorPlus, phosphorCaretLeft, phosphorCaretRight })],
  templateUrl: './certificates.html',
  styleUrl: './certificates.scss'
})
export class Certificates {
  @ViewChild('carousel', { static: false }) carousel!: ElementRef<HTMLDivElement>;

  scrollLeft() {
    if (this.carousel) {
      const cardWidth = 320;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      this.carousel.nativeElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.carousel) {
      const cardWidth = 320;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      this.carousel.nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}


