'use strict';

export default function (router) {
    const users = require('../controllers/user-controller');
    const middleware = require('../shared/middleware');

    // No role required
    router.post('/register', users.create_user);
    router.post('/login', users.login_user);
    router.get('/user/activation/:token', users.activate_a_user);
    router.post(
        '/user/reset-password-with-email',
        users.request_password_reset
    );
    router.get(
        '/user/reset-password/:token',
        users.validate_reset_password_token
    );
    router.post('/user/reset-password/:token', users.reset_user_password);

    // User role required
    router
        .get('/user', middleware.protectedUserRoute, users.read_user)
        .put('/user', middleware.protectedUserRoute, users.update_user)
        .delete('/user', middleware.protectedUserRoute, users.delete_user);
    router
        .get(
            '/user/picture',
            middleware.protectedUserRoute,
            users.download_user_picture
        )
        .post(
            '/user/picture',
            middleware.protectedUserRoute,
            users.modify_user_picture
        );

    // Administrator role required
    router.get(
        '/user/list',
        middleware.protectedAdminRoute,
        users.read_all_users
    );
    router
        .get('/user/:id', middleware.protectedAdminRoute, users.read_user)
        .put(
            '/user/:id',
            middleware.protectedAdminRoute,
            users.update_user_as_admin
        )
        .delete(
            '/user/:id',
            middleware.protectedAdminRoute,
            users.delete_user_as_admin
        );
}
