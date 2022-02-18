import { Controller } from "../../../../../src/presentation/protocols/controller";
import { ChooseSeatController } from "../../../../../src/presentation/controllers/choose-seat/choose-seat-controller";
import { Validation } from "../../../../../src/presentation/protocols/validation";
import { badRequest, serverError } from "../../../../../src/presentation/protocols/http-helpers";
import { BookSeat } from "../../../../../src/application/usecases/book-seat/book-seat";
import { Reservation } from "../../../../../src/domain/entities/reservation";
import { Notifier } from "../../../../../src/application/contracts/notifier";

const makeSut = ({
  validate,
  book,
  publish
}:{
  validate?: Function,
  book?: Function,
  publish?: Function,
}): Controller => {
  const validation = {
    validate: validate ?? jest.fn().mockReturnValueOnce(null)
  } as unknown as Validation

  const bookSeat = {
    book: book ?? jest.fn().mockResolvedValueOnce(makeDefaultReservation())
  } as unknown as BookSeat

  const notifier = {
    publish: publish ?? jest.fn().mockResolvedValueOnce(true)
  } as unknown as Notifier
  
  return new ChooseSeatController(validation, bookSeat, notifier);
}

const makeDefaultRequest = (data?: object) => ({
  body: {
    sessionId: 'any_session_id',
    seatId: 'any_id',
    personId: 'any_person_id',
    ...data,
  }
});

const makeDefaultReservation = (data?: object): Reservation => {
  return {
    id: 'any_id',
    sessionId: 'any_session_id',
    seatId: 'any_seat_id',
    personId: 'any_person_id',
  }
}

describe('Unit', () => {
  describe('Presentation: Controllers', () => {
    describe('ChooseSeatController', () => {
      it('Should call validation with correct values', async () => {
        // Given
        const dependencies = { validate: jest.fn() };
        const chooseSeatController = makeSut(dependencies);
        const request = makeDefaultRequest();

        // When
        await chooseSeatController.handle(request);

        // Then
        expect(dependencies.validate).toHaveBeenCalledWith(request.body);
      });

      it("Should return 400 if Validation returns error", async () => {
        // Given
        const chooseSeatController = makeSut({ validate: jest.fn().mockReturnValueOnce(new Error()) });
        const request = makeDefaultRequest();

        // When
        const response = await chooseSeatController.handle(request);

        // Then
        expect(response).toStrictEqual(badRequest(new Error()));
      });

      it('Should call BookSeat with correct values', async () => {
        // Given
        const dependencies = { book: jest.fn() };
        const chooseSeatController = makeSut(dependencies);
        const request = makeDefaultRequest();

        // When
        await chooseSeatController.handle(request);

        // Then
        expect(dependencies.book).toHaveBeenCalledWith(request.body);
      });

      it("Should return 500 if throws an error", async () => {
        // Given
        const error = new Error();
        error.stack = 'any_stack';

        const dependencies = { 
          book: jest.fn().mockImplementationOnce(() => { throw error }) }
        const chooseSeatController = makeSut(dependencies);
        const request = makeDefaultRequest();

        // When
        const response = await chooseSeatController.handle(request);

        // Then
        expect(response).toStrictEqual(serverError(error))
      });

      it('Should call Notifier with correct values', async () => {
        // Given
        const dependencies = { publish: jest.fn() };
        const chooseSeatController = makeSut(dependencies);
        const request = makeDefaultRequest();
        const reservation = makeDefaultReservation();
        const queue = 'store_service';
        const message = JSON.stringify({
          reservationId: reservation.id,
          sessionId: reservation.sessionId,
          seatId: reservation.seatId,
          personId: reservation.personId,
          eventType: 'BOOKED_SEAT',
        });

        // When
        await chooseSeatController.handle(request);

        // Then
        expect(dependencies.publish).toHaveBeenCalledWith(queue, message);
      });
    });
  });
});