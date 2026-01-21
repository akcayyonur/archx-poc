import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformSettings } from './platform-settings';

describe('PlatformSettings', () => {
  let component: PlatformSettings;
  let fixture: ComponentFixture<PlatformSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlatformSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
