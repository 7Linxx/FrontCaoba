import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthTarjeta } from './auth-tarjeta';

describe('AuthTarjeta', () => {
  let component: AuthTarjeta;
  let fixture: ComponentFixture<AuthTarjeta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthTarjeta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthTarjeta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
