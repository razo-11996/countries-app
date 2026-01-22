import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ButtonSize, ButtonVariant, NativeButtonType } from './button.types';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-button',
  imports: [RouterLink, NgClass],
  styleUrl: './button.component.scss',
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly routerLink = input<string | any[] | null>(null);

  readonly ariaLabel = input<string | null>(null);
  readonly ariaPressed = input<boolean | null>(null);

  readonly extraClass = input('');
  readonly disabled = input(false);
  readonly size = input<ButtonSize>('md');
  readonly type = input<NativeButtonType>('button');
  readonly variant = input<ButtonVariant>('surface');
}
