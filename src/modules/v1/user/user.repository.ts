import { AnyColumn, and, asc, desc, eq, gt, like } from 'drizzle-orm';
import { getAffectedRows, getInsertId, selectCount } from '~/utils';
import { testDB, testSchema } from '~/database';
import { appConfig } from '~/config';
import { RepoGuard, Result } from '~/modules/shared';
import {
    CreateUserPayload, UpdateUserPayload,
    UserListPayload, UserRecord
} from './entities/type';

class UserRepository {

    @RepoGuard
    public async findManyUsers(userListPayload: UserListPayload): Promise<Result<{
        userRecord: UserRecord[];
        totalRecords: number;
    }>> {
        const { page, limit, sortBy, sortType, searchTerm } = userListPayload;
        const offset = (page - 1) * limit;
        const take = limit;

        let sortByColumn: AnyColumn = testSchema.user.createdAt;
        if (sortBy === 'name') sortByColumn = testSchema.user.name;
        if (sortBy === 'email') sortByColumn = testSchema.user.email;
        if (sortBy === 'roleId') sortByColumn = testSchema.user.roleId;

        const isAscending = sortType.toUpperCase() === 'ASC';
        const orderByExpression = isAscending ? asc(sortByColumn) : desc(sortByColumn);

        const totalRecords = await testDB
            .select(selectCount)
            .from(testSchema.user)
            .where(
                and(
                    like(testSchema.user.name, `%${searchTerm}%`),
                    eq(testSchema.user.statusId, appConfig.status.active),
                )
            );

        const userRecord = await testDB
            .select({
                id: testSchema.user.id,
                name: testSchema.user.name,
                phone: testSchema.user.phone,
                email: testSchema.user.email,
                roleId: testSchema.user.roleId,
                statusId: testSchema.user.statusId,
                createdAt: testSchema.user.createdAt,
            })
            .from(testSchema.user)
            .where(
                and(
                    eq(testSchema.user.statusId, appConfig.status.active),
                    offset ? gt(testSchema.user.id, offset) : undefined,
                    searchTerm ? like(testSchema.user.name, `%${searchTerm}%`) : undefined,
                ))
            .limit(take)
            .orderBy(orderByExpression);

        return { data: { totalRecords: totalRecords[0].count, userRecord } };
    }

    @RepoGuard
    public async insertUser(UserData: CreateUserPayload): Promise<Result<{ id: number; }>> {
        const userRecord = await testDB.insert(testSchema.user).values(UserData);
        return {
            data: {
                id: getInsertId(userRecord)
            }
        };
    }

    @RepoGuard
    public async updateUser({ id, ...rest }: UpdateUserPayload): Promise<Result<{ id: number; }>> {
        const updateQuery = await testDB.update(testSchema.user).set(rest).where(eq(testSchema.user.id, id));

        const updatedRows = getAffectedRows(updateQuery);
        if (!updatedRows) return { code: 404 };

        return {
            data: { id, ...rest }
        };
    }

    @RepoGuard
    public async deleteUser(id: number): Promise<Result<{ id: number; }>> {
        const deleteQuery = await testDB
            .update(testSchema.user)
            .set({ statusId: appConfig.status.inactive })
            .where(eq(testSchema.user.id, id));

        const updatedRows = getAffectedRows(deleteQuery);
        if (!updatedRows) return { code: 404 };

        return {
            data: { id }
        };
    }
}

export { UserRepository };