import { Apply, Controller, Post, Sanitize, RequestX, TokenData } from '~/server';
import { tokenAuth } from '~/middlewares';
import { AuthCore } from '~/core/auth';
import { loginRule, resetPasswordRule } from '~/rules';

@Controller('auth')
class AuthController {
    constructor(private authCore: AuthCore) { }

    @Post('login')
    @Sanitize(loginRule)
    public login(req: RequestX) {
        return this.authCore.login(req.payload);
    }

    @Post('reset-password')
    @Apply(tokenAuth)
    @Sanitize(resetPasswordRule)
    public resetPassword(req: RequestX) {
        return this.authCore.resetPassword(req.payload, req.tokenData as TokenData);
    }
}

export { AuthController };