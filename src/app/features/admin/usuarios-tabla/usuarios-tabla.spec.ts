import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosTabla } from './usuarios-tabla';

describe('UsuariosTabla', () => {
  let component: UsuariosTabla;
  let fixture: ComponentFixture<UsuariosTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosTabla]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosTabla);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
