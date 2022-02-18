import { Notifier } from "../../../application/contracts/notifier";
import { BookSeat } from "../../../application/usecases/book-seat/book-seat";
import { Controller } from "../../protocols/controller";
import { badRequest, serverError } from "../../protocols/http-helpers";
import { HttpRequest } from "../../protocols/http-request";
import { HttpResponse } from "../../protocols/http-response";
import { Validation } from "../../protocols/validation";

export class ChooseSeatController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly bookSeat: BookSeat,
    private readonly notifier: Notifier,
  ) {}
  
  async handle (request: HttpRequest): Promise<HttpResponse> {
    const error = this.validation.validate(request.body);
    if (error) return badRequest(error);

    try {
      const reservation = await this.bookSeat.book(request.body);
      
      await this.notifier.publish('store_service', JSON.stringify({
        reservationId: reservation.id,
        sessionId: reservation.sessionId,
        seatId: reservation.seatId,
        personId: reservation.personId,
        eventType: 'BOOKED_SEAT'
      }));

      return null;
    } catch (error) {
      return serverError(error);
    }
  }
}