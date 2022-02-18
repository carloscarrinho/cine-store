import { BookSeat } from "../../../application/usecases/book-seat/book-seat";
import { Controller } from "../../protocols/controller";
import { badRequest } from "../../protocols/http-helpers";
import { HttpRequest } from "../../protocols/http-request";
import { HttpResponse } from "../../protocols/http-response";
import { Validation } from "../../protocols/validation";

export class ChooseSeatController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly bookSeat: BookSeat,
  ) {}
  
  async handle (request: HttpRequest): Promise<HttpResponse> {
    const error = this.validation.validate(request.body);
    if (error) return badRequest(error);

    try {
      await this.bookSeat.book(request.body);
      
      return null;
    } catch (error) {
      return null
    }
    
  }
}