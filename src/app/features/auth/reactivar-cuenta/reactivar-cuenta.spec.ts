import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactivarCuenta } from './reactivar-cuenta';

describe('ReactivarCuenta', () => {
  let component: ReactivarCuenta;
  let fixture: ComponentFixture<ReactivarCuenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactivarCuenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactivarCuenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
