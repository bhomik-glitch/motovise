import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createAddressDto: CreateAddressDto) {
        const { isDefault, ...addressData } = createAddressDto;

        // If this is set as default, unset previous default
        if (isDefault) {
            await this.prisma.address.updateMany({
                where: {
                    userId,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });
        }

        // If user has no addresses, make this one default
        const existingAddresses = await this.prisma.address.count({
            where: { userId },
        });

        const shouldBeDefault = isDefault || existingAddresses === 0;

        const address = await this.prisma.address.create({
            data: {
                user: { connect: { id: userId } },
                fullName: addressData.fullName,
                phone: addressData.phone ?? '',
                addressLine1: addressData.addressLine1,
                addressLine2: addressData.addressLine2,
                city: addressData.city,
                state: addressData.state,
                postalCode: addressData.postalCode,
                country: addressData.country ?? 'India',
                isDefault: shouldBeDefault,
            },
        });

        return address;
    }

    async findAll(userId: string) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [
                { isDefault: 'desc' }, // Default address first
                { createdAt: 'desc' },
            ],
        });
    }

    async findOne(userId: string, id: string) {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        // Ensure user can only access their own addresses
        if (address.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return address;
    }

    async update(userId: string, id: string, updateAddressDto: UpdateAddressDto) {
        // Verify ownership
        await this.findOne(userId, id);

        const { isDefault, ...addressData } = updateAddressDto;

        // If setting as default, unset previous default
        if (isDefault) {
            await this.prisma.address.updateMany({
                where: {
                    userId,
                    isDefault: true,
                    id: { not: id },
                },
                data: {
                    isDefault: false,
                },
            });
        }

        const address = await this.prisma.address.update({
            where: { id },
            data: {
                ...addressData,
                ...(isDefault !== undefined && { isDefault }),
            },
        });

        return address;
    }

    async remove(userId: string, id: string) {
        // Verify ownership
        const address = await this.findOne(userId, id);

        // If deleting default address, set another as default
        if (address.isDefault) {
            const otherAddress = await this.prisma.address.findFirst({
                where: {
                    userId,
                    id: { not: id },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            if (otherAddress) {
                await this.prisma.address.update({
                    where: { id: otherAddress.id },
                    data: { isDefault: true },
                });
            }
        }

        await this.prisma.address.delete({
            where: { id },
        });

        return { message: 'Address deleted successfully' };
    }

    async getDefault(userId: string) {
        const address = await this.prisma.address.findFirst({
            where: {
                userId,
                isDefault: true,
            },
        });

        if (!address) {
            throw new NotFoundException('No default address found');
        }

        return address;
    }
}
