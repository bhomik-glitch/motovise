
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RbacService {
    constructor(private prisma: PrismaService) { }

    async getUserPermissions(userId: string): Promise<string[]> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                roleRef: {
                    select: {
                        permissions: {
                            select: {
                                permission: {
                                    select: {
                                        key: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user || !user.roleRef) {
            return [];
        }

        return user.roleRef.permissions.map((rp) => rp.permission.key);
    }

    async getRoleName(userId: string): Promise<string | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                roleRef: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return user?.roleRef?.name || null;
    }
}
