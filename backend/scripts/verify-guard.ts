
import { PermissionsGuard } from '../src/rbac/guards/permissions.guard';
import { RbacService } from '../src/rbac/rbac.service'; // Adjust path
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

// Mock dependencies
class MockRbacService {
    async getUserPermissions(userId: string) { return []; }
    async getRoleName(userId: string) { return 'MockRole'; }
}

class MockReflector {
    getAllAndOverride() { return undefined; }
}

async function runTests() {
    console.log('Verifying PermissionsGuard Logic...');

    // Setup
    const rbacService = new MockRbacService() as unknown as RbacService;
    const reflector = new MockReflector() as unknown as Reflector;
    const guard = new PermissionsGuard(reflector, rbacService);

    const mockContext = {
        getHandler: () => { },
        getClass: () => { },
        switchToHttp: () => ({
            getRequest: () => ({
                user: { userId: 'test-user' }
            })
        })
    } as unknown as ExecutionContext;

    // Test 1: No permissions required -> Allow
    try {
        const result = await guard.canActivate(mockContext);
        console.log('[PASS] No permissions required -> Allowed');
    } catch (e: any) {
        console.error('[FAIL] No permissions required -> Denied', e);
    }

    // Test 2: Required permissions present -> Allow
    reflector.getAllAndOverride = () => ['perm.A'];
    rbacService.getUserPermissions = async () => ['perm.A', 'perm.B'];

    try {
        const result = await guard.canActivate(mockContext);
        console.log('[PASS] Permissions present -> Allowed');
    } catch (e: any) {
        console.error('[FAIL] Permissions present -> Denied', e);
    }

    // Test 3: Required permissions missing -> Deny
    reflector.getAllAndOverride = () => ['perm.C']; // User has A, B

    try {
        await guard.canActivate(mockContext);
        console.error('[FAIL] Permissions missing -> Allowed (Should Deny)');
    } catch (e: any) {
        if (e instanceof ForbiddenException) {
            console.log('[PASS] Permissions missing -> Denied (ForbiddenException)');
        } else {
            console.error('[FAIL] Permissions missing -> Denied (Wrong Error)', e);
        }
    }

    // Test 4: Context Attachment
    reflector.getAllAndOverride = () => ['perm.A'];
    const request: Record<string, any> = {};
    const contextWithRequest = {
        getHandler: () => { },
        getClass: () => { },
        switchToHttp: () => ({
            getRequest: () => {
                request['user'] = { userId: '123' };
                return request;
            }
        })
    } as unknown as ExecutionContext;

    await guard.canActivate(contextWithRequest);
    console.log('[INFO] Audit Context:', request['auditContext']);
    if (request['auditContext'] && request['auditContext'].role === 'MockRole') {
        console.log('[PASS] Audit Context attached');
    } else {
        console.error('[FAIL] Audit Context missing or incorrect');
    }

}

runTests().catch(console.error);
