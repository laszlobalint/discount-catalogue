'use strict';

export default function (router) {
    const catalogues = require('../controllers/catalogue-controller');
    const middleware = require('../shared/middleware');

    // No role required
    router.get('/catalogue/categories', catalogues.fetch_category_list);

    // User role required
    router.get(
        '/catalogue',
        middleware.protectedUserRoute,
        catalogues.read_all_catalogue_items
    );
    router.post(
        '/catalogue/search',
        middleware.protectedUserRoute,
        catalogues.read_catalogue_items_by_custom_conditions
    );

    // Administrator role required
    router.post(
        '/catalogue',
        middleware.protectedAdminRoute,
        catalogues.create_catalogue_item
    );
    router.put(
        '/catalogue/items/:id',
        middleware.protectedAdminRoute,
        catalogues.update_catalogue_item
    );
    router.delete(
        '/catalogue/items/:id',
        middleware.protectedAdminRoute,
        catalogues.delete_catalogue_item
    );
    router.post(
        '/catalogue/attachment',
        middleware.protectedAdminRoute,
        catalogues.upload_catalogue_item_attachment
    );
}
