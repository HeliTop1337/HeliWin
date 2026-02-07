/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./backend/admin/admin.controller.ts":
/*!*******************************************!*\
  !*** ./backend/admin/admin.controller.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const multer_1 = __webpack_require__(/*! multer */ "multer");
const path_1 = __webpack_require__(/*! path */ "path");
const admin_service_1 = __webpack_require__(/*! ./admin.service */ "./backend/admin/admin.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
const roles_guard_1 = __webpack_require__(/*! ../auth/guards/roles.guard */ "./backend/auth/guards/roles.guard.ts");
const roles_decorator_1 = __webpack_require__(/*! ../auth/decorators/roles.decorator */ "./backend/auth/decorators/roles.decorator.ts");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getAllUsers(page, limit) {
        return this.adminService.getAllUsers(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    updateUserBalance(userId, amount, reason, req) {
        return this.adminService.adjustBalance(userId, amount, reason || 'Корректировка администратором', req.user.id);
    }
    banUser(userId, reason, req) {
        return this.adminService.banUser(userId, reason, req.user.id);
    }
    unbanUser(userId, req) {
        return this.adminService.unbanUser(userId, req.user.id);
    }
    getAllItems() {
        return this.adminService.getAllItems();
    }
    createItem(data, file, req) {
        let iconUrl = data.icon || '';
        if (file) {
            iconUrl = `/uploads/items/${file.filename}`;
        }
        const createData = {
            name: data.name,
            category: data.category,
            rarity: data.rarity,
            basePrice: parseFloat(data.basePrice),
            icon: iconUrl,
        };
        return this.adminService.createItem(createData, req.user.id);
    }
    updateItem(itemId, data, file, req) {
        let iconUrl = data.icon || undefined;
        if (file) {
            iconUrl = `/uploads/items/${file.filename}`;
        }
        const updateData = {
            name: data.name,
            category: data.category,
            rarity: data.rarity,
            basePrice: data.basePrice ? parseFloat(data.basePrice) : undefined,
            icon: iconUrl,
        };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        return this.adminService.updateItem(itemId, updateData, req.user.id);
    }
    deleteItem(itemId, req) {
        return this.adminService.deleteItem(itemId, req.user.id);
    }
    getAllCases() {
        return this.adminService.getAllCases();
    }
    updateCase(caseId, updateData, req) {
        return this.adminService.updateCase(caseId, updateData, req.user.id);
    }
    getAllPromoCodes() {
        return this.adminService.getAllPromoCodes();
    }
    createPromoCode(data, req) {
        return this.adminService.createPromoCode(data, req.user.id);
    }
    deletePromoCode(id, req) {
        return this.adminService.deletePromoCode(id, req.user.id);
    }
    getStats() {
        return this.adminService.getStats();
    }
    getLogs(limit) {
        return this.adminService.getLogs(limit ? parseInt(limit) : 100);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)('users/:id/balance'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('reason')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserBalance", null);
__decorate([
    (0, common_1.Post)('users/:id/ban'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "banUser", null);
__decorate([
    (0, common_1.Post)('users/:id/unban'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "unbanUser", null);
__decorate([
    (0, common_1.Get)('items'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllItems", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('icon', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/items',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('items/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('icon', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/items',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_e = typeof Express !== "undefined" && (_d = Express.Multer) !== void 0 && _d.File) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Get)('cases'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllCases", null);
__decorate([
    (0, common_1.Patch)('cases/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCase", null);
__decorate([
    (0, common_1.Get)('promo-codes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllPromoCodes", null);
__decorate([
    (0, common_1.Post)('promo-codes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createPromoCode", null);
__decorate([
    (0, common_1.Delete)('promo-codes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deletePromoCode", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getLogs", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:paramtypes", [typeof (_a = typeof admin_service_1.AdminService !== "undefined" && admin_service_1.AdminService) === "function" ? _a : Object])
], AdminController);


/***/ }),

/***/ "./backend/admin/admin.module.ts":
/*!***************************************!*\
  !*** ./backend/admin/admin.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const admin_service_1 = __webpack_require__(/*! ./admin.service */ "./backend/admin/admin.service.ts");
const admin_controller_1 = __webpack_require__(/*! ./admin.controller */ "./backend/admin/admin.controller.ts");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        providers: [admin_service_1.AdminService],
        controllers: [admin_controller_1.AdminController],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);


/***/ }),

/***/ "./backend/admin/admin.service.ts":
/*!****************************************!*\
  !*** ./backend/admin/admin.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCase(data, adminId) {
        const caseData = await this.prisma.case.create({ data });
        await this.logAction(adminId, 'CREATE_CASE', 'Case', caseData.id);
        return caseData;
    }
    async updateCase(id, data, adminId) {
        const caseData = await this.prisma.case.update({ where: { id }, data });
        await this.logAction(adminId, 'UPDATE_CASE', 'Case', id);
        return caseData;
    }
    async deleteCase(id, adminId) {
        await this.prisma.case.delete({ where: { id } });
        await this.logAction(adminId, 'DELETE_CASE', 'Case', id);
        return { message: 'Кейс удален' };
    }
    async getAllCases() {
        return this.prisma.case.findMany({
            include: {
                items: {
                    include: { item: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createItem(data, adminId) {
        const item = await this.prisma.item.create({ data });
        await this.logAction(adminId, 'CREATE_ITEM', 'Item', item.id);
        return item;
    }
    async updateItem(id, data, adminId) {
        const item = await this.prisma.item.update({ where: { id }, data });
        await this.logAction(adminId, 'UPDATE_ITEM', 'Item', id);
        return item;
    }
    async deleteItem(id, adminId) {
        await this.prisma.item.delete({ where: { id } });
        await this.logAction(adminId, 'DELETE_ITEM', 'Item', id);
        return { message: 'Предмет удален' };
    }
    async getAllItems() {
        return this.prisma.item.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getAllUsers(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    balance: true,
                    role: true,
                    isBanned: true,
                    banReason: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return {
            users,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
    async banUser(userId, reason, adminId) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: true, banReason: reason },
        });
        await this.logAction(adminId, 'BAN_USER', 'User', userId, reason);
        return user;
    }
    async unbanUser(userId, adminId) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isBanned: false, banReason: null },
        });
        await this.logAction(adminId, 'UNBAN_USER', 'User', userId);
        return user;
    }
    async adjustBalance(userId, amount, reason, adminId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        return await this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } },
            });
            await tx.transaction.create({
                data: {
                    userId,
                    type: 'ADMIN_ADJUSTMENT',
                    amount,
                    balanceBefore: user.balance,
                    balanceAfter: user.balance + amount,
                    description: reason || 'Корректировка баланса администратором',
                },
            });
            await this.logAction(adminId, 'ADJUST_BALANCE', 'User', userId, `Сумма: ${amount}, Причина: ${reason}`);
            return updatedUser;
        });
    }
    async createPromoCode(data, adminId) {
        const promoData = {
            code: data.code.toUpperCase(),
            type: data.type,
            value: data.value,
            maxUses: data.maxUses,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
            caseId: data.caseId || undefined,
        };
        const promoCode = await this.prisma.promoCode.create({
            data: promoData
        });
        if (data.type === 'ITEM' && data.itemId) {
            await this.prisma.promoCodeItem.create({
                data: {
                    promoCodeId: promoCode.id,
                    itemId: data.itemId,
                },
            });
        }
        await this.logAction(adminId, 'CREATE_PROMO_CODE', 'PromoCode', promoCode.id);
        return promoCode;
    }
    async getAllPromoCodes() {
        const promoCodes = await this.prisma.promoCode.findMany({
            include: {
                items: {
                    include: { item: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const promoCodesWithCases = await Promise.all(promoCodes.map(async (promo) => {
            if (promo.caseId) {
                const caseData = await this.prisma.case.findUnique({
                    where: { id: promo.caseId },
                });
                return { ...promo, case: caseData };
            }
            return promo;
        }));
        return promoCodesWithCases;
    }
    async deletePromoCode(id, adminId) {
        await this.prisma.promoCode.delete({ where: { id } });
        await this.logAction(adminId, 'DELETE_PROMO_CODE', 'PromoCode', id);
        return { message: 'Промокод удален' };
    }
    async getStats() {
        const [totalUsers, totalCases, totalItems, totalDrops, totalRevenue, recentDrops,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.case.count(),
            this.prisma.item.count(),
            this.prisma.itemDrop.count(),
            this.prisma.transaction.aggregate({
                where: { type: 'CASE_PURCHASE' },
                _sum: { amount: true },
            }),
            this.prisma.itemDrop.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { username: true },
                    },
                    item: true,
                    case: true,
                },
            }),
        ]);
        return {
            totalUsers,
            totalCases,
            totalItems,
            totalDrops,
            totalRevenue: Math.abs(totalRevenue._sum.amount || 0),
            recentDrops,
        };
    }
    async getLogs(limit = 100) {
        return this.prisma.adminLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }
    async logAction(adminId, action, targetType, targetId, details) {
        await this.prisma.adminLog.create({
            data: {
                adminId,
                action,
                targetType,
                targetId,
                details,
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AdminService);


/***/ }),

/***/ "./backend/app.module.ts":
/*!*******************************!*\
  !*** ./backend/app.module.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const throttler_1 = __webpack_require__(/*! @nestjs/throttler */ "@nestjs/throttler");
const prisma_module_1 = __webpack_require__(/*! ./prisma/prisma.module */ "./backend/prisma/prisma.module.ts");
const auth_module_1 = __webpack_require__(/*! ./auth/auth.module */ "./backend/auth/auth.module.ts");
const users_module_1 = __webpack_require__(/*! ./users/users.module */ "./backend/users/users.module.ts");
const items_module_1 = __webpack_require__(/*! ./items/items.module */ "./backend/items/items.module.ts");
const cases_module_1 = __webpack_require__(/*! ./cases/cases.module */ "./backend/cases/cases.module.ts");
const inventory_module_1 = __webpack_require__(/*! ./inventory/inventory.module */ "./backend/inventory/inventory.module.ts");
const transactions_module_1 = __webpack_require__(/*! ./transactions/transactions.module */ "./backend/transactions/transactions.module.ts");
const promo_codes_module_1 = __webpack_require__(/*! ./promo-codes/promo-codes.module */ "./backend/promo-codes/promo-codes.module.ts");
const upgrades_module_1 = __webpack_require__(/*! ./upgrades/upgrades.module */ "./backend/upgrades/upgrades.module.ts");
const battles_module_1 = __webpack_require__(/*! ./battles/battles.module */ "./backend/battles/battles.module.ts");
const admin_module_1 = __webpack_require__(/*! ./admin/admin.module */ "./backend/admin/admin.module.ts");
const websocket_module_1 = __webpack_require__(/*! ./websocket/websocket.module */ "./backend/websocket/websocket.module.ts");
const contract_module_1 = __webpack_require__(/*! ./contract/contract.module */ "./backend/contract/contract.module.ts");
const crash_module_1 = __webpack_require__(/*! ./crash/crash.module */ "./backend/crash/crash.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
                    limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
                }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            items_module_1.ItemsModule,
            cases_module_1.CasesModule,
            inventory_module_1.InventoryModule,
            transactions_module_1.TransactionsModule,
            promo_codes_module_1.PromoCodesModule,
            upgrades_module_1.UpgradesModule,
            battles_module_1.BattlesModule,
            admin_module_1.AdminModule,
            websocket_module_1.WebsocketModule,
            contract_module_1.ContractModule,
            crash_module_1.CrashModule,
        ],
    })
], AppModule);


/***/ }),

/***/ "./backend/auth/auth.controller.ts":
/*!*****************************************!*\
  !*** ./backend/auth/auth.controller.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const express_1 = __webpack_require__(/*! express */ "express");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./backend/auth/auth.service.ts");
const auth_dto_1 = __webpack_require__(/*! ./dto/auth.dto */ "./backend/auth/dto/auth.dto.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ./guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto, res) {
        const result = await this.authService.register(dto);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return { user: result.user, accessToken: result.accessToken };
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return { user: result.user, accessToken: result.accessToken };
    }
    async refresh(req, res) {
        const refreshToken = req.cookies['refreshToken'];
        const tokens = await this.authService.refresh(refreshToken);
        this.setRefreshTokenCookie(res, tokens.refreshToken);
        return { accessToken: tokens.accessToken };
    }
    async logout(req, res) {
        const refreshToken = req.cookies['refreshToken'];
        await this.authService.logout(req.user.id, refreshToken);
        res.clearCookie('refreshToken');
        return { message: 'Logged out successfully' };
    }
    setRefreshTokenCookie(res, refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof auth_dto_1.RegisterDto !== "undefined" && auth_dto_1.RegisterDto) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof auth_dto_1.LoginDto !== "undefined" && auth_dto_1.LoginDto) === "function" ? _d : Object, typeof (_e = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, typeof (_g = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_h = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),

/***/ "./backend/auth/auth.module.ts":
/*!*************************************!*\
  !*** ./backend/auth/auth.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./backend/auth/auth.service.ts");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./backend/auth/auth.controller.ts");
const jwt_strategy_1 = __webpack_require__(/*! ./strategies/jwt.strategy */ "./backend/auth/strategies/jwt.strategy.ts");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./backend/users/users.module.ts");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
            }),
            users_module_1.UsersModule,
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),

