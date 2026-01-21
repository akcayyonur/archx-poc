import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigNavbar } from './config-navbar';

describe('ConfigNavbar', () => {
  let component: ConfigNavbar;
  let fixture: ComponentFixture<ConfigNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
