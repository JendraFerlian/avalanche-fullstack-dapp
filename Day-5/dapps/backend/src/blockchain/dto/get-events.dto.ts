import { ApiProperty } from '@nestjs/swagger';

export class GetEventsDto {
  @ApiProperty({
    example: 1000000,
    description: 'Start block number',
  })
  fromBlock: number;

  @ApiProperty({
    example: 1000100,
    description: 'End block number',
  })
  toBlock: number;
}