/***/ "./backend/auth/auth.service.ts":
/*!**************************************!*\
  !*** ./backend/auth/auth.service.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const bcrypt = __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"));
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: dto.email }, { username: dto.username }],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Пользователь уже существует');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                username: true,
                balance: true,
                role: true,
                createdAt: true,
            },
        });
        const tokens = await this.generateTokens(user.id);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return { user, ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Неверные учетные данные');
        }
        if (user.isBanned) {
            throw new common_1.UnauthorizedException(`Аккаунт заблокирован: ${user.banReason}`);
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Неверные учетные данные');
        }
        const tokens = await this.generateTokens(user.id);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                balance: user.balance,
                role: user.role,
            },
            ...tokens,
        };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const session = await this.prisma.session.findUnique({
                where: { refreshToken },
                include: { user: true },
            });
            if (!session || session.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Недействительный токен обновления');
            }
            const tokens = await this.generateTokens(session.userId);
            await this.prisma.session.update({
                where: { id: session.id },
                data: { refreshToken: tokens.refreshToken },
            });
            return tokens;
        }
        catch {
            throw new common_1.UnauthorizedException('Недействительный токен обновления');
        }
    }
    async logout(userId, refreshToken) {
        await this.prisma.session.deleteMany({
            where: { userId, refreshToken },
        });
    }
    async generateTokens(userId) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId }, { secret: process.env.JWT_SECRET, expiresIn: '15m' }),
            this.jwtService.signAsync({ sub: userId }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }),
        ]);
        return { accessToken, refreshToken };
    }
    async saveRefreshToken(userId, refreshToken) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.session.create({
            data: { userId, refreshToken, expiresAt },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object])
], AuthService);


/***/ }),

/***/ "./backend/auth/decorators/roles.decorator.ts":
/*!****************************************************!*\
  !*** ./backend/auth/decorators/roles.decorator.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const Roles = (...roles) => (0, common_1.SetMetadata)('roles', roles);
exports.Roles = Roles;


/***/ }),

/***/ "./backend/auth/dto/auth.dto.ts":
/*!**************************************!*\
  !*** ./backend/auth/dto/auth.dto.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(20),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores and hyphens',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);


/***/ }),

/***/ "./backend/auth/guards/jwt-auth.guard.ts":
/*!***********************************************!*\
  !*** ./backend/auth/guards/jwt-auth.guard.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),

/***/ "./backend/auth/guards/roles.guard.ts":
/*!********************************************!*\
  !*** ./backend/auth/guards/roles.guard.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.get('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return requiredRoles.includes(user.role);
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ }),

/***/ "./backend/auth/strategies/jwt.strategy.ts":
/*!*************************************************!*\
  !*** ./backend/auth/strategies/jwt.strategy.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const prisma_service_1 = __webpack_require__(/*! ../../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        });
        this.prisma = prisma;
    }
    async validate(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                username: true,
                balance: true,
                role: true,
                isBanned: true,
            },
        });
        if (!user || user.isBanned) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),

/***/ "./backend/battles/battles.controller.ts":
/*!***********************************************!*\
  !*** ./backend/battles/battles.controller.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BattlesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const battles_service_1 = __webpack_require__(/*! ./battles.service */ "./backend/battles/battles.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class CreateBattleDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBattleDto.prototype, "caseId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(4),
    __metadata("design:type", Number)
], CreateBattleDto.prototype, "maxPlayers", void 0);
let BattlesController = class BattlesController {
    constructor(battlesService) {
        this.battlesService = battlesService;
    }
    getActiveBattles() {
        return this.battlesService.getActiveBattles();
    }
    getBattleById(id) {
        return this.battlesService.getBattleById(id);
    }
    createBattle(dto, req) {
        return this.battlesService.createBattle(req.user.id, dto.caseId, dto.maxPlayers);
    }
    joinBattle(id, req) {
        return this.battlesService.joinBattle(req.user.id, id);
    }
};
exports.BattlesController = BattlesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BattlesController.prototype, "getActiveBattles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BattlesController.prototype, "getBattleById", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateBattleDto, Object]),
    __metadata("design:returntype", void 0)
], BattlesController.prototype, "createBattle", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BattlesController.prototype, "joinBattle", null);
exports.BattlesController = BattlesController = __decorate([
    (0, common_1.Controller)('battles'),
    __metadata("design:paramtypes", [typeof (_a = typeof battles_service_1.BattlesService !== "undefined" && battles_service_1.BattlesService) === "function" ? _a : Object])
], BattlesController);


/***/ }),

/***/ "./backend/battles/battles.module.ts":
/*!*******************************************!*\
  !*** ./backend/battles/battles.module.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BattlesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const battles_service_1 = __webpack_require__(/*! ./battles.service */ "./backend/battles/battles.service.ts");
const battles_controller_1 = __webpack_require__(/*! ./battles.controller */ "./backend/battles/battles.controller.ts");
const cases_module_1 = __webpack_require__(/*! ../cases/cases.module */ "./backend/cases/cases.module.ts");
let BattlesModule = class BattlesModule {
};
exports.BattlesModule = BattlesModule;
exports.BattlesModule = BattlesModule = __decorate([
    (0, common_1.Module)({
        imports: [cases_module_1.CasesModule],
        providers: [battles_service_1.BattlesService],
        controllers: [battles_controller_1.BattlesController],
        exports: [battles_service_1.BattlesService],
    })
], BattlesModule);


/***/ }),

/***/ "./backend/battles/battles.service.ts":
/*!********************************************!*\
  !*** ./backend/battles/battles.service.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BattlesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let BattlesService = class BattlesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBattle(userId, caseId, maxPlayers) {
        const caseData = await this.prisma.case.findUnique({
            where: { id: caseId },
        });
        if (!caseData || !caseData.isActive) {
            throw new common_1.NotFoundException('Кейс не найден');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const finalPrice = caseData.price * (1 - caseData.discount / 100);
        if (user.balance < finalPrice) {
            throw new common_1.BadRequestException('Недостаточно средств');
        }
        return await this.prisma.$transaction(async (tx) => {
            const battle = await tx.battle.create({
                data: {
                    caseId,
                    maxPlayers,
                    status: 'waiting',
                },
            });
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: finalPrice } },
            });
            await tx.battlePlayer.create({
                data: {
                    battleId: battle.id,
                    userId,
                    position: 1,
                },
            });
            await tx.transaction.create({
                data: {
                    userId,
                    type: 'CASE_PURCHASE',
                    amount: -finalPrice,
                    balanceBefore: user.balance,
                    balanceAfter: user.balance - finalPrice,
                    description: `Присоединился к батлу: ${battle.id}`,
                },
            });
            return battle;
        });
    }
    async joinBattle(userId, battleId) {
        const battle = await this.prisma.battle.findUnique({
            where: { id: battleId },
            include: {
                players: true,
                case: true,
            },
        });
        if (!battle || battle.status !== 'waiting') {
            throw new common_1.BadRequestException('Батл недоступен');
        }
        if (battle.players.length >= battle.maxPlayers) {
            throw new common_1.BadRequestException('Батл заполнен');
        }
        const alreadyJoined = battle.players.some((p) => p.userId === userId);
        if (alreadyJoined) {
            throw new common_1.BadRequestException('Вы уже присоединились к этому батлу');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const finalPrice = battle.case.price * (1 - battle.case.discount / 100);
        if (user.balance < finalPrice) {
            throw new common_1.BadRequestException('Недостаточно средств');
        }
        return await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: finalPrice } },
            });
            await tx.battlePlayer.create({
                data: {
                    battleId,
                    userId,
                    position: battle.players.length + 1,
                },
            });
            await tx.transaction.create({
                data: {
                    userId,
                    type: 'CASE_PURCHASE',
                    amount: -finalPrice,
                    balanceBefore: user.balance,
                    balanceAfter: user.balance - finalPrice,
                    description: `Присоединился к батлу: ${battleId}`,
                },
            });
            const updatedBattle = await tx.battle.findUnique({
                where: { id: battleId },
                include: { players: true },
            });
            if (updatedBattle.players.length === battle.maxPlayers) {
                await tx.battle.update({
                    where: { id: battleId },
                    data: { status: 'in_progress', startedAt: new Date() },
                });
            }
            return updatedBattle;
        });
    }
    async getActiveBattles() {
        return this.prisma.battle.findMany({
            where: {
                status: { in: ['waiting', 'in_progress'] },
            },
            include: {
                case: true,
                players: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getBattleById(battleId) {
        const battle = await this.prisma.battle.findUnique({
            where: { id: battleId },
            include: {
                case: true,
                players: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
                drops: {
                    include: {
                        item: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });
        if (!battle) {
            throw new common_1.NotFoundException('Батл не найден');
        }
        return battle;
    }
};
exports.BattlesService = BattlesService;
exports.BattlesService = BattlesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], BattlesService);


/***/ }),

/***/ "./backend/cases/cases.controller.ts":
/*!*******************************************!*\
  !*** ./backend/cases/cases.controller.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CasesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const cases_service_1 = __webpack_require__(/*! ./cases.service */ "./backend/cases/cases.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
let CasesController = class CasesController {
    constructor(casesService) {
        this.casesService = casesService;
    }
    getAllCases() {
        return this.casesService.getAllCases();
    }
    getCaseById(id) {
        return this.casesService.getCaseById(id);
    }
    openCase(id, req) {
        return this.casesService.openCase(req.user.id, id);
    }
};
exports.CasesController = CasesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CasesController.prototype, "getAllCases", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CasesController.prototype, "getCaseById", null);
__decorate([
    (0, common_1.Post)(':id/open'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CasesController.prototype, "openCase", null);
exports.CasesController = CasesController = __decorate([
    (0, common_1.Controller)('cases'),
    __metadata("design:paramtypes", [typeof (_a = typeof cases_service_1.CasesService !== "undefined" && cases_service_1.CasesService) === "function" ? _a : Object])
], CasesController);


/***/ }),

/***/ "./backend/cases/cases.module.ts":
/*!***************************************!*\
  !*** ./backend/cases/cases.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CasesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const cases_service_1 = __webpack_require__(/*! ./cases.service */ "./backend/cases/cases.service.ts");
const cases_controller_1 = __webpack_require__(/*! ./cases.controller */ "./backend/cases/cases.controller.ts");
const websocket_module_1 = __webpack_require__(/*! ../websocket/websocket.module */ "./backend/websocket/websocket.module.ts");
let CasesModule = class CasesModule {
};
exports.CasesModule = CasesModule;
exports.CasesModule = CasesModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => websocket_module_1.WebsocketModule)],
        providers: [cases_service_1.CasesService],
        controllers: [cases_controller_1.CasesController],
        exports: [cases_service_1.CasesService],
    })
], CasesModule);


