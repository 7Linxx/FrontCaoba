import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficaDona } from './grafica-dona';

describe('GraficaDona', () => {
  let component: GraficaDona;
  let fixture: ComponentFixture<GraficaDona>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficaDona]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficaDona);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
