import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Paho } from 'ng2-mqtt/mqttws31';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  mqtt!: Paho.MQTT.Client;
  reconnectTimeout = 2000;
  host = 'test.mosquitto.org';
  port = 8081;

  bslat = 2.314633;
  bslng = 102.3187711;

  constructor() {
    this.connectMQTT();
  }

  title = 'angular-google-map-app';

  @ViewChild('myGoogleMap', { static: false })
  map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false })
  info!: MapInfoWindow;

  zoom = 12;
  maxZoom = 20;
  minZoom = 8;
  center!: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    mapTypeId: 'hybrid',
    maxZoom: this.maxZoom,
    minZoom: this.minZoom,
  };

  markers = [] as any;
  infoContent = '';
  infoImage = '';

  markerData = [
    {
      lat: 0,
      lng: 0,
      title: 'Bus Sample',
      info: '',
      options: {
        icon: {
          url: '',
          scaledSize: {
            width: 30,
            height: 30,
          },
        },
      },
    },
  ];

  connectMQTT() {
    console.log('Connecting to ' + this.host + ' ' + this.port);
    this.mqtt = new Paho.MQTT.Client(this.host, this.port, 'gps-mqtt-1');
    const options = {
      useSSL: true,
      timeout: 3,
      onSuccess: this.onConnect.bind(this),
      onFailure: this.onFailure.bind(this),
    };
    this.mqtt.onMessageArrived = this.onMessageArrived.bind(this);
    this.mqtt.connect(options);
  }

  onConnect() {
    this.mqtt.subscribe('gps-idp', {});
  }

  onMessageArrived(message: Paho.MQTT.Message) {
    console.log(message.payloadString);
    const latitude = Number(message.payloadString.split(',')[0]);
    const longitude = Number(message.payloadString.split(',')[1]);
    const clientid = Number(message.payloadString.split(',')[2].split('-')[2]);
    // Call the updateMarkerCoordinates function and pass the latitude and longitude as arguments
    this.updateMarkerCoordinates(latitude, longitude, clientid);
  }

  onFailure() {
    console.log('Failed');
    setTimeout(this.connectMQTT.bind(this), this.reconnectTimeout);
  }

  distance: string = "THERE IS NO BUS NEARBY THE BUS STOP";
  conditionr: boolean = true;
  conditiong: boolean = false;
  updateMarkerCoordinates(
    latitude: number,
    longitude: number,
    clientid: number
  ) {
    // Iterate over the markerData array and update the specific marker
    // console.log(this.markerData[0]);
    // check if markerData[clientid] is undefined, if it is then create a new object with previous object data
    this.markerData[clientid] = {
      lat: 0,
      lng: 0,
      title: 'Bus ' + clientid,
      info: '',
      options: {
        icon: {
          url: 'data:image/svg+xml;utf8,<svg style="color: white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 18H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1a2 2 0 0 1-2-2V2c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zM4 5v6h5V5H4zm7 0v6h5V5h-5zM5 2v1h10V2H5zm.5 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="white"></path></svg>',
          scaledSize: {
            width: 30,
            height: 30,
          },
        },
      },
    };
    // Update the coordinates for the specific marker
    this.markerData[clientid].lat = latitude;
    this.markerData[clientid].lng = longitude;
    // Call the function to redraw the markers
    this.redrawMarkers();

    // Calculate Distance
    var lat1Rad = (this.bslat * Math.PI) / 180;
    var lon1Rad = (this.bslng * Math.PI) / 180;
    var lat2Rad = (latitude * Math.PI) / 180;
    var lon2Rad = (longitude * Math.PI) / 180;
  
    // Haversine formula
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c; // Earth's radius in kilometers
    // Convert distance to meters
    const distanceMeters = distance * 1000;
    console.log(distanceMeters,"meters")
    if (distanceMeters < 2) {
      this.distance = "THERE IS BUS " + clientid + " NEARBY THE BUS STOP";
      this.conditionr = false;
      this.conditiong = true;
    } else {
      this.distance = "THERE IS NO BUS NEARBY THE BUS STOP";
      this.conditiong = false;
      this.conditionr = true;
    }
  }


  ngOnInit() {
    // Add markers to the map based on the retrieved marker data
    navigator.geolocation.getCurrentPosition((position) => {
      //this.bslat = position.coords.latitude;
      //this.bslng = position.coords.longitude;
      this.center = {
        // coordinates of bus stop
        //lat: position.coords.latitude,
        //lng: position.coords.longitude,
        lat: this.bslat,
        lng: this.bslng,
      };

      this.markers.push({
        position: {
          lat: this.bslat,
          lng: this.bslng,
        },
        title: 'Bus Stop',
      });
    });
  }

  redrawMarkers() {
    this.markers.splice(1);
    this.markerData.forEach((marker) => {
      this.markers.push({
        position: {
          lat: marker.lat,
          lng: marker.lng,
        },
        // label: marker.label,
        title: marker.title,
        info: marker.info,
        options: marker.options,
      });
    });
  }

  zoomIn() {
    if (this.zoom < this.maxZoom) this.zoom++;
    console.log('Get Zoom');
  }

  zoomOut() {
    if (this.zoom > this.minZoom) this.zoom--;
  }

  eventHandler(event: any, name: string) {
    this.distance = "THERE IS NO BUS NEARBY THE BUS STOP";
    this.conditiong = false;
    this.conditionr = true;
    // Add marker on double click event
    if (name === 'mapDblclick') {
      this.dropMarker(event);
    }
  }

  dropMarker(event: any) {
    this.markers.push({
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },

      label: {
        color: 'cyan',
        text: 'Marker label ' + (this.markers.length + 1),
      },
      title: 'Marker title ' + (this.markers.length + 1),
      info: 'Marker info ' + (this.markers.length + 1),
      options: {
        animation: google.maps.Animation.DROP,
      },
    });
  }

  openInfo(marker: MapMarker, content: string, image: string) {
    this.infoContent = content;
    this.infoImage = image;
    this.info.open(marker);
  }

}

