process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");


const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon")

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/***********************************************  Token tests */
describe('POST /auth/token', () => {
    test("working", async () => {
        const res = await request(app)
        .post(`/auth/token`)
        .send({username: "u1", password: "password1", });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({"token": expect.any(String)});
    });
});


describe('POST /auth/register', () => {
    test(" works for not signed in", async () => {
        const res = await request(app)
        .post(`/auth/register`)
        .send({username: "test3", password: "secret3", firstName: "testing", lastName: "user2", email: "testUser2@gmail.com"});
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({"token": expect.any(String)});
    });
});
/** one with missing and one with invalid */



/** wrong user, wrong password, missing data and invalid data */

