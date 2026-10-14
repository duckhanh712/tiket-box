import { IsString } from 'class-validator';

export class CheckInDto {
  @IsString()
  ticketCode: string;
}

export interface CheckInPayload extends CheckInDto {
  staffId: string;
}
