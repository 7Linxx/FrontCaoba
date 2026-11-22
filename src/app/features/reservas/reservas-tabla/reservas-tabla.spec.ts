import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasTablas } from './reservas-tabla';

describe('ReservasTablas', () => {
  let component: ReservasTablas;
  let fixture: ComponentFixture<ReservasTablas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasTablas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservasTablas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
