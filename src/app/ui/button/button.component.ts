import { RouterLink } from '@angular/router';
import type { ButtonSize, ButtonVariant, NativeButtonType } from './button.types';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="classes()"
      [disabled]="disabled()"
      [routerLink]="routerLink() ?? null"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  readonly routerLink = input<string | any[] | null>(null);

  readonly variant = input<ButtonVariant>('surface');
  readonly size = input<ButtonSize>('md');
  readonly type = input<NativeButtonType>('button');
  readonly disabled = input(false);
  readonly extraClass = input('');

  readonly classes = computed(() => {
    const base =
      'inline-flex cursor-pointer select-none items-center justify-center rounded-xl shadow-sm ring-1 ring-[var(--app-border)] transition focus:outline-none focus:ring-2 focus:ring-[var(--app-fg)]/40';

    const size = (() => {
      switch (this.size()) {
        case 'sm':
          return 'gap-2 px-3 py-2 text-sm font-medium';
        case 'icon':
          return 'p-2';
        case 'md':
        default:
          return 'gap-2 px-3 py-2 text-sm font-medium';
      }
    })();

    const variant = (() => {
      switch (this.variant()) {
        case 'primary':
          return 'bg-[var(--app-fg)] text-[var(--app-bg)] hover:opacity-90';
        case 'ghost':
          return 'bg-transparent text-[var(--app-fg)] ring-transparent hover:bg-[color-mix(in_oklch,var(--app-fg)_8%,transparent)]';
        case 'surface':
        default:
          return 'bg-[var(--app-card)] text-[var(--app-fg)] hover:opacity-90';
      }
    })();

    const disabled = this.disabled() ? 'opacity-60' : '';
    const extra = (this.extraClass() ?? '').trim();

    return [base, size, variant, disabled, extra].filter(Boolean).join(' ');
  });
}

