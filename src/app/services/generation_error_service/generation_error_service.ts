import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerationErrorService implements OnInit, OnDestroy {
  constructor() {}

  private destroy$: Subject<void> = new Subject<void>();

  public get errorObject(): object {
    return {};
  }

  public ngOnInit(): void {

  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



}
