import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineSupport } from './online-support';

describe('OnlineSupport', () => {
  let component: OnlineSupport;
  let fixture: ComponentFixture<OnlineSupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineSupport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineSupport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
