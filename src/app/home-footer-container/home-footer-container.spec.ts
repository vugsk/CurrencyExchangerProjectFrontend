import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeFooterContainer } from './home-footer-container';

describe('HomeFooterContainer', () => {
  let component: HomeFooterContainer;
  let fixture: ComponentFixture<HomeFooterContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFooterContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeFooterContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