/***/ }),

/***/ "./backend/cases/cases.service.ts":
/*!****************************************!*\
  !*** ./backend/cases/cases.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CasesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
const websocket_gateway_1 = __webpack_require__(/*! ../websocket/websocket.gateway */ "./backend/websocket/websocket.gateway.ts");
let CasesService = class CasesService {
    constructor(prisma, websocketGateway) {
        this.prisma = prisma;
        this.websocketGateway = websocketGateway;
    }
    async openCase(userId, caseId) {
        const caseData = await this.prisma.case.findUnique({
            where: { id: caseId },
            include: {
                items: {
                    include: { item: true },
                },
            },
        });
        if (!caseData || !caseData.isActive) {
            throw new common_1.NotFoundException('Кейс не найден');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const finalPrice = caseData.price * (1 - caseData.discount / 100);
        if (user.balance < finalPrice) {
            throw new common_1.BadRequestException('Недостаточно средств');
        }
        const droppedItem = this.selectRandomItem(caseData.items, caseData.name);
        return await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: finalPrice } },
            });
            await tx.transaction.create({
                data: {
                    userId,
                    type: 'CASE_PURCHASE',
                    amount: -finalPrice,
                    balanceBefore: user.balance,
                    balanceAfter: user.balance - finalPrice,
                    description: `Открыт кейс: ${caseData.name}`,
                },
            });
            const inventoryItem = await tx.inventoryItem.create({
                data: {
                    userId,
                    itemId: droppedItem.itemId,
                },
                include: { item: true },
            });
            await tx.itemDrop.create({
                data: {
                    userId,
                    caseId,
                    itemId: droppedItem.itemId,
                },
            });
            const result = {
                item: inventoryItem.item,
                newBalance: user.balance - finalPrice,
            };
            this.websocketGateway.broadcastCaseOpened(userId, user.username, inventoryItem.item, caseData.name, finalPrice);
            return result;
        });
    }
    selectRandomItem(caseItems, caseName) {
        const adjustedItems = caseItems.map(ci => {
            let adjustedChance = ci.dropChance;
            if (!caseName.includes('Легендарный')) {
                if (caseName.includes('Премиум') || caseName.includes('Мастерский')) {
                    if (ci.item.rarity === 'MASTER') {
                        adjustedChance *= 3;
                    }
                    else if (ci.item.rarity === 'VETERAN') {
                        adjustedChance *= 2;
                    }
                }
                else if (caseName.includes('Ветеранский')) {
                    if (ci.item.rarity === 'VETERAN') {
                        adjustedChance *= 2.5;
                    }
                    else if (ci.item.rarity === 'STALKER') {
                        adjustedChance *= 1.5;
                    }
                }
                else {
                    if (ci.item.rarity === 'STALKER') {
                        adjustedChance *= 1.5;
                    }
                }
            }
            return { ...ci, adjustedChance };
        });
        const totalChance = adjustedItems.reduce((sum, ci) => sum + ci.adjustedChance, 0);
        let random = Math.random() * totalChance;
        for (const caseItem of adjustedItems) {
            random -= caseItem.adjustedChance;
            if (random <= 0) {
                return caseItem;
            }
        }
        return adjustedItems[0];
    }
    async getAllCases() {
        return this.prisma.case.findMany({
            where: { isActive: true },
            include: {
                items: {
                    include: { item: true },
                },
            },
        });
    }
    async getCaseById(id) {
        const caseData = await this.prisma.case.findUnique({
            where: { id },
            include: {
                items: {
                    include: { item: true },
                },
            },
        });
        if (!caseData) {
            throw new common_1.NotFoundException('Кейс не найден');
        }
        return caseData;
    }
};
exports.CasesService = CasesService;
exports.CasesService = CasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => websocket_gateway_1.WebsocketGateway))),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof websocket_gateway_1.WebsocketGateway !== "undefined" && websocket_gateway_1.WebsocketGateway) === "function" ? _b : Object])
], CasesService);


/***/ }),

/***/ "./backend/contract/contract.controller.ts":
/*!*************************************************!*\
  !*** ./backend/contract/contract.controller.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContractController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const contract_service_1 = __webpack_require__(/*! ./contract.service */ "./backend/contract/contract.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
const create_contract_dto_1 = __webpack_require__(/*! ./dto/create-contract.dto */ "./backend/contract/dto/create-contract.dto.ts");
let ContractController = class ContractController {
    constructor(contractService) {
        this.contractService = contractService;
    }
    async createContract(dto, req) {
        console.log('=== CONTRACT CREATE REQUEST ===');
        console.log('Full DTO:', JSON.stringify(dto));
        console.log('itemIds:', dto.itemIds);
        console.log('User ID:', req.user?.id);
        console.log('User object:', req.user);
        console.log('Calling service with:', req.user.id, dto.itemIds);
        try {
            const result = await this.contractService.createContract(req.user.id, dto.itemIds);
            console.log('Contract created successfully:', result);
            return result;
        }
        catch (error) {
            console.error('Contract creation error:', error);
            throw error;
        }
    }
};
exports.ContractController = ContractController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_contract_dto_1.CreateContractDto !== "undefined" && create_contract_dto_1.CreateContractDto) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], ContractController.prototype, "createContract", null);
exports.ContractController = ContractController = __decorate([
    (0, common_1.Controller)('contract'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof contract_service_1.ContractService !== "undefined" && contract_service_1.ContractService) === "function" ? _a : Object])
], ContractController);


/***/ }),

/***/ "./backend/contract/contract.module.ts":
/*!*********************************************!*\
  !*** ./backend/contract/contract.module.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContractModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const contract_controller_1 = __webpack_require__(/*! ./contract.controller */ "./backend/contract/contract.controller.ts");
const contract_service_1 = __webpack_require__(/*! ./contract.service */ "./backend/contract/contract.service.ts");
const prisma_module_1 = __webpack_require__(/*! ../prisma/prisma.module */ "./backend/prisma/prisma.module.ts");
let ContractModule = class ContractModule {
};
exports.ContractModule = ContractModule;
exports.ContractModule = ContractModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [contract_controller_1.ContractController],
        providers: [contract_service_1.ContractService],
    })
], ContractModule);


/***/ }),

/***/ "./backend/contract/contract.service.ts":
/*!**********************************************!*\
  !*** ./backend/contract/contract.service.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContractService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let ContractService = class ContractService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createContract(userId, itemIds) {
        console.log('Creating contract for user:', userId);
        console.log('Item IDs:', itemIds);
        if (itemIds.length < 3 || itemIds.length > 10) {
            throw new common_1.BadRequestException('Необходимо от 3 до 10 предметов');
        }
        const inventoryItems = await this.prisma.inventoryItem.findMany({
            where: {
                id: { in: itemIds },
                userId,
                isSold: false,
            },
            include: { item: true },
        });
        console.log('Found inventory items:', inventoryItems.length);
        if (inventoryItems.length !== itemIds.length) {
            console.log('Items mismatch. Expected:', itemIds.length, 'Found:', inventoryItems.length);
            throw new common_1.BadRequestException('Некоторые предметы не найдены в вашем инвентаре');
        }
        const totalValue = inventoryItems.reduce((sum, item) => sum + item.item.basePrice, 0);
        const minValue = totalValue * 0.8;
        const maxValue = totalValue * 1.2;
        const availableItems = await this.prisma.item.findMany({
            where: {
                basePrice: {
                    gte: minValue,
                    lte: maxValue,
                },
                isActive: true,
            },
        });
        if (availableItems.length === 0) {
            throw new common_1.BadRequestException('Нет доступных предметов для контракта');
        }
        const wonItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        return await this.prisma.$transaction(async (tx) => {
            await tx.inventoryItem.deleteMany({
                where: {
                    id: { in: itemIds },
                },
            });
            await tx.inventoryItem.create({
                data: {
                    userId,
                    itemId: wonItem.id,
                },
            });
            const user = await tx.user.findUnique({
                where: { id: userId },
            });
            return {
                item: wonItem,
                newBalance: user.balance,
            };
        });
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ContractService);


/***/ }),

/***/ "./backend/contract/dto/create-contract.dto.ts":
/*!*****************************************************!*\
  !*** ./backend/contract/dto/create-contract.dto.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateContractDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class CreateContractDto {
}
exports.CreateContractDto = CreateContractDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(3, { message: 'Необходимо минимум 3 предмета' }),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Максимум 10 предметов' }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateContractDto.prototype, "itemIds", void 0);


/***/ }),

/***/ "./backend/crash/crash.module.ts":
/*!***************************************!*\
  !*** ./backend/crash/crash.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrashModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const crash_service_1 = __webpack_require__(/*! ./crash.service */ "./backend/crash/crash.service.ts");
const prisma_module_1 = __webpack_require__(/*! ../prisma/prisma.module */ "./backend/prisma/prisma.module.ts");
let CrashModule = class CrashModule {
};
exports.CrashModule = CrashModule;
exports.CrashModule = CrashModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [crash_service_1.CrashService],
        exports: [crash_service_1.CrashService],
    })
], CrashModule);


/***/ }),

