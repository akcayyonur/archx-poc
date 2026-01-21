import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewIntegration } from './new-integration';

describe('NewIntegration', () => {
  let component: NewIntegration;
  let fixture: ComponentFixture<NewIntegration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewIntegration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewIntegration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
