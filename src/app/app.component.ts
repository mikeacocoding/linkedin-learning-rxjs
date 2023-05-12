import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Subject,
  BehaviorSubject,
  ReplaySubject,
  interval,
  take,
  map,
  filter,
  of,
  mergeMap,
  switchMap,
  fromEvent,
  debounceTime,
  Observable,
  distinctUntilChanged,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'rxjs';
  mySubject$ = new Subject();
  myBehaviorSubject$ = new BehaviorSubject(200);
  myReplaySubject$ = new ReplaySubject();
  searchString!: string;

  //This observable subject listens to changes on the searchEvent
  searchSubject$ = new Subject<string>();
  //This observable stores the result with the help of searchSubject$
  results$ = new Observable<any>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.runExcersiceOne();
    this.setOnClickObserable();

    //Every time the search subject updates it applys debounce, distinctUntilChanged, logs the data, and uses SwitchMap to avoid unnecesary calls to the server.
    this.results$ = this.searchSubject$.pipe(
      //Using operator debounceTime to retrieve the value only after 200 second without interaction.
      debounceTime(200),
      distinctUntilChanged(),
      tap((x) => console.log('tap', x)),
      switchMap((searchString) => this.queryApi(searchString))
    );
  }

  runExcersiceOne() {
    this.resetAll();

    /**
     * When the 2 subscription happens, the 2 subscribe looses the data,
     * because it is not aware of the last values, only got notified with the last next(3);
     */
    console.log('Excersice with Subject observable');
    console.log('Declaring First subscribe');
    this.mySubject$.subscribe((x) => console.log('First subscribe', x));
    this.mySubject$.next(1);
    this.mySubject$.next(2);

    console.log('Declaring Second subscribe');
    this.mySubject$.subscribe((x) => console.log('Second subscribe', x));
    this.mySubject$.next(3);
  }

  runExcersiceTwo() {
    this.resetAll();

    /**
     *
     * BehaviorSubject works the same as Subject, the difference is that BehaviorSubject stores the last value and shares it in every new suscription
     *
     * When the 2 subscription happens, the 2 subscribe looses the data,
     * because it is not aware of the last values, only got notified with the last next(3);
     *
     * we can use a behavior subject to get notified with the latest data
     */

    console.log('Excersice with BehaviorSubject observable');
    console.log('Declaring First subscribe');
    this.myBehaviorSubject$.subscribe((x) => console.log('First subscribe', x));
    this.myBehaviorSubject$.next(1);
    this.myBehaviorSubject$.next(2);

    console.log('Declaring Second subscribe');
    //Here and before the next(3) line is executed and due to we are using behaviorSubject our Second suscribe got notified
    //with the latest value wich is 2 (line 50)
    this.myBehaviorSubject$.subscribe((x) =>
      console.log('Second subscribe', x)
    );
    this.myBehaviorSubject$.next(3);
    console.log('Declaring third subscribe'); // Should log 'Third subscribe 3'
    this.myBehaviorSubject$.subscribe((x) => console.log('Third subscribe', x));
  }

  runExcersiceThree() {
    this.resetAll();

    /**
     *  As we saw in excercise 3, BehaviorSubject only stores the latest value, but what if we want all the values?,
     * for this case we can use a ReplaySubject.
     */
    console.log('Excersice with ReplaySubject observable');
    console.log('Declaring First subscribe');
    this.myReplaySubject$.subscribe((x) => console.log('First subscribe', x));
    this.myReplaySubject$.next(1);
    this.myReplaySubject$.next(2);

    console.log('Declaring Second subscribe');
    //Here and before the next(3) line is executed and due to we are using behaviorSubject our Second suscribe got notified
    //with the latest value wich is 2 (line 50)
    this.myReplaySubject$.subscribe((x) => console.log('Second subscribe', x));
    this.myReplaySubject$.next(3);
  }

  runExcersiceFour() {
    this.resetAll();

    //** OPERATORS **//
    /**
     *  So operators can help us to do something with the data passing through "pipes"
     *  for example interval give us an observable that emmits an event every 1000ms in this case
     *
     *  the values pass through the operators:
     * take(5)     ==> only takes the first 5 elements of the stream
     * filter(...) ==> from the previuos 5 values, it filters the items with the logic provided.
     * map(...) ==> after the data passed through take(5) and filter(...) map takes the result and transforms the value.
     */
    console.log('** Operators **');
    const numbers$ = interval(1000);

    numbers$
      .pipe(
        take(5),
        filter((val) => val % 2 === 0),
        map((val) => val * 10)
      )
      .subscribe((x) => console.log(x));
  }

  runExcersiceFive() {
    this.resetAll();

    //** OPERATOR mergeMap **//
    // See to understand mejor: https://www.youtube.com/watch?v=qYdKmYp95Jg
    console.log('** Operator mergeMap **');
    const numbers$ = interval(1000);
    const letters$ = of('a', 'b', 'c', 'd', 'e');

    letters$
      .pipe(
        mergeMap((x) =>
          numbers$.pipe(
            take(5),
            map((i) => i + x)
          )
        )
      )
      .subscribe((x) => console.log(x));
  }

  runExcersiceSix() {
    this.resetAll();

    //** OPERATOR switchMap **//
    // Switch map stores only the latest execution in difference to mergeMap
    // where we had a, b, c, d and e values, now we are going to see
    // only the 'e' result

    /*
      Example of real life could be:
      Imagine that we have a searchInput, and everytime the user writes we go to the database and query,
      but then the user writes again while the previous query is still in progress, switchMap is better
      for this case because it will cancel the previous query and mantain the latest.
    */
    console.log('** Operator switchMap **');
    const numbers$ = interval(1000);
    const letters$ = of('a', 'b', 'c', 'd', 'e');

    letters$
      .pipe(
        switchMap((x) =>
          numbers$.pipe(
            take(5),
            map((i) => i + x)
          )
        )
      )
      .subscribe((x) => console.log(x));
  }

  setOnClickObserable() {
    //This is how to create an observable from a dom event
    const clics$ = fromEvent(document, 'click');
    clics$.subscribe((v) => console.log(v));
  }

  ngOnDestroy() {
    this.mySubject$.unsubscribe();
    this.myBehaviorSubject$.unsubscribe();
    this.myReplaySubject$.unsubscribe();
  }

  inputChanged($event: any) {
    //Excersice with debounced observer.
    console.log('input changed', $event.target.value);
    this.searchSubject$.next($event.target.value);
  }

  onClear() {
    this.searchString = '';
    this.searchSubject$.next('');
  }

  queryApi(searchString: string) {
    console.log('queryAPI', searchString);
    return this.http
      .get(`https://www.reddit.com/r/aww/search.json?q=${searchString}`)
      .pipe(map((result: any) => result['data']['children']));
  }

  private resetAll() {
    console.clear();
    this.mySubject$ = new Subject();
    this.myBehaviorSubject$ = new BehaviorSubject(200);
    this.myReplaySubject$ = new ReplaySubject();
  }
}
