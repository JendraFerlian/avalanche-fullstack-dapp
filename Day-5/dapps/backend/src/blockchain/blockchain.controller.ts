import { Controller, Get, Post, Body } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { GetEventsDto } from './dto/get-events.dto';
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // GET /blockchain/value
  @Get('value')
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  // GET /blockchain/events
  @Get('events')
  @ApiConsumes('application/json') // ✅ INI KUNCINYA
  @ApiBody({ type: GetEventsDto })
  async getEvents(@Body() body: GetEventsDto) {
    return this.blockchainService.getValueUpdatedEvents(
      body.fromBlock,
      body.toBlock,
    );
  }
}
