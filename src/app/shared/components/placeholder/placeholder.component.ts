import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [],
  template: `
    <div class="placeholder-container">
      @if (icon) {
        <div class="placeholder-icon">{{ icon }}</div>
      }
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
    </div>
    `,
  styles: [`
    .placeholder-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
      padding: 40px;
    }

    .placeholder-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    h2 {
      color: #333;
      margin: 0 0 12px 0;
      font-size: 1.5rem;
    }

    p {
      color: #999;
      margin: 0;
      max-width: 400px;
    }
  `]
})
export class PlaceholderComponent {
  @Input() icon = '';
  @Input() title = 'En construction';
  @Input() message = 'Cette fonctionnalité sera bientôt disponible.';
}
