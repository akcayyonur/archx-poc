import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnomalyInsights } from './anomaly-insights';

describe('AnomalyInsights', () => {
  let component: AnomalyInsights;
  let fixture: ComponentFixture<AnomalyInsights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnomalyInsights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnomalyInsights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
