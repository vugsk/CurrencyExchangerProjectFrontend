import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeHeaderContainer } from './home-header-container';

describe('HomeHeaderContainer', () => {
  let component: HomeHeaderContainer;
  let fixture: ComponentFixture<HomeHeaderContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeHeaderContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeHeaderContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
