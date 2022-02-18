import { Controller } from "../../../../../src/presentation/protocols/controller";
import { ChooseSeatController } from "../../../../../src/presentation/controllers/choose-seat/choose-seat-controller";
import { Validation } from "../../../../../src/presentation/protocols/validation";
import { badRequest } from "../../../../../src/presentation/protocols/http-helpers";

const makeSut = ({
  validate
}:{
  validate?: Function,
}): Controller => {
  const validation = {
    validate: validate ?? jest.fn().mockReturnValueOnce(null)
  } as unknown as Validation
  
  return new ChooseSeatController(validation);
}

const makeDefaultRequest = (data?: object) => ({
  body: {
    seatId: 'any_id',
    roomId: 'any_room_id',
    time: 'any_time',
    date: 'any_date',
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
    });
  });
});