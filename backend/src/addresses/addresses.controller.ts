import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @Post()
    @ApiOperation({ summary: 'Create new address' })
    create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
        return this.addressesService.create(req.user.sub, createAddressDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user addresses' })
    findAll(@Request() req) {
        return this.addressesService.findAll(req.user.sub);
    }

    @Get('default')
    @ApiOperation({ summary: 'Get default address' })
    getDefault(@Request() req) {
        return this.addressesService.getDefault(req.user.sub);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get address by ID' })
    findOne(@Request() req, @Param('id') id: string) {
        return this.addressesService.findOne(req.user.sub, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update address' })
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateAddressDto: UpdateAddressDto,
    ) {
        return this.addressesService.update(req.user.sub, id, updateAddressDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete address' })
    remove(@Request() req, @Param('id') id: string) {
        return this.addressesService.remove(req.user.sub, id);
    }
}
