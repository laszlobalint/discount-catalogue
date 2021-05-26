'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('../../config');
import app from '../../app';
import 'chai/register-should';
import { SITES } from '../shared/constansts';

chai.use(chaiHttp);
chai.should();
const baseURL = `http://${config.appHost}:${config.appPort}${config.appVersion}`;

describe('Catalogue categories', () => {
    describe('GET /catalogue/categories', () => {
        it('Should get complete list of catalogue item categories', (done) => {
            chai.request(baseURL)
                .get('/catalogue/categories')
                .end((err, res) => {
                    should.exist(res);
                    should.not.exist(err);
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    done();
                });
        });
    });
});

describe('Catalogue users', () => {
    describe('GET /user/list', () => {
        it('Should get complete list of users using admin rights', (done) => {
            chai.request(baseURL)
                .get('/user/list')
                .set('Authorization', `Bearer ${config.tokenAdminForTest}`)
                .end((err, res) => {
                    should.exist(res.body);
                    should.not.exist(err);
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    done();
                });
        });
    });
});

describe('Catalogue items', () => {
    describe('DELETE /catalogue/items/:id', () => {
        it('Should not be able to delete catalogue item with simple user rights', (done) => {
            chai.request(baseURL)
                .delete(
                    `/catalogue/items/${Math.floor(Math.random() * 200) + 1}`
                )
                .set('Authorization', `Bearer ${config.tokenUserForTest}`)
                .end((err, res) => {
                    should.exist(res.body);
                    res.should.have.status(403);
                    done();
                });
        });
    });
});

describe('User registration', () => {
    describe('POST /register', () => {
        it('Should register new user in the database', (done) => {
            const faker = require('faker');
            const user = {
                name: `${faker.name.firstName()} ${faker.name.lastName()}`,
                email: faker.internet.email(),
                password: faker.internet.password(),
                defaultSite: SITES[Math.floor(Math.random() * 5) + 1],
            };
            chai.request(baseURL)
                .post('/register')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(user)
                .end((err, res) => {
                    should.exist(res);
                    should.not.exist(err);
                    res.should.have.status(200);
                    done();
                });
        }).enableTimeouts(false);
    });
});