/***/ "./backend/crash/crash.service.ts":
/*!****************************************!*\
  !*** ./backend/crash/crash.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CrashService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrashService = exports.RoundState = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
var RoundState;
(function (RoundState) {
    RoundState["CRASH"] = "CRASH";
    RoundState["POST_CRASH_WAIT"] = "POST_CRASH_WAIT";
    RoundState["RESET"] = "RESET";
    RoundState["COUNTDOWN"] = "COUNTDOWN";
    RoundState["RUNNING"] = "RUNNING";
})(RoundState || (exports.RoundState = RoundState = {}));
let CrashService = CrashService_1 = class CrashService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CrashService_1.name);
        this.roundHistory = [];
        this.POST_CRASH_WAIT_DURATION = 3000;
        this.RESET_DURATION = 1000;
        this.COUNTDOWN_DURATION = 10000;
        this.initializeRound();
    }
    initializeRound() {
        this.currentRound = {
            roundId: this.generateRoundId(),
            state: RoundState.COUNTDOWN,
            crashMultiplier: this.generateCrashMultiplier(),
            bets: new Map(),
            history: [...this.roundHistory],
        };
    }
    generateRoundId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCrashMultiplier() {
        const random = Math.random();
        if (random < 0.4) {
            return parseFloat((1.00 + Math.random()).toFixed(2));
        }
        else if (random < 0.7) {
            return parseFloat((2.00 + Math.random() * 3).toFixed(2));
        }
        else if (random < 0.9) {
            return parseFloat((5.00 + Math.random() * 5).toFixed(2));
        }
        else {
            return parseFloat((10.00 + Math.random() * 10).toFixed(2));
        }
    }
    getCurrentRound() {
        return this.currentRound;
    }
    getServerTime() {
        return Date.now();
    }
    getRoundState() {
        const serverTime = this.getServerTime();
        return {
            roundId: this.currentRound.roundId,
            state: this.currentRound.state,
            serverTime,
            startTime: this.currentRound.startTime,
            crashMultiplier: this.currentRound.state === RoundState.RUNNING ||
                this.currentRound.state === RoundState.CRASH ||
                this.currentRound.state === RoundState.POST_CRASH_WAIT ||
                this.currentRound.state === RoundState.RESET
                ? this.currentRound.crashMultiplier
                : undefined,
            countdownStartTime: this.currentRound.countdownStartTime,
            countdownDuration: this.COUNTDOWN_DURATION,
            postCrashWaitStartTime: this.currentRound.postCrashWaitStartTime,
            postCrashWaitDuration: this.POST_CRASH_WAIT_DURATION,
            resetStartTime: this.currentRound.resetStartTime,
            resetDuration: this.RESET_DURATION,
            history: this.currentRound.history,
            bets: Array.from(this.currentRound.bets.values()).map(bet => ({
                username: bet.username,
                amount: bet.amount,
                type: bet.type,
                autoCashout: bet.autoCashout,
                cashedOut: bet.cashedOut,
                cashoutMultiplier: bet.cashoutMultiplier,
            })),
        };
    }
    async placeBet(userId, username, amount, type, autoCashout, itemId) {
        if (this.currentRound.state !== RoundState.COUNTDOWN) {
            return { success: false, error: 'Ставки закрыты' };
        }
        if (this.currentRound.bets.has(userId)) {
            return { success: false, error: 'У вас уже есть ставка в этом раунде' };
        }
        if (autoCashout < 1.01 && autoCashout !== Infinity) {
            return { success: false, error: 'Автовывод должен быть минимум 1.01x' };
        }
        try {
            if (type === 'balance') {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                });
                if (!user || user.balance < amount) {
                    return { success: false, error: 'Недостаточно средств' };
                }
                const updatedUser = await this.prisma.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: amount } },
                });
                await this.prisma.transaction.create({
                    data: {
                        userId,
                        type: 'CRASH_BET',
                        amount: -amount,
                        balanceBefore: user.balance,
                        balanceAfter: updatedUser.balance,
                        description: `Ставка в Crash: ${amount} ₽`,
                        metadata: JSON.stringify({ roundId: this.currentRound.roundId }),
                    },
                });
                this.currentRound.bets.set(userId, {
                    userId,
                    username,
                    amount,
                    type,
                    itemId,
                    autoCashout,
                    cashedOut: false,
                });
                return { success: true, newBalance: updatedUser.balance };
            }
            else if (type === 'item' && itemId) {
                const item = await this.prisma.inventoryItem.findFirst({
                    where: {
                        id: itemId,
                        userId,
                        isSold: false,
                    },
                    include: { item: true },
                });
                if (!item) {
                    return { success: false, error: 'Предмет не найден' };
                }
                await this.prisma.inventoryItem.update({
                    where: { id: itemId },
                    data: {
                        isSold: true,
                        soldAt: new Date(),
                        soldPrice: item.item.basePrice,
                    },
                });
                this.currentRound.bets.set(userId, {
                    userId,
                    username,
                    amount: item.item.basePrice,
                    type,
                    itemId,
                    autoCashout,
                    cashedOut: false,
                });
                return { success: true };
            }
            return { success: false, error: 'Неверный тип ставки' };
        }
        catch (error) {
            this.logger.error(`Error placing bet: ${error.message}`);
            return { success: false, error: 'Не удалось сделать ставку' };
        }
    }
    async cashout(userId) {
        if (this.currentRound.state !== RoundState.RUNNING) {
            return { success: false, error: 'Сейчас нельзя забрать выигрыш' };
        }
        const bet = this.currentRound.bets.get(userId);
        if (!bet) {
            return { success: false, error: 'Нет активной ставки' };
        }
        if (bet.cashedOut) {
            return { success: false, error: 'Вы уже забрали выигрыш' };
        }
        const currentMultiplier = this.getCurrentMultiplier();
        const profit = bet.amount * currentMultiplier;
        bet.cashedOut = true;
        bet.cashoutMultiplier = currentMultiplier;
        bet.profit = profit;
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: profit } },
        });
        await this.prisma.transaction.create({
            data: {
                userId,
                type: 'CRASH_WIN',
                amount: profit,
                balanceBefore: updatedUser.balance - profit,
                balanceAfter: updatedUser.balance,
                description: `Выигрыш в Crash: ${currentMultiplier.toFixed(2)}x`,
                metadata: JSON.stringify({
                    roundId: this.currentRound.roundId,
                    multiplier: currentMultiplier,
                }),
            },
        });
        return { success: true, multiplier: currentMultiplier, profit, newBalance: updatedUser.balance };
    }
    getCurrentMultiplier() {
        if (this.currentRound.state !== RoundState.RUNNING) {
            return 1.00;
        }
        const elapsed = Date.now() - this.currentRound.startTime;
        const multiplier = Math.pow(Math.E, elapsed / 10000);
        return Math.min(parseFloat(multiplier.toFixed(2)), this.currentRound.crashMultiplier);
    }
    async startCountdown() {
        this.currentRound.state = RoundState.COUNTDOWN;
        this.currentRound.countdownStartTime = Date.now();
        this.logger.log(`Round ${this.currentRound.roundId}: COUNTDOWN phase started (10s betting)`);
    }
    async startRound() {
        this.currentRound.state = RoundState.RUNNING;
        this.currentRound.startTime = Date.now();
        this.logger.log(`Round ${this.currentRound.roundId}: RUNNING phase started, crash at ${this.currentRound.crashMultiplier}x`);
    }
    async crashRound() {
        this.currentRound.state = RoundState.CRASH;
        this.currentRound.crashTime = Date.now();
        this.logger.log(`Round ${this.currentRound.roundId}: CRASH at ${this.currentRound.crashMultiplier}x`);
        for (const [userId, bet] of this.currentRound.bets) {
            if (!bet.cashedOut) {
                await this.prisma.transaction.create({
                    data: {
                        userId,
                        type: 'CRASH_LOSS',
                        amount: -bet.amount,
                        balanceBefore: 0,
                        balanceAfter: 0,
                        description: `Проигрыш в Crash`,
                        metadata: JSON.stringify({
                            roundId: this.currentRound.roundId,
                            crashMultiplier: this.currentRound.crashMultiplier,
                        }),
                    },
                });
            }
        }
    }
    async startPostCrashWait() {
        this.currentRound.state = RoundState.POST_CRASH_WAIT;
        this.currentRound.postCrashWaitStartTime = Date.now();
        this.logger.log(`Round ${this.currentRound.roundId}: POST_CRASH_WAIT phase (3s pause)`);
    }
    async resetRound() {
        this.currentRound.state = RoundState.RESET;
        this.currentRound.resetStartTime = Date.now();
        this.roundHistory.unshift(this.currentRound.crashMultiplier);
        if (this.roundHistory.length > 20) {
            this.roundHistory = this.roundHistory.slice(0, 20);
        }
        this.logger.log(`Round ${this.currentRound.roundId}: RESET phase (recovery animation)`);
    }
    async prepareNextRound() {
        this.initializeRound();
        this.logger.log(`New round ${this.currentRound.roundId} prepared`);
    }
    async checkAutoCashouts() {
        if (this.currentRound.state !== RoundState.RUNNING)
            return [];
        const currentMultiplier = this.getCurrentMultiplier();
        const autoCashouts = [];
        for (const [userId, bet] of this.currentRound.bets) {
            if (!bet.cashedOut && bet.autoCashout !== Infinity && currentMultiplier >= bet.autoCashout) {
                const result = await this.cashout(userId);
                if (result.success) {
                    autoCashouts.push({
                        userId,
                        username: bet.username,
                        multiplier: result.multiplier,
                        profit: result.profit,
                        newBalance: result.newBalance,
                    });
                }
            }
        }
        return autoCashouts;
    }
};
exports.CrashService = CrashService;
exports.CrashService = CrashService = CrashService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], CrashService);


/***/ }),

/***/ "./backend/inventory/inventory.controller.ts":
/*!***************************************************!*\
  !*** ./backend/inventory/inventory.controller.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InventoryController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const inventory_service_1 = __webpack_require__(/*! ./inventory.service */ "./backend/inventory/inventory.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getInventory(req) {
        return this.inventoryService.getInventory(req.user.id);
    }
    sellItem(id, req) {
        return this.inventoryService.sellItem(req.user.id, id);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Post)(':id/sell'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "sellItem", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof inventory_service_1.InventoryService !== "undefined" && inventory_service_1.InventoryService) === "function" ? _a : Object])
], InventoryController);


/***/ }),

/***/ "./backend/inventory/inventory.module.ts":
/*!***********************************************!*\
  !*** ./backend/inventory/inventory.module.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InventoryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const inventory_service_1 = __webpack_require__(/*! ./inventory.service */ "./backend/inventory/inventory.service.ts");
const inventory_controller_1 = __webpack_require__(/*! ./inventory.controller */ "./backend/inventory/inventory.controller.ts");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        providers: [inventory_service_1.InventoryService],
        controllers: [inventory_controller_1.InventoryController],
        exports: [inventory_service_1.InventoryService],
    })
], InventoryModule);


/***/ }),

/***/ "./backend/inventory/inventory.service.ts":
/*!************************************************!*\
  !*** ./backend/inventory/inventory.service.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InventoryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInventory(userId) {
        return this.prisma.inventoryItem.findMany({
            where: { userId, isSold: false },
            include: { item: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async sellItem(userId, inventoryItemId) {
        const inventoryItem = await this.prisma.inventoryItem.findUnique({
            where: { id: inventoryItemId },
            include: { item: true },
        });
        if (!inventoryItem || inventoryItem.userId !== userId) {
            throw new common_1.NotFoundException('Предмет не найден');
        }
        if (inventoryItem.isSold) {
            throw new common_1.BadRequestException('Предмет уже продан');
        }
        const sellPrice = inventoryItem.item.basePrice;
        return await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            await tx.inventoryItem.update({
                where: { id: inventoryItemId },
                data: {
                    isSold: true,
                    soldAt: new Date(),
                    soldPrice: sellPrice,
                },
            });
            await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: sellPrice } },
            });
            await tx.transaction.create({
                data: {
                    userId,
                    type: 'ITEM_SALE',
                    amount: sellPrice,
                    balanceBefore: user.balance,
                    balanceAfter: user.balance + sellPrice,
                    description: `Продан предмет: ${inventoryItem.item.name}`,
                },
            });
            return {
                newBalance: user.balance + sellPrice,
                soldPrice: sellPrice,
            };
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], InventoryService);


/***/ }),

/***/ "./backend/items/items.controller.ts":
/*!*******************************************!*\
  !*** ./backend/items/items.controller.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ItemsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const items_service_1 = __webpack_require__(/*! ./items.service */ "./backend/items/items.service.ts");
let ItemsController = class ItemsController {
    constructor(itemsService) {
        this.itemsService = itemsService;
    }
    getAllItems() {
        return this.itemsService.getAllItems();
    }
    getItemById(id) {
        return this.itemsService.getItemById(id);
    }
};
exports.ItemsController = ItemsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "getAllItems", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemsController.prototype, "getItemById", null);
exports.ItemsController = ItemsController = __decorate([
    (0, common_1.Controller)('items'),
    __metadata("design:paramtypes", [typeof (_a = typeof items_service_1.ItemsService !== "undefined" && items_service_1.ItemsService) === "function" ? _a : Object])
], ItemsController);


/***/ }),

/***/ "./backend/items/items.module.ts":
/*!***************************************!*\
  !*** ./backend/items/items.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ItemsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const items_service_1 = __webpack_require__(/*! ./items.service */ "./backend/items/items.service.ts");
const items_controller_1 = __webpack_require__(/*! ./items.controller */ "./backend/items/items.controller.ts");
let ItemsModule = class ItemsModule {
};
exports.ItemsModule = ItemsModule;
exports.ItemsModule = ItemsModule = __decorate([
    (0, common_1.Module)({
        providers: [items_service_1.ItemsService],
        controllers: [items_controller_1.ItemsController],
        exports: [items_service_1.ItemsService],
    })
], ItemsModule);


/***/ }),

/***/ "./backend/items/items.service.ts":
/*!****************************************!*\
  !*** ./backend/items/items.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ItemsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let ItemsService = class ItemsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllItems() {
        return this.prisma.item.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getItemById(id) {
        return this.prisma.item.findUnique({
            where: { id },
        });
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ItemsService);


/***/ }),

/***/ "./backend/main.ts":
/*!*************************!*\
  !*** ./backend/main.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./backend/app.module.ts");
const cookie_parser_1 = __importDefault(__webpack_require__(/*! cookie-parser */ "cookie-parser"));
const helmet_1 = __importDefault(__webpack_require__(/*! helmet */ "helmet"));
const path_1 = __webpack_require__(/*! path */ "path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: ['http://localhost:4001', 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();


/***/ }),

