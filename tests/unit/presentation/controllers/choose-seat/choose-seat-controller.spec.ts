import { Controller } from "../../../../../src/presentation/protocols/controller";
import { ChooseSeatController } from "../../../../../src/presentation/controllers/choose-seat/choose-seat-controller";
import { Validation } from "../../../../../src/presentation/protocols/validation";
import { badRequest } from "../../../../../src/presentation/protocols/http-helpers";
import { BookSeat } from "../../../../../src/application/usecases/book-seat/book-seat";

const makeSut = ({
  validate,
  book
}:{
  validate?: Function,
  book?: Function,
}): Controller => {
  const validation = {
    validate: validate ?? jest.fn().mockReturnValueOnce(null)
  } as unknown as Validation

  const bookSeat = {
    book: book ?? jest.fn().mockReturnValueOnce(null)
  } as unknown as BookSeat
  
  return new ChooseSeatController(validation, bookSeat);
}

const makeDefaultRequest = (data?: object) => ({
  body: {
    sessionId: 'any_session_id',
    seatId: 'any_id',
    personId: 'any_person_id',
    ...data,
  }
});

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
    });
  });
});