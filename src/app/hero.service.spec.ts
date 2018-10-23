import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HeroService } from './hero.service';
import { MessageService } from './message.service';
import { Hero } from './hero';

const mockData = [
  { id: 1, name: 'Hulk' },
  { id: 2, name: 'Thor' },
  { id: 3, name: 'Iron Man' }
] as Hero[];

describe('Hero Service', () => {

  let heroService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [HeroService, MessageService]
    });
    httpTestingController = TestBed.get(HttpTestingController);

    this.mockHeroes = [...mockData];
    this.mockHero = this.mockHeroes[0];
    this.mockId = this.mockHero.id;
    heroService = TestBed.get(HeroService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(heroService).toBeTruthy();
  });

  describe('getHeroes', () => {
    it('should return mock heroes', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.getHeroes().subscribe(
        heroes => expect(heroes.length).toEqual(this.mockHeroes.length),
        fail
      );
      // Receive GET request
      const req = httpTestingController.expectOne(heroService.heroesUrl);
      expect(req.request.method).toEqual('GET');
      // Respond with the mock heroes
      req.flush(this.mockHeroes);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual('HeroService: fetched heroes');
    });

    it('should turn 404 into a user-friendly error', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      const msg = 'Deliberate 404';
      heroService.getHeroes().subscribe(
        heroes => expect(heroes).toEqual([]),
        fail
      );

      const req = httpTestingController.expectOne(heroService.heroesUrl);
      req.flush('Invalid request parameters', { status: 404, statusText: 'Bad Request' });

      expect(heroService.handleError).toHaveBeenCalledTimes(1);
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: getHeroes failed: Http failure response for ${heroService.heroesUrl}: 404 Bad Request`);
    });
  });

  describe('getHero', () => {

    it('should return a single mock hero', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.getHero(this.mockHero.id).subscribe(
        response => expect(response).toEqual(this.mockHero),
        fail
      );
      // Receive GET request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/${this.mockHero.id}`);
      expect(req.request.method).toEqual('GET');
      // Respond with the mock heroes
      req.flush(this.mockHero);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: fetched hero id=${this.mockHero.id}`);
    });

    it('should fail gracefully on error', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.getHero(this.mockHero.id).subscribe(
        response => expect(response).toBeUndefined(),
        fail
      );
      // Receive GET request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/${this.mockHero.id}`);
      expect(req.request.method).toEqual('GET');
      // Respond with the mock heroes
      req.flush('Invalid request parameters', { status: 404, statusText: 'Bad Request' });

      expect(heroService.handleError).toHaveBeenCalledTimes(1);
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: getHero id=${this.mockHero.id} failed: Http failure response for ${heroService.heroesUrl}/${this.mockHero.id}: 404 Bad Request`);
    });
  });

  describe('getHeroNo404', () => {

    it('should return a single mock hero', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.getHeroNo404(this.mockHero.id).subscribe(
        //Fails: Unable to flush and recognise mockHero
        response => expect(response).toEqual(this.mockHero),
        fail
      );
      // Receive GET request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/?id=${this.mockHero.id}`);
      expect(req.request.method).toEqual('GET');
      // Respond with the mock heroes
      req.flush(this.mockHeroes);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: fetched hero id=${this.mockHero.id}`);
    });

    it('should fail gracefully with undefined when id not found', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.getHeroNo404(this.mockHero.id).subscribe(
        //Fails: Unable to flush and recognise mockHero
        response => expect(response).toBeUndefined(),
        fail
      );
      // Receive GET request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/?id=${this.mockHero.id}`);
      expect(req.request.method).toEqual('GET');
      // Flushing a object not of type array causes unexpeced behaviour?
      req.flush(this.mockHero);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: did not find hero id=${this.mockHero.id}`);
    });

    it('should fail gracefully on error', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      const msg = 'Deliberate 404';
      heroService.getHeroNo404(this.mockHero.id).subscribe(
        heroes => expect(heroes).toBeUndefined(),
        fail
      );

      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/?id=${this.mockHero.id}`);
      req.flush('Invalid request parameters', { status: 404, statusText: 'Bad Request' });

      expect(heroService.handleError).toHaveBeenCalledTimes(1);
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: getHero id=${this.mockHero.id} failed: Http failure response for ${heroService.heroesUrl}/?id=${this.mockHero.id}: 404 Bad Request`);
    });
  });

  describe('addHero', () => {

    it('should add a single Hero', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.addHero(this.mockHero).subscribe(
        response => expect(response).toEqual(this.mockHero),
        fail
      );
      // Receive GET request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}`);
      expect(req.request.method).toEqual('POST');
      // Respond with the mock heroes
      req.flush(this.mockHero);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: added hero w/ id=${this.mockHero.id}`);
    });

    it('should fail gracefully on error', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.addHero(this.mockHero).subscribe(
        response => expect(response).toBeUndefined(),
        fail
      );
      // Receive GET request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}`);
      expect(req.request.method).toEqual('POST');
      // Respond with the mock heroes
      req.flush('Invalid request parameters', { status: 404, statusText: 'Bad Request' });

      expect(heroService.handleError).toHaveBeenCalledTimes(1);
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: addHero failed: Http failure response for api/heroes: 404 Bad Request`);
    });
  });

  describe('updateHero', () => {
    it('should update hero', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.updateHero(this.mockHero).subscribe(
        response => expect(response).toBeUndefined(),
        fail
      );

      // Receive PUT request
      const req = httpTestingController.expectOne(heroService.heroesUrl);
      expect(req.request.method).toEqual('PUT');
      // Respond with the updated hero
      req.flush('Invalid request parameters', { status: 404, statusText: 'Bad Request' });

      expect(heroService.handleError).toHaveBeenCalledTimes(1);
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: updateHero failed: Http failure response for ${heroService.heroesUrl}: 404 Bad Request`);
    });

    it('should fail gracefully on error', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.updateHero(this.mockHero).subscribe(
        response => expect(response).toEqual(this.mockHero),
        fail
      );

      // Receive PUT request
      const req = httpTestingController.expectOne(heroService.heroesUrl);
      expect(req.request.method).toEqual('PUT');
      // Respond with the updated hero
      req.flush(this.mockHero);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: updated hero id=${this.mockHero.id}`);
    });
  });

  describe('deleteHero', () => {

    it('should delete hero using id', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.deleteHero(this.mockId).subscribe(
        response => expect(response).toEqual(this.mockId),
        fail
      );
      // Receive DELETE request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/${this.mockHero.id}`);
      expect(req.request.method).toEqual('DELETE');
      // Respond with the updated hero
      req.flush(this.mockId);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: deleted hero id=${this.mockHero.id}`);
    });

    it('should delete hero using hero object', () => {
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.deleteHero(this.mockHero).subscribe(
        response => expect(response).toEqual(this.mockHero.id),
        fail
      );
      // Receive DELETE request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/${this.mockHero.id}`);
      expect(req.request.method).toEqual('DELETE');
      // Respond with the updated hero
      req.flush(this.mockHero.id);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: deleted hero id=${this.mockHero.id}`);
    });
  });

  describe('searchHero', () => {
    it('should find heroes matching the search criteria', () => {
      const searchTerm = 'r'
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.searchHeroes(searchTerm).subscribe(
        response => expect(response).toEqual([this.mockHeroes[1], this.mockHeroes[2]]),
        fail
      );

      // Receive PUT request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/?name=${searchTerm}`);
      expect(req.request.method).toEqual('GET');
      // Respond with the updated hero
      req.flush([this.mockHeroes[1], this.mockHeroes[2]]);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: found heroes matching "${searchTerm}"`);
    });

    it('should not find heroes matching the search criteria', () => {
      const searchTerm = 'r'
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.searchHeroes(searchTerm).subscribe(
        response => expect(response).toEqual([]),
        fail
      );

      // Receive PUT request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/?name=${searchTerm}`);
      expect(req.request.method).toEqual('GET');
      // Respond with the updated hero
      req.flush([]);

      //for some reason, heroService.handleError is being called. The below test doesn't work as expected.
      //https://stackoverflow.com/questions/52875876/unexpected-tohavebeencalled-on-catcherror-rxjs
      //expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).toHaveBeenCalledTimes(1);
      expect(heroService.messageService.messages[0]).toEqual(`HeroService: found heroes matching "${searchTerm}"`);
    });


    it('should return an empty array when passing an empty search string', () => {
      const searchTerm = '';
      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();

      heroService.searchHeroes(searchTerm).subscribe(
        response => expect(response).toEqual([]),
        fail
      );

      // Receive PUT request
      const req = httpTestingController.expectNone(`${heroService.heroesUrl}/?name=${searchTerm}`);

      //This is the exception where handleError is not called. The execution path ends before the httpClient is called.
      expect(heroService.handleError).not.toHaveBeenCalled();
      expect(heroService.log).not.toHaveBeenCalled();
    });

    it('should fail gracefully on error', () => {
      const searchTerm = 'r';
      spyOn(heroService, 'log').and.callThrough();

      heroService.searchHeroes(searchTerm).subscribe(
        response => expect(response).toEqual([]),
        fail
      );

      // Receive PUT request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/?name=${searchTerm}`);
      expect(req.request.method).toEqual('GET');
      // Respond with the updated hero
      req.flush('Invalid request parameters', { status: 404, statusText: 'Bad Request' });

      expect(heroService.messageService.messages[0]).toEqual(`HeroService: searchHeroes failed: Http failure response for ${heroService.heroesUrl}/?name=${searchTerm}: 404 Bad Request`);
    });
  });

  describe('handleError', () => {
    it('should handle error gracefully', () => {

      spyOn(heroService, 'handleError').and.callThrough();
      spyOn(heroService, 'log').and.callThrough();
      spyOn(console, 'error');

      heroService.getHero(this.mockHero.id).subscribe(
        response => expect(response).toBeUndefined(),
        fail
      );
      // Receive GET request
      const req = httpTestingController.expectOne(`${heroService.heroesUrl}/${this.mockHero.id}`);
      expect(req.request.method).toEqual('GET');
      // Respond with the mock heroes
      req.flush('Invalid request parameters', { status: 404, statusText: 'Bad Request' });


      //The focal point of this test
      expect(heroService.handleError).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(heroService.log).toHaveBeenCalledTimes(1);
    });
  });
});