/***/ "./backend/prisma/prisma.module.ts":
/*!*****************************************!*\
  !*** ./backend/prisma/prisma.module.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ./prisma.service */ "./backend/prisma/prisma.service.ts");
let PrismaModule = class PrismaModule {
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaModule);


/***/ }),

/***/ "./backend/prisma/prisma.service.ts":
/*!******************************************!*\
  !*** ./backend/prisma/prisma.service.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);


/***/ }),

/***/ "./backend/promo-codes/promo-codes.controller.ts":
/*!*******************************************************!*\
  !*** ./backend/promo-codes/promo-codes.controller.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PromoCodesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const promo_codes_service_1 = __webpack_require__(/*! ./promo-codes.service */ "./backend/promo-codes/promo-codes.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class RedeemPromoCodeDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RedeemPromoCodeDto.prototype, "code", void 0);
let PromoCodesController = class PromoCodesController {
    constructor(promoCodesService) {
        this.promoCodesService = promoCodesService;
    }
    redeemPromoCode(dto, req) {
        return this.promoCodesService.redeemPromoCode(req.user.id, dto.code);
    }
    getPromoHistory(req) {
        return this.promoCodesService.getUserPromoHistory(req.user.id);
    }
};
exports.PromoCodesController = PromoCodesController;
__decorate([
    (0, common_1.Post)('redeem'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RedeemPromoCodeDto, Object]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "redeemPromoCode", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "getPromoHistory", null);
exports.PromoCodesController = PromoCodesController = __decorate([
    (0, common_1.Controller)('promo-codes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof promo_codes_service_1.PromoCodesService !== "undefined" && promo_codes_service_1.PromoCodesService) === "function" ? _a : Object])
], PromoCodesController);


/***/ }),

/***/ "./backend/promo-codes/promo-codes.module.ts":
/*!***************************************************!*\
  !*** ./backend/promo-codes/promo-codes.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PromoCodesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const promo_codes_service_1 = __webpack_require__(/*! ./promo-codes.service */ "./backend/promo-codes/promo-codes.service.ts");
const promo_codes_controller_1 = __webpack_require__(/*! ./promo-codes.controller */ "./backend/promo-codes/promo-codes.controller.ts");
let PromoCodesModule = class PromoCodesModule {
};
exports.PromoCodesModule = PromoCodesModule;
exports.PromoCodesModule = PromoCodesModule = __decorate([
    (0, common_1.Module)({
        providers: [promo_codes_service_1.PromoCodesService],
        controllers: [promo_codes_controller_1.PromoCodesController],
        exports: [promo_codes_service_1.PromoCodesService],
    })
], PromoCodesModule);


/***/ }),

/***/ "./backend/promo-codes/promo-codes.service.ts":
/*!****************************************************!*\
  !*** ./backend/promo-codes/promo-codes.service.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PromoCodesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let PromoCodesService = class PromoCodesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async redeemPromoCode(userId, code) {
        const promoCode = await this.prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                items: { include: { item: true } }
            },
        });
        if (!promoCode || !promoCode.isActive) {
            throw new common_1.NotFoundException('Промокод не найден или неактивен');
        }
        if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Промокод истек');
        }
        if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
            throw new common_1.BadRequestException('Промокод исчерпан');
        }
        const existingUsage = await this.prisma.promoCodeUsage.findUnique({
            where: {
                promoCodeId_userId: {
                    promoCodeId: promoCode.id,
                    userId,
                },
            },
        });
        if (existingUsage) {
            throw new common_1.BadRequestException('Вы уже использовали этот промокод');
        }
        return await this.prisma.$transaction(async (tx) => {
            let message = '';
            let newBalance = 0;
            const user = await tx.user.findUnique({ where: { id: userId } });
            switch (promoCode.type) {
                case 'BALANCE':
                    await tx.user.update({
                        where: { id: userId },
                        data: { balance: { increment: promoCode.value } },
                    });
                    await tx.transaction.create({
                        data: {
                            userId,
                            type: 'PROMO_CODE',
                            amount: promoCode.value,
                            balanceBefore: user.balance,
                            balanceAfter: user.balance + promoCode.value,
                            description: `Промокод: ${code}`,
                        },
                    });
                    newBalance = user.balance + promoCode.value;
                    message = `Вы получили ${promoCode.value} ₽`;
                    break;
                case 'ITEM':
                    if (promoCode.items.length > 0) {
                        const item = promoCode.items[0].item;
                        await tx.inventoryItem.create({
                            data: {
                                userId,
                                itemId: item.id,
                            },
                        });
                        message = `Вы получили предмет: ${item.name}`;
                    }
                    newBalance = user.balance;
                    break;
                case 'DISCOUNT':
                    message = `Активирована скидка ${promoCode.value}% на следующую покупку`;
                    newBalance = user.balance;
                    break;
                case 'CASE_DROP':
                    message = `Активирован бонус +${promoCode.value}% к шансу выпадения для выбранного кейса`;
                    newBalance = user.balance;
                    break;
                default:
                    throw new common_1.BadRequestException('Неизвестный тип промокода');
            }
            await tx.promoCodeUsage.create({
                data: {
                    promoCodeId: promoCode.id,
                    userId,
                },
            });
            await tx.promoCode.update({
                where: { id: promoCode.id },
                data: { usedCount: { increment: 1 } },
            });
            return { message, newBalance };
        });
    }
    async getUserPromoHistory(userId) {
        const usages = await this.prisma.promoCodeUsage.findMany({
            where: { userId },
            include: {
                promoCode: true,
            },
            orderBy: { usedAt: 'desc' },
        });
        return usages.map(usage => ({
            code: usage.promoCode.code,
            type: usage.promoCode.type,
            value: usage.promoCode.value,
            usedAt: usage.usedAt,
        }));
    }
};
exports.PromoCodesService = PromoCodesService;
exports.PromoCodesService = PromoCodesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], PromoCodesService);


/***/ }),

/***/ "./backend/transactions/transactions.controller.ts":
/*!*********************************************************!*\
  !*** ./backend/transactions/transactions.controller.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const transactions_service_1 = __webpack_require__(/*! ./transactions.service */ "./backend/transactions/transactions.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    getUserTransactions(req, limit) {
        return this.transactionsService.getUserTransactions(req.user.id, limit ? parseInt(limit) : 50);
    }
    getTransactionStats(req) {
        return this.transactionsService.getTransactionStats(req.user.id);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getUserTransactions", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getTransactionStats", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof transactions_service_1.TransactionsService !== "undefined" && transactions_service_1.TransactionsService) === "function" ? _a : Object])
], TransactionsController);


/***/ }),

/***/ "./backend/transactions/transactions.module.ts":
/*!*****************************************************!*\
  !*** ./backend/transactions/transactions.module.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const transactions_service_1 = __webpack_require__(/*! ./transactions.service */ "./backend/transactions/transactions.service.ts");
const transactions_controller_1 = __webpack_require__(/*! ./transactions.controller */ "./backend/transactions/transactions.controller.ts");
let TransactionsModule = class TransactionsModule {
};
exports.TransactionsModule = TransactionsModule;
exports.TransactionsModule = TransactionsModule = __decorate([
    (0, common_1.Module)({
        providers: [transactions_service_1.TransactionsService],
        controllers: [transactions_controller_1.TransactionsController],
        exports: [transactions_service_1.TransactionsService],
    })
], TransactionsModule);


/***/ }),

/***/ "./backend/transactions/transactions.service.ts":
/*!******************************************************!*\
  !*** ./backend/transactions/transactions.service.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserTransactions(userId, limit = 50) {
        return this.prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getTransactionStats(userId) {
        const [deposits, withdrawals, spent] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: { userId, type: 'DEPOSIT' },
                _sum: { amount: true },
            }),
            this.prisma.transaction.aggregate({
                where: { userId, type: 'WITHDRAWAL' },
                _sum: { amount: true },
            }),
            this.prisma.transaction.aggregate({
                where: { userId, type: 'CASE_PURCHASE' },
                _sum: { amount: true },
            }),
        ]);
        return {
            totalDeposits: deposits._sum.amount || 0,
            totalWithdrawals: Math.abs(withdrawals._sum.amount || 0),
            totalSpent: Math.abs(spent._sum.amount || 0),
        };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], TransactionsService);


/***/ }),

/***/ "./backend/upgrades/upgrades.controller.ts":
/*!*************************************************!*\
  !*** ./backend/upgrades/upgrades.controller.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpgradesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const upgrades_service_1 = __webpack_require__(/*! ./upgrades.service */ "./backend/upgrades/upgrades.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
let UpgradesController = class UpgradesController {
    constructor(upgradesService) {
        this.upgradesService = upgradesService;
    }
    upgradeItem(req, fromItemId, toItemId) {
        return this.upgradesService.upgradeItem(req.user.id, fromItemId, toItemId);
    }
    getAvailableUpgrades(itemId) {
        return this.upgradesService.getAvailableUpgrades(itemId);
    }
};
exports.UpgradesController = UpgradesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('fromItemId')),
    __param(2, (0, common_1.Body)('toItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UpgradesController.prototype, "upgradeItem", null);
__decorate([
    (0, common_1.Get)('available/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UpgradesController.prototype, "getAvailableUpgrades", null);
exports.UpgradesController = UpgradesController = __decorate([
    (0, common_1.Controller)('upgrades'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof upgrades_service_1.UpgradesService !== "undefined" && upgrades_service_1.UpgradesService) === "function" ? _a : Object])
], UpgradesController);


/***/ }),

/***/ "./backend/upgrades/upgrades.module.ts":
/*!*********************************************!*\
  !*** ./backend/upgrades/upgrades.module.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpgradesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const upgrades_service_1 = __webpack_require__(/*! ./upgrades.service */ "./backend/upgrades/upgrades.service.ts");
const upgrades_controller_1 = __webpack_require__(/*! ./upgrades.controller */ "./backend/upgrades/upgrades.controller.ts");
let UpgradesModule = class UpgradesModule {
};
exports.UpgradesModule = UpgradesModule;
exports.UpgradesModule = UpgradesModule = __decorate([
    (0, common_1.Module)({
        providers: [upgrades_service_1.UpgradesService],
        controllers: [upgrades_controller_1.UpgradesController],
    })
], UpgradesModule);


/***/ }),

/***/ "./backend/upgrades/upgrades.service.ts":
/*!**********************************************!*\
  !*** ./backend/upgrades/upgrades.service.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpgradesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
let UpgradesService = class UpgradesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upgradeItem(userId, fromItemId, toItemId) {
        const [fromInventoryItem, toItem] = await Promise.all([
            this.prisma.inventoryItem.findFirst({
                where: { id: fromItemId, userId, isSold: false },
                include: { item: true },
            }),
            this.prisma.item.findUnique({ where: { id: toItemId } }),
        ]);
        if (!fromInventoryItem) {
            throw new common_1.NotFoundException('Предмет не найден в инвентаре');
        }
        if (!toItem) {
            throw new common_1.NotFoundException('Целевой предмет не найден');
        }
        const priceDiff = toItem.basePrice - fromInventoryItem.item.basePrice;
        if (priceDiff <= 0) {
            throw new common_1.BadRequestException('Целевой предмет должен быть дороже');
        }
        const priceRatio = priceDiff / fromInventoryItem.item.basePrice;
        let chance = 50 - (priceRatio * 30);
        chance = Math.max(5, Math.min(80, chance));
        const success = Math.random() * 100 < chance;
        return await this.prisma.$transaction(async (tx) => {
            await tx.inventoryItem.delete({
                where: { id: fromItemId },
            });
            await tx.upgradeLog.create({
                data: {
                    userId,
                    itemId: fromInventoryItem.itemId,
                    success,
                    chance,
                },
            });
            let newItem = null;
            if (success) {
                newItem = await tx.inventoryItem.create({
                    data: {
                        userId,
                        itemId: toItemId,
                    },
                    include: { item: true },
                });
            }
            return {
                success,
                chance: Math.round(chance),
                item: success ? newItem.item : null,
                message: success
                    ? `Успешно! Вы получили ${toItem.name}`
                    : `Неудача. Предмет утерян. Шанс был ${Math.round(chance)}%`,
            };
        });
    }
    async getAvailableUpgrades(itemId) {
        const item = await this.prisma.item.findUnique({
            where: { id: itemId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Предмет не найден');
        }
        const upgrades = await this.prisma.item.findMany({
            where: {
                basePrice: { gt: item.basePrice },
                isActive: true,
            },
            orderBy: { basePrice: 'asc' },
            take: 20,
        });
        return upgrades.map(upgrade => {
            const priceDiff = upgrade.basePrice - item.basePrice;
            const priceRatio = priceDiff / item.basePrice;
            let chance = 50 - (priceRatio * 30);
            chance = Math.max(5, Math.min(80, chance));
            return {
                ...upgrade,
                chance: Math.round(chance),
                priceDiff: priceDiff,
            };
        });
    }
};
exports.UpgradesService = UpgradesService;
exports.UpgradesService = UpgradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], UpgradesService);


/***/ }),

