import {
    Controller, Sanitize, Post, Patch, Apply, Get, Delete,
    RequestX, take, ReplayX,
    EnablePassThrough
} from '~/server';
import { adminAuth, tokenAuth } from '~/middlewares';
import { UserCore } from '~/core/user';
import { createUserRule, updateAvatarRule, updateUserRule, userListRule } from '~/rules';
import { JobService } from '~/services';

@Controller('user', [tokenAuth])
class UserController {
    constructor(private userCore: UserCore, private jobs: JobService) { }

    @Get()
    @Sanitize(userListRule)
    public userList(req: RequestX) {
        return this.userCore.getUserList(req.payload);
    }

    @Post()
    @Apply(adminAuth)
    @Sanitize(createUserRule)
    public createUser(req: RequestX) {
        return this.userCore.createUser(req.payload);
    }

    @Patch()
    @Apply(adminAuth)
    @Sanitize(updateUserRule)
    public updateUser(req: RequestX) {
        return this.userCore.updateUser(req.payload);
    }

    @Delete(':id/delete')
    @Apply(adminAuth)
    @Sanitize(updateUserRule)
    public deleteUser(req: RequestX) {
        return this.userCore.deleteUser(req.payload);
    }

    @Post('update-avatar')
    @Apply([adminAuth])
    @Sanitize(updateAvatarRule)
    @EnablePassThrough
    public updateAvatar(req: RequestX, res: ReplayX) {
        return res.send(req.payload.avatar);
    }

    @Post('queue')
    public async queueUser() {
        const addJob = await this.jobs.addJob('exampleJob', { hello: true });
        return take(addJob ? 200 : 500);
    }

    @Post('queue/v2')
    public async queueUserV2() {
        const addJob = await this.jobs.addJob('otherJob', { hello: false });
        return take(addJob ? 200 : 500);
    }

    @Post('say-hello')
    public async sayHello() {
        const addJob = await this.jobs.addJob('emailJob', { hello: false });
        return take(addJob ? 200 : 500);
    }
}

export { UserController };