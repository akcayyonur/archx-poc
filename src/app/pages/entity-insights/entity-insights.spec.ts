import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityInsights } from './entity-insights';

describe('EntityInsights', () => {
  let component: EntityInsights;
  let fixture: ComponentFixture<EntityInsights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityInsights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityInsights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