/***/ "./backend/users/users.controller.ts":
/*!*******************************************!*\
  !*** ./backend/users/users.controller.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const multer_1 = __webpack_require__(/*! multer */ "multer");
const uuid_1 = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist-node/index.js");
const path_1 = __webpack_require__(/*! path */ "path");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./backend/users/users.service.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../auth/guards/jwt-auth.guard */ "./backend/auth/guards/jwt-auth.guard.ts");
const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'video/mp4',
];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4'];
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getProfile(req) {
        return this.usersService.getProfile(req.user.id);
    }
    getStats(req) {
        return this.usersService.getStats(req.user.id);
    }
    getUserProfile(id) {
        return this.usersService.getProfile(id);
    }
    getUserStats(id) {
        return this.usersService.getStats(id);
    }
    async uploadAvatar(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('Файл не загружен');
        }
        return this.usersService.updateAvatar(req.user.id, file.filename);
    }
    deleteAvatar(req) {
        return this.usersService.deleteAvatar(req.user.id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Post)('avatar/upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const uniqueId = (0, uuid_1.v4)().substring(0, 15);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${uniqueId}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
                return cb(new common_1.BadRequestException('Недопустимый формат файла. Разрешены: png, jpg, jpeg, webp, gif, mp4'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('avatar/delete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteAvatar", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], UsersController);


/***/ }),

/***/ "./backend/users/users.module.ts":
/*!***************************************!*\
  !*** ./backend/users/users.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./backend/users/users.service.ts");
const users_controller_1 = __webpack_require__(/*! ./users.controller */ "./backend/users/users.controller.ts");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                dest: './uploads/avatars',
            }),
        ],
        providers: [users_service_1.UsersService],
        controllers: [users_controller_1.UsersController],
        exports: [users_service_1.UsersService],
    })
], UsersModule);


/***/ }),

/***/ "./backend/users/users.service.ts":
/*!****************************************!*\
  !*** ./backend/users/users.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/prisma/prisma.service.ts");
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    deleteAvatarFile(filename) {
        if (!filename)
            return;
        const filePath = path.join(process.cwd(), 'uploads', 'avatars', filename);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            }
            catch (error) {
                console.error('Ошибка при удалении файла аватара:', error);
            }
        }
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                balance: true,
                role: true,
                avatar: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        return user;
    }
    async getStats(userId) {
        const [totalDrops, totalSpent, inventoryCount, recentDrops] = await Promise.all([
            this.prisma.itemDrop.count({ where: { userId } }),
            this.prisma.transaction.aggregate({
                where: { userId, type: 'CASE_PURCHASE' },
                _sum: { amount: true },
            }),
            this.prisma.inventoryItem.count({
                where: { userId, isSold: false },
            }),
            this.prisma.itemDrop.findMany({
                where: { userId },
                include: {
                    item: true,
                    case: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);
        const soldItems = await this.prisma.inventoryItem.findMany({
            where: { userId, isSold: true },
            select: { soldPrice: true },
        });
        const totalWon = soldItems.reduce((sum, item) => sum + (item.soldPrice || 0), 0);
        return {
            totalDrops,
            totalSpent: Math.abs(totalSpent._sum.amount || 0),
            totalWon,
            inventoryCount,
            recentDrops,
        };
    }
    async updateAvatar(userId, filename) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true },
        });
        if (user?.avatar) {
            this.deleteAvatarFile(user.avatar);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { avatar: filename },
            select: {
                id: true,
                email: true,
                username: true,
                balance: true,
                role: true,
                avatar: true,
            },
        });
    }
    async deleteAvatar(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true },
        });
        if (user?.avatar) {
            this.deleteAvatarFile(user.avatar);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { avatar: null },
            select: {
                id: true,
                email: true,
                username: true,
                balance: true,
                role: true,
                avatar: true,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], UsersService);


/***/ }),

/***/ "./backend/websocket/crash.gateway.ts":
/*!********************************************!*\
  !*** ./backend/websocket/crash.gateway.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CrashGateway_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrashGateway = void 0;
const websockets_1 = __webpack_require__(/*! @nestjs/websockets */ "@nestjs/websockets");
const socket_io_1 = __webpack_require__(/*! socket.io */ "socket.io");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const crash_service_1 = __webpack_require__(/*! ../crash/crash.service */ "./backend/crash/crash.service.ts");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
let CrashGateway = CrashGateway_1 = class CrashGateway {
    constructor(crashService, jwtService) {
        this.crashService = crashService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(CrashGateway_1.name);
        this.logger.log('CrashGateway initialized');
        setTimeout(() => {
            this.startGameLoop();
        }, 1000);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        const state = this.crashService.getRoundState();
        client.emit('round_state', state);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handlePlaceBet(client, data) {
        try {
            const payload = this.jwtService.verify(data.token, {
                secret: process.env.JWT_SECRET || 'your-secret-key',
            });
            const userId = payload.sub;
            const username = payload.username;
            const result = await this.crashService.placeBet(userId, username, data.amount, data.type, data.autoCashout, data.itemId);
            if (result.success) {
                client.emit('bet_placed', {
                    success: true,
                    newBalance: result.newBalance,
                });
                this.broadcastRoundState();
            }
            else {
                client.emit('bet_error', { error: result.error });
            }
        }
        catch (error) {
            this.logger.error(`Error placing bet: ${error.message}`);
            if (error.name === 'TokenExpiredError') {
                client.emit('bet_error', { error: 'Токен истек, войдите заново' });
            }
            else if (error.name === 'JsonWebTokenError') {
                client.emit('bet_error', { error: 'Неверный токен' });
            }
            else {
                client.emit('bet_error', { error: 'Ошибка при размещении ставки' });
            }
        }
    }
    async handleCashout(client, data) {
        try {
            const payload = this.jwtService.verify(data.token, {
                secret: process.env.JWT_SECRET || 'your-secret-key',
            });
            const userId = payload.sub;
            const result = await this.crashService.cashout(userId);
            if (result.success) {
                client.emit('cashout_success', {
                    multiplier: result.multiplier,
                    profit: result.profit,
                    newBalance: result.newBalance,
                });
                this.broadcastRoundState();
            }
            else {
                client.emit('cashout_error', { error: result.error });
            }
        }
        catch (error) {
            this.logger.error(`Error cashing out: ${error.message}`);
            if (error.name === 'TokenExpiredError') {
                client.emit('cashout_error', { error: 'Токен истек, войдите заново' });
            }
            else {
                client.emit('cashout_error', { error: 'Ошибка при выводе' });
            }
        }
    }
    startGameLoop() {
        this.logger.log('Starting Crash game loop');
        const runGameCycle = async () => {
            try {
                const round = this.crashService.getCurrentRound();
                switch (round.state) {
                    case crash_service_1.RoundState.COUNTDOWN:
                        if (!round.countdownStartTime) {
                            await this.crashService.startCountdown();
                            this.server.emit('countdown_start', {
                                startTimestamp: Date.now(),
                                duration: 10000,
                            });
                            this.broadcastRoundState();
                        }
                        setTimeout(async () => {
                            await this.crashService.startRound();
                            runGameCycle();
                        }, 10000);
                        break;
                    case crash_service_1.RoundState.RUNNING:
                        this.server.emit('round_start', {
                            startTimestamp: Date.now(),
                            initialMultiplier: 1.00,
                        });
                        this.broadcastRoundState();
                        this.startAutoCashoutChecker();
                        const crashMultiplier = round.crashMultiplier;
                        const crashTime = Math.log(crashMultiplier) * 10000;
                        setTimeout(async () => {
                            await this.crashService.crashRound();
                            runGameCycle();
                        }, crashTime);
                        break;
                    case crash_service_1.RoundState.CRASH:
                        this.stopAutoCashoutChecker();
                        this.server.emit('round_crash', {
                            crashMultiplier: round.crashMultiplier,
                            crashTimestamp: Date.now(),
                        });
                        this.broadcastRoundState();
                        setTimeout(async () => {
                            await this.crashService.startPostCrashWait();
                            this.server.emit('post_crash_wait', {
                                startTimestamp: Date.now(),
                                duration: 3000,
                            });
                            this.broadcastRoundState();
                            setTimeout(() => runGameCycle(), 3000);
                        }, 100);
                        break;
                    case crash_service_1.RoundState.POST_CRASH_WAIT:
                        await this.crashService.resetRound();
                        this.server.emit('round_reset', {
                            startTimestamp: Date.now(),
                        });
                        this.broadcastRoundState();
                        setTimeout(() => runGameCycle(), 1000);
                        break;
                    case crash_service_1.RoundState.RESET:
                        await this.crashService.prepareNextRound();
                        const results = this.crashService.getRoundState();
                        this.server.emit('round_end', {
                            crashMultiplier: round.crashMultiplier,
                            bets: results.bets,
                            history: results.history,
                        });
                        this.broadcastRoundState();
                        setTimeout(() => runGameCycle(), 100);
                        break;
                }
            }
            catch (error) {
                this.logger.error(`Game loop error: ${error.message}`);
                setTimeout(() => runGameCycle(), 1000);
            }
        };
        runGameCycle();
    }
    startAutoCashoutChecker() {
        this.autoCashoutInterval = setInterval(async () => {
            const autoCashouts = await this.crashService.checkAutoCashouts();
            if (autoCashouts && autoCashouts.length > 0) {
                for (const cashout of autoCashouts) {
                    this.server.emit('auto_cashout_success', {
                        userId: cashout.userId,
                        username: cashout.username,
                        multiplier: cashout.multiplier,
                        profit: cashout.profit,
                        newBalance: cashout.newBalance,
                    });
                }
                this.broadcastRoundState();
            }
        }, 50);
    }
    stopAutoCashoutChecker() {
        if (this.autoCashoutInterval) {
            clearInterval(this.autoCashoutInterval);
            this.autoCashoutInterval = null;
        }
    }
    broadcastRoundState() {
        const state = this.crashService.getRoundState();
        this.server.emit('round_state', state);
    }
    broadcastMultiplierUpdate() {
        const round = this.crashService.getCurrentRound();
        if (round.state === crash_service_1.RoundState.RUNNING) {
            const multiplier = this.crashService.getCurrentMultiplier();
            this.server.emit('multiplier_update', {
                multiplier,
                serverTime: Date.now(),
            });
        }
    }
};
exports.CrashGateway = CrashGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_c = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _c : Object)
], CrashGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('place_bet'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", Promise)
], CrashGateway.prototype, "handlePlaceBet", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('cashout'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", Promise)
], CrashGateway.prototype, "handleCashout", null);
exports.CrashGateway = CrashGateway = CrashGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:4001', 'http://localhost:3000', 'http://localhost:4000'],
            credentials: true,
        },
        namespace: '/crash',
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof crash_service_1.CrashService !== "undefined" && crash_service_1.CrashService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object])
], CrashGateway);


