import {
  input,
  effect,
  inject,
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  AfterViewInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { LeafletModule } from './leaflet-map.types';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-leaflet-map',
  styleUrl: './leaflet-map.component.scss',
  templateUrl: './leaflet-map.component.html',
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly title = input<string>('Map');
  readonly lat = input.required<number>();
  readonly lon = input.required<number>();
  readonly zoom = input<number>(5);

  @ViewChild('container', { static: true })
  private readonly container?: ElementRef<HTMLDivElement>;

  private leaflet: LeafletModule | null = null;
  private map: import('leaflet').Map | null = null;
  private marker: import('leaflet').CircleMarker | null = null;
  private tiles: import('leaflet').TileLayer | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const map = this.map;
      const marker = this.marker;
      if (!map || !marker) return;

      const lat = clampWebMercatorLat(this.lat());
      const lon = clampLon(this.lon());
      const zoom = this.zoom();

      marker.setLatLng([lat, lon]);
      map.setView([lat, lon], zoom, { animate: false });
    });
  }

  openLink(): string {
    const lat = this.lat();
    const lon = this.lon();
    const zoom = this.zoom();
    return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(
      lon,
    )}#map=${encodeURIComponent(zoom)}/${encodeURIComponent(lat)}/${encodeURIComponent(lon)}`;
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.container?.nativeElement) return;

    this.leaflet = await import('leaflet');

    const L = this.leaflet;
    const el = this.container.nativeElement;

    this.map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
    });

    this.tiles = this.createTilesLayer();
    this.tiles.options.attribution = '';

    this.tiles.addTo(this.map);

    this.marker = L.circleMarker([this.lat(), this.lon()], {
      radius: 7,
      weight: 2,
      color: '#2563eb',
      fillColor: '#60a5fa',
      fillOpacity: 0.8,
    }).addTo(this.map);

    const initialLat = clampWebMercatorLat(this.lat());
    const initialLon = clampLon(this.lon());

    this.marker.setLatLng([initialLat, initialLon]);
    this.map.setView([initialLat, initialLon], this.zoom());

    const recalc = () => {
      if (!this.map) return;
      const lat = clampWebMercatorLat(this.lat());
      const lon = clampLon(this.lon());
      const zoom = this.zoom();

      this.map.invalidateSize({ pan: false, animate: false });
      this.map.setView([lat, lon], zoom, { animate: false });
    };

    requestAnimationFrame(recalc);
    setTimeout(recalc, 150);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => recalc());
      this.resizeObserver.observe(el);
    }

    this.tiles?.on('load', () => recalc());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.tiles = null;
    this.map?.remove();
    this.map = null;
    this.marker = null;
  }

  private createTilesLayer(): import('leaflet').TileLayer {
    const L = this.leaflet!;
    return L.tileLayer(environment.map.osmTileUrl, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  }
}

function clampWebMercatorLat(lat: number): number {
  const MAX = 85.05112878;
  return Math.max(-MAX, Math.min(MAX, lat));
}

function clampLon(lon: number): number {
  return Math.max(-180, Math.min(180, lon));
}
