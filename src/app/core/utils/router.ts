import type { Observable } from 'rxjs';
import { isNonEmptyString } from './guards';
import type { ParamMap } from '@angular/router';
import { normalizeCountryCode } from './strings';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

export function requiredUpperParam$(
  paramMap$: Observable<ParamMap>,
  key: string,
): Observable<string> {
  return paramMap$.pipe(
    map((p) => normalizeCountryCode(p.get(key))),
    filter(isNonEmptyString),
    distinctUntilChanged(),
  );
}