/***/ }),

/***/ "./backend/websocket/websocket.gateway.ts":
/*!************************************************!*\
  !*** ./backend/websocket/websocket.gateway.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebsocketGateway = void 0;
const websockets_1 = __webpack_require__(/*! @nestjs/websockets */ "@nestjs/websockets");
const socket_io_1 = __webpack_require__(/*! socket.io */ "socket.io");
let WebsocketGateway = class WebsocketGateway {
    constructor() {
        this.onlineUsers = new Map();
        this.recentWins = [];
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
        if (this.recentWins.length > 0) {
            client.emit('recentWins', this.recentWins);
            console.log(`Sent ${this.recentWins.length} recent wins to client ${client.id}`);
        }
        this.broadcastOnlineCount();
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        this.onlineUsers.delete(client.id);
        this.broadcastOnlineCount();
    }
    handleUserOnline(client, userId) {
        this.onlineUsers.set(client.id, userId);
        this.broadcastOnlineCount();
        console.log(`User ${userId} is online. Total online: ${this.onlineUsers.size}`);
    }
    handleUserOffline(client) {
        this.onlineUsers.delete(client.id);
        this.broadcastOnlineCount();
    }
    broadcastCaseOpened(userId, username, item, caseName, casePrice) {
        const multiplier = casePrice && casePrice > 0 ? item.basePrice / casePrice : 0;
        const winData = {
            id: `${Date.now()}-${userId}`,
            userId,
            username,
            itemName: item.name,
            itemRarity: item.rarity,
            itemPrice: item.basePrice,
            itemIcon: item.icon,
            caseName,
            timestamp: Date.now(),
            multiplier: multiplier > 0 ? multiplier : undefined,
        };
        this.recentWins.unshift(winData);
        if (this.recentWins.length > 35) {
            this.recentWins = this.recentWins.slice(0, 35);
        }
        this.server.emit('itemDropped', winData);
        console.log(`Broadcasted win: ${item.name} (${item.rarity}) by user ${userId} - Total wins in history: ${this.recentWins.length}`);
    }
    broadcastBattleUpdate(battleId, data) {
        this.server.emit(`battle:${battleId}:update`, data);
    }
    broadcastBalanceUpdate(userId, balance) {
        this.server.emit(`user:${userId}:balance`, { balance });
    }
    broadcastOnlineCount() {
        this.server.emit('online:count', {
            count: this.onlineUsers.size,
        });
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('user:online'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _b : Object, String]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleUserOnline", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user:offline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleUserOffline", null);
exports.WebsocketGateway = WebsocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:4001', 'http://localhost:3000'],
            credentials: true,
        },
    })
], WebsocketGateway);


/***/ }),

/***/ "./backend/websocket/websocket.module.ts":
/*!***********************************************!*\
  !*** ./backend/websocket/websocket.module.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebsocketModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const websocket_gateway_1 = __webpack_require__(/*! ./websocket.gateway */ "./backend/websocket/websocket.gateway.ts");
const crash_gateway_1 = __webpack_require__(/*! ./crash.gateway */ "./backend/websocket/crash.gateway.ts");
const crash_module_1 = __webpack_require__(/*! ../crash/crash.module */ "./backend/crash/crash.module.ts");
let WebsocketModule = class WebsocketModule {
};
exports.WebsocketModule = WebsocketModule;
exports.WebsocketModule = WebsocketModule = __decorate([
    (0, common_1.Module)({
        imports: [
            crash_module_1.CrashModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [websocket_gateway_1.WebsocketGateway, crash_gateway_1.CrashGateway],
        exports: [websocket_gateway_1.WebsocketGateway, crash_gateway_1.CrashGateway],
    })
], WebsocketModule);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/passport":
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),

/***/ "@nestjs/platform-express":
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "@nestjs/throttler":
/*!************************************!*\
  !*** external "@nestjs/throttler" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),

/***/ "@nestjs/websockets":
/*!*************************************!*\
  !*** external "@nestjs/websockets" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "cookie-parser":
/*!********************************!*\
  !*** external "cookie-parser" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "helmet":
/*!*************************!*\
  !*** external "helmet" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),

/***/ "multer":
/*!*************************!*\
  !*** external "multer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("multer");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "./node_modules/uuid/dist-node/index.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/dist-node/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MAX: () => (/* reexport safe */ _max_js__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   NIL: () => (/* reexport safe */ _nil_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   parse: () => (/* reexport safe */ _parse_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   stringify: () => (/* reexport safe */ _stringify_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   v1: () => (/* reexport safe */ _v1_js__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   v1ToV6: () => (/* reexport safe */ _v1ToV6_js__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   v3: () => (/* reexport safe */ _v3_js__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   v4: () => (/* reexport safe */ _v4_js__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   v5: () => (/* reexport safe */ _v5_js__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   v6: () => (/* reexport safe */ _v6_js__WEBPACK_IMPORTED_MODULE_9__["default"]),
/* harmony export */   v6ToV1: () => (/* reexport safe */ _v6ToV1_js__WEBPACK_IMPORTED_MODULE_10__["default"]),
/* harmony export */   v7: () => (/* reexport safe */ _v7_js__WEBPACK_IMPORTED_MODULE_11__["default"]),
/* harmony export */   validate: () => (/* reexport safe */ _validate_js__WEBPACK_IMPORTED_MODULE_12__["default"]),
/* harmony export */   version: () => (/* reexport safe */ _version_js__WEBPACK_IMPORTED_MODULE_13__["default"])
/* harmony export */ });
/* harmony import */ var _max_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./max.js */ "./node_modules/uuid/dist-node/max.js");
/* harmony import */ var _nil_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./nil.js */ "./node_modules/uuid/dist-node/nil.js");
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist-node/parse.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist-node/stringify.js");
/* harmony import */ var _v1_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./v1.js */ "./node_modules/uuid/dist-node/v1.js");
/* harmony import */ var _v1ToV6_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./v1ToV6.js */ "./node_modules/uuid/dist-node/v1ToV6.js");
/* harmony import */ var _v3_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./v3.js */ "./node_modules/uuid/dist-node/v3.js");
/* harmony import */ var _v4_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./v4.js */ "./node_modules/uuid/dist-node/v4.js");
/* harmony import */ var _v5_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./v5.js */ "./node_modules/uuid/dist-node/v5.js");
/* harmony import */ var _v6_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./v6.js */ "./node_modules/uuid/dist-node/v6.js");
/* harmony import */ var _v6ToV1_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./v6ToV1.js */ "./node_modules/uuid/dist-node/v6ToV1.js");
/* harmony import */ var _v7_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./v7.js */ "./node_modules/uuid/dist-node/v7.js");
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist-node/validate.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./version.js */ "./node_modules/uuid/dist-node/version.js");
















/***/ }),

/***/ "./node_modules/uuid/dist-node/max.js":
/*!********************************************!*\
  !*** ./node_modules/uuid/dist-node/max.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ('ffffffff-ffff-ffff-ffff-ffffffffffff');


/***/ }),

/***/ "./node_modules/uuid/dist-node/md5.js":
/*!********************************************!*\
  !*** ./node_modules/uuid/dist-node/md5.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:crypto */ "node:crypto");

function md5(bytes) {
    if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
    }
    else if (typeof bytes === 'string') {
        bytes = Buffer.from(bytes, 'utf8');
    }
    return (0,node_crypto__WEBPACK_IMPORTED_MODULE_0__.createHash)('md5').update(bytes).digest();
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (md5);


/***/ }),

/***/ "./node_modules/uuid/dist-node/native.js":
/*!***********************************************!*\
  !*** ./node_modules/uuid/dist-node/native.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:crypto */ "node:crypto");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ randomUUID: node_crypto__WEBPACK_IMPORTED_MODULE_0__.randomUUID });


/***/ }),

/***/ "./node_modules/uuid/dist-node/nil.js":
/*!********************************************!*\
  !*** ./node_modules/uuid/dist-node/nil.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ('00000000-0000-0000-0000-000000000000');


/***/ }),

/***/ "./node_modules/uuid/dist-node/parse.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/dist-node/parse.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist-node/validate.js");

function parse(uuid) {
    if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
        throw TypeError('Invalid UUID');
    }
    let v;
    return Uint8Array.of((v = parseInt(uuid.slice(0, 8), 16)) >>> 24, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff, (v = parseInt(uuid.slice(9, 13), 16)) >>> 8, v & 0xff, (v = parseInt(uuid.slice(14, 18), 16)) >>> 8, v & 0xff, (v = parseInt(uuid.slice(19, 23), 16)) >>> 8, v & 0xff, ((v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff, (v / 0x100000000) & 0xff, (v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (parse);


/***/ }),

/***/ "./node_modules/uuid/dist-node/regex.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/dist-node/regex.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i);


/***/ }),

/***/ "./node_modules/uuid/dist-node/rng.js":
/*!********************************************!*\
  !*** ./node_modules/uuid/dist-node/rng.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:crypto */ "node:crypto");

const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
function rng() {
    if (poolPtr > rnds8Pool.length - 16) {
        (0,node_crypto__WEBPACK_IMPORTED_MODULE_0__.randomFillSync)(rnds8Pool);
        poolPtr = 0;
    }
    return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}


/***/ }),

/***/ "./node_modules/uuid/dist-node/sha1.js":
/*!*********************************************!*\
  !*** ./node_modules/uuid/dist-node/sha1.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:crypto */ "node:crypto");

function sha1(bytes) {
    if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
    }
    else if (typeof bytes === 'string') {
        bytes = Buffer.from(bytes, 'utf8');
    }
    return (0,node_crypto__WEBPACK_IMPORTED_MODULE_0__.createHash)('sha1').update(bytes).digest();
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sha1);


/***/ }),

/***/ "./node_modules/uuid/dist-node/stringify.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist-node/stringify.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   unsafeStringify: () => (/* binding */ unsafeStringify)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist-node/validate.js");

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);


/***/ }),

/***/ "./node_modules/uuid/dist-node/v1.js":
/*!*******************************************!*\
  !*** ./node_modules/uuid/dist-node/v1.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   updateV1State: () => (/* binding */ updateV1State)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist-node/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist-node/stringify.js");


const _state = {};
function v1(options, buf, offset) {
    let bytes;
    const isV6 = options?._v6 ?? false;
    if (options) {
        const optionsKeys = Object.keys(options);
        if (optionsKeys.length === 1 && optionsKeys[0] === '_v6') {
            options = undefined;
        }
    }
    if (options) {
        bytes = v1Bytes(options.random ?? options.rng?.() ?? (0,_rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])(), options.msecs, options.nsecs, options.clockseq, options.node, buf, offset);
    }
    else {
        const now = Date.now();
        const rnds = (0,_rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])();
        updateV1State(_state, now, rnds);
        bytes = v1Bytes(rnds, _state.msecs, _state.nsecs, isV6 ? undefined : _state.clockseq, isV6 ? undefined : _state.node, buf, offset);
    }
    return buf ?? (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.unsafeStringify)(bytes);
}
function updateV1State(state, now, rnds) {
    state.msecs ??= -Infinity;
    state.nsecs ??= 0;
    if (now === state.msecs) {
        state.nsecs++;
        if (state.nsecs >= 10000) {
            state.node = undefined;
            state.nsecs = 0;
        }
    }
    else if (now > state.msecs) {
        state.nsecs = 0;
    }
    else if (now < state.msecs) {
        state.node = undefined;
    }
    if (!state.node) {
        state.node = rnds.slice(10, 16);
        state.node[0] |= 0x01;
        state.clockseq = ((rnds[8] << 8) | rnds[9]) & 0x3fff;
    }
    state.msecs = now;
    return state;
}
function v1Bytes(rnds, msecs, nsecs, clockseq, node, buf, offset = 0) {
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    if (!buf) {
        buf = new Uint8Array(16);
        offset = 0;
    }
    else {
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
    }
    msecs ??= Date.now();
    nsecs ??= 0;
    clockseq ??= ((rnds[8] << 8) | rnds[9]) & 0x3fff;
    node ??= rnds.slice(10, 16);
    msecs += 12219292800000;
    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    buf[offset++] = (tl >>> 24) & 0xff;
    buf[offset++] = (tl >>> 16) & 0xff;
    buf[offset++] = (tl >>> 8) & 0xff;
    buf[offset++] = tl & 0xff;
    const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
    buf[offset++] = (tmh >>> 8) & 0xff;
    buf[offset++] = tmh & 0xff;
    buf[offset++] = ((tmh >>> 24) & 0xf) | 0x10;
    buf[offset++] = (tmh >>> 16) & 0xff;
    buf[offset++] = (clockseq >>> 8) | 0x80;
    buf[offset++] = clockseq & 0xff;
    for (let n = 0; n < 6; ++n) {
        buf[offset++] = node[n];
    }
    return buf;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v1);


