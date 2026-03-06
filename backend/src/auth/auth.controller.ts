import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacService } from '../rbac/rbac.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private rbacService: RbacService,
    ) { }

    @Post('register')
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @ApiOperation({ summary: 'Login user' })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(loginDto);
        const { refreshToken, ...responseBody } = result;

        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return responseBody;
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({ schema: { type: 'object', properties: {} } }) // Empty body in Swagger
    async refresh(
        @Request() req,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token missing');
        }

        const result = await this.authService.refreshTokens(refreshToken);

        // Result from service contains { accessToken, refreshToken }
        // We only return accessToken in body. 
        // We could rotate refreshToken here too, but the contract says "Return only: { accessToken }"
        // And "Do NOT return refresh token again" in body. 
        // If we want rotation, we set cookie again.

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            accessToken: result.accessToken,
        };
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout user' })
    async logout(@Res({ passthrough: true }) res: Response) {
        // Since we don't have user context here without JwtAuthGuard, 
        // and logout might need to clear token from DB, 
        // we can either keep JwtAuthGuard or just clear the cookie.
        // The objective says: "res.clearCookie('refreshToken', { path: '/v1/auth/refresh' });"

        res.clearCookie('refreshToken', {
            path: '/',
        });

        return { message: 'Logged out' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.sub);
    }

    @Get('me/permissions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user permissions matrix' })
    async getPermissions(@Request() req) {
        const permissions = await this.rbacService.getUserPermissions(req.user.sub);
        return { permissions };
    }
}
