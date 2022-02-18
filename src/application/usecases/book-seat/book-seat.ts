import { Reservation } from "../../../domain/entities/reservation";

export interface ReservationModel {
  sessionId: string;
  seatId: string;
  personId: string;
}

export interface BookSeat {
  book(reservation: ReservationModel): Promise<Reservation>; 
}