import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessOrderModalComponent } from './success-order-modal.component';

describe('SuccessOrderModalComponent', () => {
  let component: SuccessOrderModalComponent;
  let fixture: ComponentFixture<SuccessOrderModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessOrderModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
