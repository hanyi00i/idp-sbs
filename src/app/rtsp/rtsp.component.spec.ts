import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtspComponent } from './rtsp.component';

describe('RtspComponent', () => {
  let component: RtspComponent;
  let fixture: ComponentFixture<RtspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RtspComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RtspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
