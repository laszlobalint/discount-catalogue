import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';

import { MapCoordinates } from '../_models/models';
declare var H: any;

@Component({
  selector: 'app-map',
  template: `
    <div class="map" #map>
      <p id="close-button" class="map-button" title="{{ 'map.close' | translate }}" (click)="onCloseMap()">
        X
      </p>
      <p id="center-button" class="map-button" title="{{ 'map.center' | translate }}" (click)="onCenterMap()">
        &#x2316;
      </p>
    </div>
  `,
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('map') public mapElement?: ElementRef;

  @Output() public mapVisibilityChange = new EventEmitter<boolean>();

  public _address?: string;
  set address(val: any) {
    this._address = val;
  }
  @Input() get address() {
    return this._address;
  }

  public _isMapDisplayed?: boolean;
  set isMapDisplayed(val: any) {
    this._isMapDisplayed = val;
  }
  @Input() get isMapDisplayed() {
    return this._isMapDisplayed;
  }

  public platform?: H.service.Platform;
  public map?: H.Map;
  public geocoder?: H.service.GeocodingService;
  public router?: any;
  public mapEvents?: H.mapevents.MapEvents;
  public behavior?: H.mapevents.Behavior;
  public ui?: H.ui.UI;
  public coordinates?: MapCoordinates;

  public ngOnInit(): void {
    this.platform = new H.service.Platform({
      app_id: 'wNtK9cEcbYg1qKuqpvdy',
      app_code: 't7A3pzNh5KnWvHQ4uMNyCA',
      useHTTPS: true,
    });
    this.geocoder = this.platform.getGeocodingService();
    this.router = this.platform.getRoutingService();
  }

  public ngAfterViewInit(): void {
    let pixelRatio = window.devicePixelRatio || 1;
    let defaultLayers: any = this.platform.createDefaultLayers({
      tileSize: pixelRatio === 1 ? 256 : 512,
      ppi: pixelRatio === 1 ? undefined : 320,
    });
    this.map = new H.Map(this.mapElement.nativeElement, defaultLayers.normal.map, { pixelRatio: pixelRatio });
    this.map.setCenter({ lat: 46.27176, lng: 20.14416 });
    this.map.setZoom(14);
    this.mapEvents = new H.mapevents.MapEvents(this.map);
    this.behavior = new H.mapevents.Behavior(this.mapEvents);
    this.ui = H.ui.UI.createDefault(this.map, defaultLayers);
    this.getCatalogueRoute();
  }

  public getCoordinates(address: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode(
        { searchText: address },
        (result) => {
          if (result.Response.View && result.Response.View.length > 0) {
            if (result.Response.View[0].Result.length > 0) {
              resolve(result.Response.View[0].Result);
            } else {
              reject({ message: 'No results found!' });
            }
          } else {
            reject({ message: 'No results found!' });
          }
        },
        (error: Error) => {
          reject(error);
        },
      );
    });
  }

  public getCatalogueRoute(): void {
    let params = {
      mode: 'fastest;pedestrian;traffic:enabled',
      range: '1000',
      rangetype: 'distance',
      departure: 'now',
    };
    this.map.removeObjects(this.map.getObjects());
    this.getCoordinates(this.address).then(
      (geocoderResult) => {
        params['start'] = geocoderResult[0].Location.DisplayPosition.Latitude + ',' + geocoderResult[0].Location.DisplayPosition.Longitude;
        this.router.calculateIsoline(
          params,
          (data: H.service.ServiceResult | any) => {
            if (data.response) {
              this.coordinates = {
                lat: data.response.center.latitude,
                lng: data.response.center.longitude,
              };
              this.map.setCenter(this.coordinates).setZoom(16);
              const marker = new H.map.DomMarker(this.coordinates);
              this.map.addObject(marker);
              this.createInfoBubble(this.coordinates);
            }
          },
          (error: Error) => {
            console.error(error);
          },
        );
      },
      (error: Error) => {
        console.error(error);
      },
    );
  }

  public createInfoBubble(coordinates: MapCoordinates): void {
    const bubble = new H.ui.InfoBubble(coordinates, {
      content: `<b>${this.address}</b>`,
    });
    this.ui.addBubble(bubble);
  }

  public onCenterMap(): void {
    this.map.setCenter(this.coordinates).setZoom(16);
  }

  public onCloseMap(): void {
    this.mapVisibilityChange.emit(false);
    this.coordinates = undefined;
  }
}