/***/ }),

/***/ "./node_modules/uuid/dist-node/v1ToV6.js":
/*!***********************************************!*\
  !*** ./node_modules/uuid/dist-node/v1ToV6.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ v1ToV6)
/* harmony export */ });
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist-node/parse.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist-node/stringify.js");


function v1ToV6(uuid) {
    const v1Bytes = typeof uuid === 'string' ? (0,_parse_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid) : uuid;
    const v6Bytes = _v1ToV6(v1Bytes);
    return typeof uuid === 'string' ? (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.unsafeStringify)(v6Bytes) : v6Bytes;
}
function _v1ToV6(v1Bytes) {
    return Uint8Array.of(((v1Bytes[6] & 0x0f) << 4) | ((v1Bytes[7] >> 4) & 0x0f), ((v1Bytes[7] & 0x0f) << 4) | ((v1Bytes[4] & 0xf0) >> 4), ((v1Bytes[4] & 0x0f) << 4) | ((v1Bytes[5] & 0xf0) >> 4), ((v1Bytes[5] & 0x0f) << 4) | ((v1Bytes[0] & 0xf0) >> 4), ((v1Bytes[0] & 0x0f) << 4) | ((v1Bytes[1] & 0xf0) >> 4), ((v1Bytes[1] & 0x0f) << 4) | ((v1Bytes[2] & 0xf0) >> 4), 0x60 | (v1Bytes[2] & 0x0f), v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
}


/***/ }),

/***/ "./node_modules/uuid/dist-node/v3.js":
/*!*******************************************!*\
  !*** ./node_modules/uuid/dist-node/v3.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DNS: () => (/* reexport safe */ _v35_js__WEBPACK_IMPORTED_MODULE_0__.DNS),
/* harmony export */   URL: () => (/* reexport safe */ _v35_js__WEBPACK_IMPORTED_MODULE_0__.URL),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _md5_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./md5.js */ "./node_modules/uuid/dist-node/md5.js");
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist-node/v35.js");



function v3(value, namespace, buf, offset) {
    return (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])(0x30, _md5_js__WEBPACK_IMPORTED_MODULE_1__["default"], value, namespace, buf, offset);
}
v3.DNS = _v35_js__WEBPACK_IMPORTED_MODULE_0__.DNS;
v3.URL = _v35_js__WEBPACK_IMPORTED_MODULE_0__.URL;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v3);


/***/ }),

/***/ "./node_modules/uuid/dist-node/v35.js":
/*!********************************************!*\
  !*** ./node_modules/uuid/dist-node/v35.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DNS: () => (/* binding */ DNS),
/* harmony export */   URL: () => (/* binding */ URL),
/* harmony export */   "default": () => (/* binding */ v35),
/* harmony export */   stringToBytes: () => (/* binding */ stringToBytes)
/* harmony export */ });
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist-node/parse.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist-node/stringify.js");


function stringToBytes(str) {
    str = unescape(encodeURIComponent(str));
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; ++i) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}
const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
function v35(version, hash, value, namespace, buf, offset) {
    const valueBytes = typeof value === 'string' ? stringToBytes(value) : value;
    const namespaceBytes = typeof namespace === 'string' ? (0,_parse_js__WEBPACK_IMPORTED_MODULE_0__["default"])(namespace) : namespace;
    if (typeof namespace === 'string') {
        namespace = (0,_parse_js__WEBPACK_IMPORTED_MODULE_0__["default"])(namespace);
    }
    if (namespace?.length !== 16) {
        throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    }
    let bytes = new Uint8Array(16 + valueBytes.length);
    bytes.set(namespaceBytes);
    bytes.set(valueBytes, namespaceBytes.length);
    bytes = hash(bytes);
    bytes[6] = (bytes[6] & 0x0f) | version;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    if (buf) {
        offset = offset || 0;
        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = bytes[i];
        }
        return buf;
    }
    return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.unsafeStringify)(bytes);
}


/***/ }),

/***/ "./node_modules/uuid/dist-node/v4.js":
/*!*******************************************!*\
  !*** ./node_modules/uuid/dist-node/v4.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _native_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./native.js */ "./node_modules/uuid/dist-node/native.js");
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist-node/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist-node/stringify.js");



function _v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? (0,_rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.unsafeStringify)(rnds);
}
function v4(options, buf, offset) {
    if (_native_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomUUID && !buf && !options) {
        return _native_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomUUID();
    }
    return _v4(options, buf, offset);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);


/***/ }),

/***/ "./node_modules/uuid/dist-node/v5.js":
/*!*******************************************!*\
  !*** ./node_modules/uuid/dist-node/v5.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DNS: () => (/* reexport safe */ _v35_js__WEBPACK_IMPORTED_MODULE_0__.DNS),
/* harmony export */   URL: () => (/* reexport safe */ _v35_js__WEBPACK_IMPORTED_MODULE_0__.URL),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _sha1_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sha1.js */ "./node_modules/uuid/dist-node/sha1.js");
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist-node/v35.js");



function v5(value, namespace, buf, offset) {
    return (0,_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])(0x50, _sha1_js__WEBPACK_IMPORTED_MODULE_1__["default"], value, namespace, buf, offset);
}
v5.DNS = _v35_js__WEBPACK_IMPORTED_MODULE_0__.DNS;
v5.URL = _v35_js__WEBPACK_IMPORTED_MODULE_0__.URL;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v5);


/***/ }),

/***/ "./node_modules/uuid/dist-node/v6.js":
/*!*******************************************!*\
  !*** ./node_modules/uuid/dist-node/v6.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist-node/stringify.js");
/* harmony import */ var _v1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v1.js */ "./node_modules/uuid/dist-node/v1.js");
/* harmony import */ var _v1ToV6_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./v1ToV6.js */ "./node_modules/uuid/dist-node/v1ToV6.js");



function v6(options, buf, offset) {
    options ??= {};
    offset ??= 0;
    let bytes = (0,_v1_js__WEBPACK_IMPORTED_MODULE_0__["default"])({ ...options, _v6: true }, new Uint8Array(16));
    bytes = (0,_v1ToV6_js__WEBPACK_IMPORTED_MODULE_1__["default"])(bytes);
    if (buf) {
        for (let i = 0; i < 16; i++) {
            buf[offset + i] = bytes[i];
        }
        return buf;
    }
    return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.unsafeStringify)(bytes);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v6);


/***/ }),

/***/ "./node_modules/uuid/dist-node/v6ToV1.js":
/*!***********************************************!*\
  !*** ./node_modules/uuid/dist-node/v6ToV1.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ v6ToV1)
/* harmony export */ });
/* harmony import */ var _parse_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist-node/parse.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist-node/stringify.js");


function v6ToV1(uuid) {
    const v6Bytes = typeof uuid === 'string' ? (0,_parse_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid) : uuid;
    const v1Bytes = _v6ToV1(v6Bytes);
    return typeof uuid === 'string' ? (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.unsafeStringify)(v1Bytes) : v1Bytes;
}
function _v6ToV1(v6Bytes) {
    return Uint8Array.of(((v6Bytes[3] & 0x0f) << 4) | ((v6Bytes[4] >> 4) & 0x0f), ((v6Bytes[4] & 0x0f) << 4) | ((v6Bytes[5] & 0xf0) >> 4), ((v6Bytes[5] & 0x0f) << 4) | (v6Bytes[6] & 0x0f), v6Bytes[7], ((v6Bytes[1] & 0x0f) << 4) | ((v6Bytes[2] & 0xf0) >> 4), ((v6Bytes[2] & 0x0f) << 4) | ((v6Bytes[3] & 0xf0) >> 4), 0x10 | ((v6Bytes[0] & 0xf0) >> 4), ((v6Bytes[0] & 0x0f) << 4) | ((v6Bytes[1] & 0xf0) >> 4), v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
}


/***/ }),

/***/ "./node_modules/uuid/dist-node/v7.js":
/*!*******************************************!*\
  !*** ./node_modules/uuid/dist-node/v7.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   updateV7State: () => (/* binding */ updateV7State)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist-node/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist-node/stringify.js");


const _state = {};
function v7(options, buf, offset) {
    let bytes;
    if (options) {
        bytes = v7Bytes(options.random ?? options.rng?.() ?? (0,_rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])(), options.msecs, options.seq, buf, offset);
    }
    else {
        const now = Date.now();
        const rnds = (0,_rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])();
        updateV7State(_state, now, rnds);
        bytes = v7Bytes(rnds, _state.msecs, _state.seq, buf, offset);
    }
    return buf ?? (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.unsafeStringify)(bytes);
}
function updateV7State(state, now, rnds) {
    state.msecs ??= -Infinity;
    state.seq ??= 0;
    if (now > state.msecs) {
        state.seq = (rnds[6] << 23) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
        state.msecs = now;
    }
    else {
        state.seq = (state.seq + 1) | 0;
        if (state.seq === 0) {
            state.msecs++;
        }
    }
    return state;
}
function v7Bytes(rnds, msecs, seq, buf, offset = 0) {
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    if (!buf) {
        buf = new Uint8Array(16);
        offset = 0;
    }
    else {
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
    }
    msecs ??= Date.now();
    seq ??= ((rnds[6] * 0x7f) << 24) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
    buf[offset++] = (msecs / 0x10000000000) & 0xff;
    buf[offset++] = (msecs / 0x100000000) & 0xff;
    buf[offset++] = (msecs / 0x1000000) & 0xff;
    buf[offset++] = (msecs / 0x10000) & 0xff;
    buf[offset++] = (msecs / 0x100) & 0xff;
    buf[offset++] = msecs & 0xff;
    buf[offset++] = 0x70 | ((seq >>> 28) & 0x0f);
    buf[offset++] = (seq >>> 20) & 0xff;
    buf[offset++] = 0x80 | ((seq >>> 14) & 0x3f);
    buf[offset++] = (seq >>> 6) & 0xff;
    buf[offset++] = ((seq << 2) & 0xff) | (rnds[10] & 0x03);
    buf[offset++] = rnds[11];
    buf[offset++] = rnds[12];
    buf[offset++] = rnds[13];
    buf[offset++] = rnds[14];
    buf[offset++] = rnds[15];
    return buf;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v7);


/***/ }),

/***/ "./node_modules/uuid/dist-node/validate.js":
/*!*************************************************!*\
  !*** ./node_modules/uuid/dist-node/validate.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist-node/regex.js");

function validate(uuid) {
    return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);


/***/ }),

/***/ "./node_modules/uuid/dist-node/version.js":
/*!************************************************!*\
  !*** ./node_modules/uuid/dist-node/version.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist-node/validate.js");

function version(uuid) {
    if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
        throw TypeError('Invalid UUID');
    }
    return parseInt(uuid.slice(14, 15), 16);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (version);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./backend/main.ts");
/******/ 	
/******/ })()
;